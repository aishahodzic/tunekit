"""TuningKit's app backend.

Everything provider-specific (W&B / CoreWeave Forge connection, method and model
catalogues, dataset upload, training, Stop, metrics, checkpoint inference) lives
in the shared Tuning Engine app and is called at /api/services/tuning-engine/v1/.
This service keeps only what is TuningKit's own: Hugging Face linking, PDF text
extraction, the prepared split, benchmark sourcing and evaluation bookkeeping.
TuningKit holds no credentials.
"""
import json
import os
import sys
import base64
import binascii
import io
import math
import re
import time
from pathlib import Path
from datetime import datetime, timezone
import urllib.error
import urllib.parse
import urllib.request

from pypdf import PdfReader

APP_ID = os.environ.get("APP_ID", "")
API_BASE = os.environ.get("API_BASE_URL", "").rstrip("/")
APP_TOKEN = os.environ.get("APP_TOKEN", "")
HF_DATASETS_URL = "https://huggingface.co/api/datasets"
HF_VIEWER_URL = "https://datasets-server.huggingface.co"
MAX_PDF_BYTES = 5 * 1024 * 1024
MAX_PDF_PAGES = 400
EVAL_SAMPLES = 20
RUN_ACTIVE = {"PREPARING", "UPLOADING", "PENDING", "RUNNING"}


class Problem(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


def _public_json(url, *, limit=4 * 1024 * 1024):
    request = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "TuningKit/0.1"})
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            raw = response.read(limit + 1)
        if len(raw) > limit:
            raise Problem(502, "The catalogue returned too much data.")
        return json.loads(raw.decode("utf-8"))
    except Problem:
        raise
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            raise Problem(404, "That dataset was not found.")
        raise Problem(502, "The catalogue could not be reached.")
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        raise Problem(502, "The catalogue could not be reached.")


def _public_text(url, *, limit=512 * 1024):
    request = urllib.request.Request(
        url,
        headers={"Accept": "text/markdown,text/plain", "User-Agent": "TuningKit/0.1"},
    )
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            raw = response.read(limit + 1)
        if len(raw) > limit:
            raise Problem(502, "The provider description returned too much data.")
        return raw.decode("utf-8")
    except Problem:
        raise
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, UnicodeDecodeError):
        raise Problem(502, "CoreWeave capabilities could not be reached.")


def search_huggingface(body):
    query = str((body or {}).get("query") or "").strip()
    if len(query) < 2 or len(query) > 120:
        raise Problem(400, "Enter at least two characters.")
    url = f"{HF_DATASETS_URL}?search={urllib.parse.quote(query)}&limit=8&sort=downloads&direction=-1"
    payload = _public_json(url)
    if not isinstance(payload, list):
        raise Problem(502, "Hugging Face returned invalid search results.")
    results = []
    for item in payload[:8]:
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            continue
        results.append({
            "id": item["id"],
            "downloads": item.get("downloads") or 0,
            "likes": item.get("likes") or 0,
            "private": bool(item.get("private")),
        })
    return {"results": results}


def link_huggingface(body):
    dataset = str((body or {}).get("dataset") or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", dataset):
        raise Problem(400, "Choose a valid Hugging Face dataset.")
    encoded = urllib.parse.quote(dataset, safe="")
    split_payload = _public_json(f"{HF_VIEWER_URL}/splits?dataset={encoded}")
    splits = split_payload.get("splits", []) if isinstance(split_payload, dict) else []
    if not splits:
        raise Problem(400, "This dataset has no previewable split.")
    chosen = next((s for s in splits if s.get("split") == "train"), splits[0])
    config = str(chosen.get("config") or "default")
    split = str(chosen.get("split") or "train")
    rows_url = (
        f"{HF_VIEWER_URL}/rows?dataset={encoded}"
        f"&config={urllib.parse.quote(config, safe='')}&split={urllib.parse.quote(split, safe='')}"
        "&offset=0&length=100"
    )
    rows_payload = _public_json(rows_url)
    raw_rows = rows_payload.get("rows", []) if isinstance(rows_payload, dict) else []
    rows = [item.get("row") for item in raw_rows if isinstance(item, dict) and isinstance(item.get("row"), dict)]
    return {
        "dataset": dataset,
        "config": config,
        "split": split,
        "total_rows": rows_payload.get("num_rows_total", len(rows)),
        "rows": rows,
        "url": f"https://huggingface.co/datasets/{dataset}",
    }


def _finite(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def _store(name):
    return Path(f"/data/apps/{APP_ID}") / name


def _run_record():
    try:
        return json.loads(_store("training-run.json").read_text())
    except (OSError, json.JSONDecodeError):
        return {}


def _saved_weights():
    try:
        return json.loads(_store("saved-weights.json").read_text()).get("items", [])
    except (OSError, json.JSONDecodeError, AttributeError):
        return []


def _eval_targets():
    """Weights the Evaluation step can test: the engine run's checkpoints, plus rescued adapters (download-only)."""
    targets = []
    for item in _saved_weights():
        ref = str(item.get("wandb_artifact") or "")
        match = re.fullmatch(r"([^/]+)/([^/]+)/([^:]+):step(\d+)", ref)
        if match:
            entity, project, collection, step = match.groups()
            targets.append({"id": f"saved:{entity}/{project}/{collection}:{step}", "kind": "saved",
                            "label": f"{item.get('run_label') or item.get('model_name') or collection} · saved step {int(step):,}",
                            "step": int(step), "base_model": item.get("base_model"), "servable": False,
                            "note": "Forge cannot run weights rescued from a deleted run. Use the saved files with vLLM or PEFT."})
    targets.extend(_engine_targets())
    return sorted(targets, key=lambda t: (not t.get("servable"), -t["step"]))


def eval_checkpoints():
    return {"targets": [{k: t.get(k) for k in ("id", "kind", "label", "step", "base_model", "servable", "note")} for t in _eval_targets()],
            "samples": _eval_count()}


def _eval_count():
    entry = next((e for e in _registry()["items"].values() if e.get("data_key") == _run_record().get("data_key")), None)
    return min(EVAL_SAMPLES, int((entry or {}).get("eval_rows") or 0))


def eval_prepare(body):
    target = next((t for t in _eval_targets() if t["id"] == str(body.get("target") or "")), None)
    if not target:
        raise Problem(404, "Those weights are no longer available.")
    if not target.get("servable"):
        raise Problem(409, target.get("note") or "These weights cannot be run.")
    return {"ready": True, "target": target["id"]}


def eval_sample(body):
    """Generate one held-out answer from the chosen weights, or from the untouched base (step 0)."""
    try:
        index = int(body.get("index"))
    except (TypeError, ValueError):
        raise Problem(400, "Choose a sample.")
    if not (0 <= index < max(1, _eval_count())):
        raise Problem(400, "Choose a sample.")
    target = next((t for t in _eval_targets() if t["id"] == str(body.get("target") or "")), None)
    if not target:
        raise Problem(404, "Those weights are no longer available.")
    use_base = body.get("variant") == "base"
    entry = next((e for e in _registry()["items"].values() if e.get("data_key") == _run_record().get("data_key")), None)
    try:
        eval_file = _store((entry or {}).get("files", {})["eval"])
        with eval_file.open() as handle:
            row = next((json.loads(line) for position, line in enumerate(handle) if position == index), None)
    except (OSError, KeyError, TypeError, json.JSONDecodeError):
        raise Problem(404, "This run's dataset has no held-out evaluation file.")
    if not row:
        raise Problem(404, "That held-out example does not exist.")
    messages = row.get("messages") or []
    prompt = next((m.get("content") for m in messages if m.get("role") == "user"), "")
    reference = next((m.get("content") for m in reversed(messages) if m.get("role") == "assistant"), "")
    step = 0 if use_base else target["step"]
    started = time.time()
    output, finish_reason = _complete(target, step, [{"role": "user", "content": prompt}], 256)
    return {"index": index, "variant": "base" if use_base else "tuned", "step": step, "prompt": prompt,
            "reference": reference, "output": output, "finish_reason": finish_reason,
            "latency_s": round(time.time() - started, 2)}


import random as _random

LETTERS = "ABCDE"
BENCHMARKS = {
    # id: (display name, aliases found in a source, HF dataset, config, split)
    "mnli": ("MNLI · reading logic", ("mnli", "multinli"), "nyu-mll/glue", "mnli", "validation_matched"),
    "piqa": ("PIQA · common sense", ("piqa",), "baber/piqa", "default", "validation"),
    "boolq": ("BoolQ · yes/no reading", ("boolq",), "google/boolq", "default", "validation"),
    "arc_easy": ("ARC-Easy · science questions", ("arc_easy", "arc-easy", "arc easy", "ai2_arc", "arc-e"), "allenai/ai2_arc", "ARC-Easy", "test"),
    "hellaswag": ("HellaSwag · sentence endings", ("hellaswag",), "Rowan/hellaswag", "default", "validation"),
    "arc_challenge": ("ARC-Challenge · harder science", ("arc_challenge", "arc-challenge", "arc challenge", "arc-c"), "allenai/ai2_arc", "ARC-Challenge", "test"),
    "mmlu": ("MMLU · broad knowledge", ("mmlu",), "cais/mmlu", "all", "test"),
    "gsm8k": ("GSM8K · grade-school math", ("gsm8k", "gsm-8k"), "openai/gsm8k", "main", "test"),
    "commonsense_qa": ("CommonsenseQA · everyday reasoning", ("commonsense_qa", "commonsenseqa", "csqa"), "tau/commonsense_qa", "default", "validation"),
}
# What each benchmark measures, used to match it to a dataset: HF task tags and prompt patterns.
BENCH_MATCH = {
    "gsm8k": ({"math", "mathematics", "arithmetic", "math-word-problems"}, r"\b(solve|calculate|compute|how many|how much|percent|equation|sum of|product of|total cost)\b|\d+\s*[-+*/x×]\s*\d+"),
    "mmlu": ({"multiple-choice", "question-answering", "closed-domain-qa", "knowledge"}, r"\b(who (was|is|wrote|discovered|invented)|what is the (capital|largest|smallest)|which (country|year|element))\b"),
    "arc_easy": ({"science", "multiple-choice", "question-answering"}, r"\b(photosynthesis|gravity|energy|molecule|atom|planet|cell|chemical|physics|biology|ecosystem)\b"),
    "arc_challenge": ({"science", "multiple-choice"}, r"\b(photosynthesis|gravity|energy|molecule|atom|planet|cell|chemical|physics|biology|ecosystem)\b"),
    "boolq": ({"question-answering", "reading-comprehension", "extractive-qa"}, r"\b(true or false|yes or no|passage:|according to the (text|passage))\b"),
    "mnli": ({"natural-language-inference", "text-classification"}, r"\b(entail|premise|hypothesis|contradict)\w*"),
    "piqa": ({"commonsense", "physical-commonsense"}, r"\b(how (do|can|would) (i|you)|best way to|what should i use to)\b"),
    "commonsense_qa": ({"commonsense", "multiple-choice"}, r"\b(why would|where would you|what (do|would) people)\b"),
    "hellaswag": ({"commonsense", "sentence-completion"}, r"\b(what happens next|continue the (story|sentence)|complete the sentence)\b"),
}
GENERAL_CHECKS = ["mmlu", "hellaswag", "arc_easy"]
NUMERIC_BENCHES = {"gsm8k"}
NOT_RUNNABLE = {
    "wikitext": "WikiText perplexity needs token probabilities, which Forge's chat API does not expose.",
    "lambada": "LAMBADA scores next-word probabilities, which Forge's chat API does not expose.",
    "humaneval": "HumanEval runs generated code, which TuningKit does not execute.",
    "mbpp": "MBPP runs generated code, which TuningKit does not execute.",
    "truthfulqa": "TruthfulQA's generation track needs a judge model; not scored here.",
    "mt-bench": "MT-Bench needs a judge model; not scored here.",
    "alpacaeval": "AlpacaEval needs a judge model; not scored here.",
    "bleu": "BLEU/ROUGE-style scores are covered by the held-out set's reference match.",
}
BENCH_SAMPLES = 50


def _bench_item(bench, row):
    """Normalise one dataset row into a one-letter multiple-choice question."""
    def mc(stem, options, gold):
        lines = "\n".join(f"{LETTERS[i]}) {o}" for i, o in enumerate(options))
        return {"prompt": f"{stem}\n\n{lines}\nAnswer with only the letter {', '.join(LETTERS[:len(options)-1])} or {LETTERS[len(options)-1]}.",
                "gold": LETTERS[gold]}
    if bench == "mnli":
        if row.get("label") not in (0, 1, 2):
            return None
        return mc(f"Premise: {row['premise']}\nHypothesis: {row['hypothesis']}\n\nDoes the premise entail the hypothesis?",
                  ["entailment", "neutral", "contradiction"], row["label"])
    if bench == "piqa":
        return mc(f"Goal: {row['goal']}\n\nWhich solution achieves the goal better?", [row["sol1"], row["sol2"]], int(row["label"]))
    if bench == "boolq":
        return mc(f"Passage: {row['passage']}\nQuestion: {row['question']}?", ["yes", "no"], 0 if row["answer"] else 1)
    if bench == "arc_easy":
        labels, texts = row["choices"]["label"], row["choices"]["text"]
        if row["answerKey"] not in labels or len(texts) > 4:
            return None
        return mc(row["question"], texts, labels.index(row["answerKey"]))
    if bench in ("arc_challenge",):
        labels, texts = row["choices"]["label"], row["choices"]["text"]
        if row["answerKey"] not in labels or len(texts) > 5:
            return None
        return mc(row["question"], texts, labels.index(row["answerKey"]))
    if bench == "mmlu":
        if not isinstance(row.get("choices"), list) or len(row["choices"]) != 4:
            return None
        return mc(f"({str(row.get('subject', '')).replace('_', ' ')}) {row['question']}", row["choices"], int(row["answer"]))
    if bench == "commonsense_qa":
        labels, texts = row["choices"]["label"], row["choices"]["text"]
        if row.get("answerKey") not in labels:
            return None
        return mc(row["question"], texts, labels.index(row["answerKey"]))
    if bench == "gsm8k":
        gold = str(row.get("answer") or "").split("####")[-1].strip().replace(",", "")
        if not re.fullmatch(r"-?\d+(\.\d+)?", gold):
            return None
        return {"prompt": f"{row['question']}\n\nSolve it step by step, then end with a final line 'Answer: <number>'.", "gold": gold}
    if bench == "hellaswag":
        if str(row.get("label", "")) == "":
            return None
        return mc(f"{row['activity_label']}: {row['ctx']}\n\nWhich ending is most likely?", row["endings"], int(row["label"]))
    return None


def _bench_items(bench):
    """Fixed 50-question sample per benchmark, downloaded once and cached."""
    path = Path(f"/data/apps/{APP_ID}/benchmarks/{bench}.json")
    try:
        cached = json.loads(path.read_text())
        if cached.get("items") and "prompt" in cached["items"][0]:
            return cached["items"]
    except (OSError, json.JSONDecodeError, KeyError, IndexError):
        pass
    _, _, dataset, config, split = BENCHMARKS[bench]
    # MMLU is sorted by subject, so sample across the whole split instead of the first 100 rows.
    offsets = [(0, 100)] if bench != "mmlu" else [(o, 10) for o in range(0, 14000, 1400)]
    rows = []
    for offset, length in offsets:
        payload = _public_json(f"{HF_VIEWER_URL}/rows?dataset={urllib.parse.quote(dataset, safe='')}"
                               f"&config={urllib.parse.quote(config)}&split={split}&offset={offset}&length={length}")
        rows += [r.get("row") or {} for r in payload.get("rows") or []]
    _random.Random(42).shuffle(rows)
    items = [i for i in (_bench_item(bench, r) for r in rows) if i][:BENCH_SAMPLES]
    if len(items) < 10:
        raise Problem(502, f"{BENCHMARKS[bench][0]} questions could not be loaded.")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"source": f"{dataset} {config} {split} (first 100 rows, {len(items)} sampled, seed 42)",
                                "items": items}, indent=1))
    return items


def _source_text(source):
    source = source.strip()
    match = re.match(r"https?://github\.com/([^/\s]+)/([^/\s#?]+)", source)
    if match:
        owner, repo = match.group(1), match.group(2).removesuffix(".git")
        for branch in ("main", "master"):
            try:
                return _public_text(f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md")
            except Problem:
                continue
        raise Problem(404, "That GitHub repository has no readable README.")
    if re.match(r"https?://", source):
        return _public_text(source)
    return source


def _reference_tables(text):
    """Markdown tables in the source that mention a known benchmark, kept as-is for display."""
    tables, block = [], []
    for line in text.splitlines() + [""]:
        if line.count("|") >= 2:
            block.append(line.strip())
            continue
        if len(block) >= 3:
            rows = [[c.replace("**", "").strip() for c in r.strip().strip("|").split("|")] for r in block if not re.fullmatch(r"[|:\-\s]+", r)]
            header = " ".join(rows[0]).lower()
            if any(alias in header for _, aliases, *_ in BENCHMARKS.values() for alias in aliases) or "wikitext" in header:
                tables.append(rows[:12])
        block = []
    return tables[:3]


def bench_resolve(body):
    """Work out which benchmarks the user typed: names (mnli, piqa), a GitHub repo or README link, or Hugging Face dataset ids/links."""
    import concurrent.futures
    source = str(body.get("source") or "").strip()
    if not source:
        return {"source": "", "benchmarks": [], "not_runnable": [], "references": []}
    parts = [p.strip() for p in re.split(r"[,\s]+", source) if p.strip()]
    text_parts, hf_ids = [], []
    for part in parts:
        m = re.match(r"https?://huggingface\.co/datasets/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)", part)
        if m:
            hf_ids.append(m.group(1))
        elif re.match(r"https?://", part):
            text_parts.append(_source_text(part)[:400000])
        elif re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", part):
            hf_ids.append(part)
        else:
            text_parts.append(part)
    text = "\n".join(text_parts)
    lower = text.lower()
    found = [b for b, (_, aliases, *_r) in BENCHMARKS.items()
             if any(re.search(rf"(?<![a-z]){re.escape(a)}(?![a-z])", lower) for a in aliases)]
    hf_ids += [m for m in re.findall(r"huggingface\.co/datasets/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)", text)]
    known_hf = {BENCHMARKS[b][2].lower(): b for b in BENCHMARKS}
    for hid in list(dict.fromkeys(hf_ids)):
        if hid.lower() in known_hf and known_hf[hid.lower()] not in found:
            found.append(known_hf[hid.lower()])
    own = str(body.get("data_key") or "").split("@")[0].removeprefix("hf:").lower()
    others = [h for h in dict.fromkeys(hf_ids) if h.lower() not in known_hf and h.lower() != own][:6]
    benches, not_runnable = [], [{"id": k, "reason": v} for k, v in NOT_RUNNABLE.items() if k in lower]
    for bench in found[:8]:
        try:
            benches.append({"id": bench, "name": BENCHMARKS[bench][0], "questions": len(_bench_items(bench)),
                            "reason": "Recognised benchmark"})
        except Problem as exc:
            not_runnable.append({"id": bench, "reason": exc.message})
    if others:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            for hid, result in zip(others, pool.map(_probe_benchmark, others)):
                if result and result.get("runnable"):
                    bid = f"hf:{hid}:{result['config']}:{result['split']}"
                    try:
                        benches.append({"id": bid, "name": hid, "questions": len(_dynamic_items(bid)),
                                        "reason": f"Hugging Face · {result['kind']}"})
                    except Problem as exc:
                        not_runnable.append({"id": hid, "reason": exc.message})
                else:
                    not_runnable.append({"id": hid, "reason": (result or {}).get("why") or "not found on Hugging Face"})
    if not benches and not not_runnable:
        raise Problem(422, "Nothing recognisable there. Try names like mnli, piqa, gsm8k, a GitHub repo, or a Hugging Face dataset id.")
    return {"source": source, "benchmarks": benches, "not_runnable": not_runnable, "references": _reference_tables(text) if text else []}


def _dataset_for(body):
    reg = _registry()["items"]
    entry = reg.get(str(body.get("dataset_id") or ""))
    if not entry and body.get("data_key"):
        entry = next((e for e in reg.values() if e.get("data_key") == body["data_key"]), None)
    if not entry:
        raise Problem(404, "Choose a dataset first.")
    return entry


def _sample_prompts(entry, limit=300):
    prompts = []
    try:
        with _store(entry["files"]["train"]).open(encoding="utf-8") as handle:
            for line in handle:
                msgs = json.loads(line).get("messages") or []
                prompts.append(" ".join(m.get("content", "") for m in msgs if m.get("role") == "user"))
                if len(prompts) >= limit:
                    break
    except (OSError, KeyError, json.JSONDecodeError):
        pass
    return prompts


DOMAIN_PATTERNS = {
    "math": r"\b(solve|calculate|equation|integral|derivative|probability|percent|how many|sum of)\b|\d+\s*[-+*/x×^]\s*\d+",
    "science": r"\b(physics|chemistry|biology|molecule|atom|cell|energy|photosynthesis|planet|ecosystem)\b",
    "medical": r"\b(patient|symptom|diagnos\w*|treatment|disease|clinical|medication|dose)\b",
    "legal": r"\b(law|legal|contract|court|statute|liability|plaintiff|clause)\b",
    "finance": r"\b(stock|revenue|investment|interest rate|portfolio|accounting|balance sheet|tax)\b",
    "code": r"\b(python|javascript|function|compile|bug|sql|regex|api|class)\b|def |\(\)",
    "history": r"\b(century|war|empire|dynasty|revolution|ancient|treaty)\b",
}
TRAINING_NAME = re.compile(r"(sft|train|training|instruct|distil|corpora|corpus|synthetic|pretrain|rl-|-rl|dpo|preference|pool|qwen|llama|gpt|mistral|gemma|deepseek|_eval_|direct_eval|lmms|vision|visual|verse|vista|image|multimodal|voice|audio|video)", re.I)
EVAL_NAME = re.compile(r"(bench|eval|test|qa|exam|quiz|olympiad|mcq|challenge)", re.I)


def _norm_answer(text):
    return re.sub(r"\s+", " ", str(text or "").strip().lower()).strip(" .")


def _adapt_row(row):
    """Turn one row of an unknown benchmark into a scoreable item (multiple choice, numeric or short answer)."""
    if not isinstance(row, dict):
        return None
    question = next((row[k] for k in ("question", "query", "problem", "prompt", "input", "goal", "ctx", "sentence", "instruction")
                     if isinstance(row.get(k), str) and row[k].strip()), None)
    if not question:
        return None
    choices = None
    raw = row.get("choices") or row.get("options") or row.get("endings") or row.get("answers_choices")
    if isinstance(raw, dict) and isinstance(raw.get("text"), list):
        choices, labels = [str(x) for x in raw["text"]], [str(x) for x in raw.get("label") or LETTERS[:len(raw["text"])]]
    elif isinstance(raw, list) and raw and all(isinstance(x, (str, int, float)) for x in raw):
        choices, labels = [str(x) for x in raw], list(LETTERS[:len(raw)])
    elif all(isinstance(row.get(k), str) for k in ("A", "B", "C", "D")):
        choices, labels = [row[k] for k in "ABCD"], list("ABCD")
    elif isinstance(row.get("sol1"), str) and isinstance(row.get("sol2"), str):
        choices, labels = [row["sol1"], row["sol2"]], ["0", "1"]
    if choices and 2 <= len(choices) <= 5:
        gold = None
        for key in ("answerKey", "answer", "label", "correct_answer", "answer_idx", "target"):
            value = row.get(key)
            if value is None or value == "":
                continue
            if isinstance(value, bool):
                continue
            if isinstance(value, int) and 0 <= value < len(choices):
                gold = value
            elif str(value) in labels:
                gold = labels.index(str(value))
            elif str(value).strip().upper() in LETTERS[:len(choices)]:
                gold = LETTERS.index(str(value).strip().upper())
            elif _norm_answer(value) in [_norm_answer(c) for c in choices]:
                gold = [_norm_answer(c) for c in choices].index(_norm_answer(value))
            if gold is not None:
                break
        if gold is None:
            return None
        lines = "\n".join(f"{LETTERS[i]}) {c}" for i, c in enumerate(choices))
        return {"kind": "mc", "prompt": f"{question}\n\n{lines}\nAnswer with only the letter.", "gold": LETTERS[gold]}
    answer = next((row[k] for k in ("answer", "final_answer", "solution", "target", "output", "label") if row.get(k) not in (None, "")), None)
    if answer is None or isinstance(answer, (list, dict)):
        return None
    answer = str(answer).split("####")[-1].strip()
    number = answer.replace(",", "").replace("$", "")
    if re.fullmatch(r"-?\d+(\.\d+)?", number):
        return {"kind": "numeric", "prompt": f"{question}\n\nEnd with a final line 'Answer: <number>'.", "gold": number}
    if len(answer.split()) <= 4:
        return {"kind": "short", "prompt": f"{question}\n\nAnswer briefly.", "gold": answer}
    return None


def _probe_benchmark(hf_id):
    """Find an evaluation split of a Hugging Face dataset and check TuningKit can score it."""
    enc = urllib.parse.quote(hf_id, safe="")
    try:
        splits = (_public_json(f"{HF_VIEWER_URL}/splits?dataset={enc}") or {}).get("splits") or []
    except Problem:
        return None
    pick = next((s for want in ("test", "validation", "dev", "eval") for s in splits if s.get("split") == want), None)
    pick = pick or next((s for s in splits if re.search(r"test|valid|dev|eval", str(s.get("split")), re.I)), None)
    if not pick and EVAL_NAME.search(hf_id.split("/")[-1]):
        pick = splits[0] if splits else None  # a benchmark-named dataset published as a single split
    if not pick:
        return {"id": hf_id, "runnable": False, "why": "no test or validation split"}
    try:
        rows = [r.get("row") for r in (_public_json(f"{HF_VIEWER_URL}/first-rows?dataset={enc}&config={urllib.parse.quote(pick['config'], safe='')}"
                                                     f"&split={urllib.parse.quote(pick['split'], safe='')}") or {}).get("rows") or []]
    except Problem:
        return {"id": hf_id, "runnable": False, "why": "rows could not be read"}
    items = [i for i in (_adapt_row(r) for r in rows[:30]) if i]
    if not rows or len(items) < max(5, len(rows[:30]) * 0.6):
        return {"id": hf_id, "runnable": False, "why": "answers are open-ended or images; would need a judge model"}
    kinds = {i["kind"] for i in items}
    return {"id": hf_id, "runnable": True, "config": pick["config"], "split": pick["split"],
            "kind": "multiple choice" if kinds == {"mc"} else "numeric answers" if kinds == {"numeric"} else "short answers"}


def _search_terms(entry, tags, prompts, answers):
    terms = []
    short = [a for a in answers if len(a.split()) <= 3]
    labels = {_norm_answer(a) for a in short}
    if answers and len(short) / len(answers) >= 0.8 and 2 <= len(labels) <= 40:
        terms += ["intent classification", "routing"]
    for domain, pattern in DOMAIN_PATTERNS.items():
        if prompts and sum(1 for p in prompts if re.search(pattern, p.lower())) / len(prompts) >= 0.25:
            terms.append(domain)
    terms += [t for t in tags if t in DOMAIN_PATTERNS]
    seen, out = set(), []
    for t in terms:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out[:3]


def bench_suggest(body):
    """Search Hugging Face for benchmarks that fit one dataset, and keep only those TuningKit can score."""
    import concurrent.futures
    started = time.time()
    entry = _dataset_for(body)
    card, tags, mentioned = "", set(), []
    if entry["id"].startswith("hf:"):
        hf_id = entry["id"][3:]
        try:
            card = _public_text(f"https://huggingface.co/datasets/{hf_id}/raw/main/README.md")[:300000]
            mentioned = [m for m in dict.fromkeys(re.findall(r"huggingface\.co/datasets/([A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+)", card)) if m != hf_id][:4]
        except Problem:
            card = ""
        try:
            info = _public_json(f"https://huggingface.co/api/datasets/{hf_id}") or {}
            meta = info.get("cardData") or {}
            for key in ("task_categories", "task_ids", "tags"):
                tags |= {str(t).lower() for t in (meta.get(key) or [])}
        except Problem:
            pass
    prompts, answers = [], []
    try:
        with _store(entry["files"]["train"]).open(encoding="utf-8") as handle:
            for line in handle:
                msgs = json.loads(line).get("messages") or []
                prompts.append(" ".join(m.get("content", "") for m in msgs if m.get("role") == "user"))
                answers.append(next((m.get("content", "") for m in reversed(msgs) if m.get("role") == "assistant"), ""))
                if len(prompts) >= 300:
                    break
    except (OSError, KeyError, json.JSONDecodeError):
        pass
    terms = _search_terms(entry, tags, prompts, answers)
    candidates = {m: f"Linked from the dataset's card" for m in mentioned}
    queries = [(f"{t} {suffix}", "") for t in terms for suffix in ("benchmark", "eval")] + \
              [(t, f"&filter={f}") for t in terms for f in ("task_categories:multiple-choice", "task_categories:question-answering")]
    for query, filt in queries:
        term = query
        if True:
            try:
                found = _public_json(f"{HF_DATASETS_URL}?search={urllib.parse.quote(query)}{filt}&sort=downloads&direction=-1&limit=8") or []
            except Problem:
                continue
            for d in found:
                did = d.get("id")
                if did and did not in candidates and not TRAINING_NAME.search(did.split("/")[-1]) and did != entry["id"][3:]:
                    candidates[did] = (f"Hugging Face search for “{term}”", d.get("downloads") or 0)
    ranked = sorted(candidates.items(), key=lambda kv: (0 if isinstance(kv[1], str) else 1,
                                                        0 if EVAL_NAME.search(kv[0]) else 1,
                                                        -(kv[1][1] if isinstance(kv[1], tuple) else 0)))[:14]
    relevant, not_runnable = [], []
    budget = max(2.0, 12.0 - (time.time() - started))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(_probe_benchmark, did): (did, why) for did, why in ranked}
        try:
            for fut in concurrent.futures.as_completed(futures, timeout=budget):
                did, why = futures[fut]
                result = fut.result()
                if not result:
                    continue
                reason = why if isinstance(why, str) else f"{why[0]} · {why[1]:,} downloads"
                if result["runnable"]:
                    relevant.append({"id": f"hf:{did}:{result['config']}:{result['split']}", "name": did,
                                     "reason": f"{reason} · {result['kind']}"})
                else:
                    not_runnable.append({"id": did, "reason": result["why"]})
        except concurrent.futures.TimeoutError:
            pass
    order = [f"hf:{d}" for d, _ in ranked]
    relevant.sort(key=lambda r: next((i for i, o in enumerate(order) if r["id"].startswith(o + ":")), 99))
    note = None
    if not terms and not mentioned:
        note = "This looks like general data with no specific task or domain, so there is no benchmark to search for. Your held-out set is the test."
    elif not relevant:
        note = f"Searched Hugging Face for {', '.join(terms) or 'linked benchmarks'} and found nothing TuningKit can score automatically. Your held-out set is the test."
    return {"note": note, "dataset": entry["name"], "terms": terms,
            "searched": [x for x, ok in (("dataset card", bool(card)), ("task tags", bool(tags)), (f"{len(prompts)} prompts", bool(prompts)),
                                         (f"Hugging Face for {', '.join(terms)}", bool(terms))) if ok],
            "relevant": relevant[:5], "not_runnable": not_runnable[:5], "general": [], "references": []}


def _dynamic_items(bench_id):
    """Questions for a benchmark found by search (id: hf:<dataset>:<config>:<split>), cached."""
    _, rest = bench_id.split(":", 1)
    hf_id, config, split = rest.rsplit(":", 2)
    safe = re.sub(r"[^A-Za-z0-9_.-]+", "_", rest)[:120]
    path = Path(f"/data/apps/{APP_ID}/benchmarks/dyn-{safe}.json")
    try:
        cached = json.loads(path.read_text())
        if cached.get("items"):
            return cached["items"]
    except (OSError, json.JSONDecodeError):
        pass
    payload = _public_json(f"{HF_VIEWER_URL}/rows?dataset={urllib.parse.quote(hf_id, safe='')}&config={urllib.parse.quote(config, safe='')}"
                           f"&split={urllib.parse.quote(split, safe='')}&offset=0&length=100")
    rows = [r.get("row") or {} for r in payload.get("rows") or []]
    _random.Random(42).shuffle(rows)
    items = [i for i in (_adapt_row(r) for r in rows) if i][:BENCH_SAMPLES]
    if len(items) < 5:
        raise Problem(502, f"{hf_id} questions could not be loaded.")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"source": f"{hf_id} {config} {split}", "items": items}, indent=1))
    return items


def _items_for(bench):
    return _dynamic_items(bench) if bench.startswith("hf:") else _bench_items(bench)


def bench_plan(body):
    """Load the chosen benchmarks' question sets (cached) for an evaluation run."""
    ids = [b for b in (body.get("ids") or []) if isinstance(b, str) and (b in BENCHMARKS or b.startswith("hf:"))][:6]
    benches = [{"id": b, "name": BENCHMARKS[b][0] if b in BENCHMARKS else b[3:].rsplit(":", 2)[0], "questions": len(_items_for(b))} for b in ids]
    return {"benchmarks": benches, "skipped": [], "references": [], "source": ""}


def bench_sample(body):
    """One multiple-choice benchmark question, answered by the base model (LoRA) or the chosen weights."""
    bench = str(body.get("bench") or "")
    if bench not in BENCHMARKS and not bench.startswith("hf:"):
        raise Problem(400, "Unknown benchmark.")
    items = _items_for(bench)
    try:
        index = int(body.get("index"))
        item = items[index]
    except (ValueError, IndexError, TypeError):
        raise Problem(404, "That benchmark question is not available.")
    target = next((t for t in _eval_targets() if t["id"] == str(body.get("target") or "")), None)
    if not target:
        raise Problem(404, "Those weights are no longer available.")
    step = 0 if body.get("variant") == "base" else target["step"]
    kind = item.get("kind") or ("numeric" if bench in NUMERIC_BENCHES else "mc")
    numeric = kind == "numeric"
    raw, _ = _complete(target, step, [{"role": "user", "content": item["prompt"]}], 384 if numeric else 48 if kind == "short" else 8)
    raw = raw.strip()
    if kind == "short":
        pred = item["gold"] if _norm_answer(item["gold"]) and _norm_answer(item["gold"]) in _norm_answer(raw) else _norm_answer(raw)[:40]
    elif numeric:
        tail = raw.split("Answer:")[-1] if "Answer:" in raw else raw
        nums = re.findall(r"-?\d+(?:\.\d+)?", tail.replace(",", ""))
        pred = nums[-1] if nums else None
        if pred is not None and item["gold"] is not None:
            try:
                pred = item["gold"] if abs(float(pred) - float(item["gold"])) < 1e-6 else pred
            except ValueError:
                pass
    else:
        match = re.search(r"\b([ABCDE])\b", raw.upper()) or re.search(r"([ABCDE])", raw.upper())
        pred = match.group(1) if match else None
    return {"bench": bench, "index": index, "variant": "base" if step == 0 else "tuned", "pred": pred,
            "gold": item["gold"], "correct": pred == item["gold"], "raw": raw[-60:], "total": len(items)}


def extract_pdf(body):
    """Extract embedded text locally; scanned PDFs are retained and flagged."""
    if not isinstance(body, dict):
        raise Problem(400, "PDF data is required.")
    filename = body.get("filename")
    encoded = body.get("data_base64")
    if not isinstance(filename, str) or not filename.lower().endswith(".pdf"):
        raise Problem(400, "Choose a PDF file.")
    if not isinstance(encoded, str) or not encoded:
        raise Problem(400, "PDF data is required.")
    if len(encoded) > ((MAX_PDF_BYTES + 2) // 3) * 4:
        raise Problem(413, "PDFs must be 5 MB or smaller.")
    try:
        raw = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error):
        raise Problem(400, "The PDF data is invalid.")
    if len(raw) > MAX_PDF_BYTES:
        raise Problem(413, "PDFs must be 5 MB or smaller.")
    if not raw.startswith(b"%PDF-"):
        raise Problem(400, "The selected file is not a valid PDF.")
    try:
        reader = PdfReader(io.BytesIO(raw), strict=False)
        if reader.is_encrypted and reader.decrypt("") == 0:
            raise Problem(400, "Password-protected PDFs are not supported.")
        if len(reader.pages) > MAX_PDF_PAGES:
            raise Problem(413, "PDFs may contain at most 400 pages.")
        pages = []
        for number, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            if text:
                pages.append(f"--- Page {number} ---\n{text}")
    except Problem:
        raise
    except Exception:
        raise Problem(400, "TuningKit could not read this PDF.")
    text = "\n\n".join(pages)
    needs_ocr = len(text.strip()) < 20
    return {
        "filename": filename,
        "text": text,
        "page_count": len(reader.pages),
        "character_count": len(text),
        "extraction": "ocr-required" if needs_ocr else "embedded-text",
        "needs_ocr": needs_ocr,
        "message": (
            "This PDF appears to contain scanned images and needs OCR before training."
            if needs_ocr
            else "PDF text extracted locally."
        ),
    }


# ---------------------------------------------------------------- Tuning Engine client
# TuningKit is the first app built on the shared Tuning Engine (app slug "tuning-engine"):
# provider status, models, methods, dataset upload, training, stop, metrics and checkpoint
# inference all go through /api/services/tuning-engine/v1/... with this app's own token.

ENGINE_SLUG = "tuning-engine"
ENGINE_PROJECT = "tuningkit"
UPLOAD_BATCH = 4000


def engine(method, path, body=None, timeout=13.5):
    if not API_BASE or not APP_TOKEN:
        raise Problem(503, "The Tuning Engine is unavailable from here.")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{API_BASE}/api/services/{ENGINE_SLUG}/v1/{path}", data=data, method=method,
                                 headers={"Authorization": f"Bearer {APP_TOKEN}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read() or b"{}")
    except urllib.error.HTTPError as exc:
        try:
            detail = json.loads(exc.read(8192) or b"{}")
            message = detail.get("error") or detail.get("detail")
        except Exception:
            message = None
        if exc.code == 404 and not message:
            message = "The Tuning Engine app is not installed."
        raise Problem(exc.code if 400 <= exc.code < 500 else 502, message or f"The Tuning Engine returned {exc.code}.")
    except (urllib.error.URLError, TimeoutError):
        raise Problem(504, "The Tuning Engine did not answer in time.")


def engine_status():
    try:
        d = engine("GET", "status")
    except Problem as exc:
        return {"provider": "wandb-training", "configured": False, "connected": False, "via": ENGINE_SLUG, "error": exc.message}
    return {"provider": "wandb-training", "configured": bool(d.get("connected")), "connected": bool(d.get("connected")),
            "via": ENGINE_SLUG, "entity": d.get("entity"), "billing_note": d.get("billing"),
            "error": None}


def engine_connect(body):
    """Forward the key the user typed in TuningKit to the engine's encrypted store. TuningKit never keeps it."""
    key = str((body or {}).get("api_key") or "").strip()
    if not 16 <= len(key) <= 8192:
        raise Problem(400, "Enter a valid W&B API key.")
    try:
        engine("POST", "connect", {"api_key": key})
    except Problem as exc:
        raise Problem(exc.status, exc.message.replace(key, "[key]"))
    return engine_status()


def engine_models():
    d = engine("GET", "models")
    models = d.get("models") or []
    src = d.get("sources") or {}
    return {"models": [m["id"] for m in models], "source": "CoreWeave Forge via Tuning Engine",
            "details": [{"id": m["id"], "serverless": bool(m.get("serverless")),
                         "serverless_after_tuning": bool(m.get("serverless_after_tuning"))} for m in models],
            "serving": {"serverless_source": src.get("serverless"), "lora_source": src.get("serverless_after_tuning"),
                        "refreshed_at": src.get("checked_at")},
            "checked": bool(src.get("serverless") or src.get("serverless_after_tuning"))}


def engine_methods():
    d = engine("GET", "methods")
    return {"methods": [{"id": m["id"], "name": m["name"], "summary": m.get("summary"), "use_when": m.get("use_when"),
                         "you_need": m.get("you_need"), "parameters": m.get("parameters") or [],
                         "data_spec": m.get("data_spec"), "launchable": m.get("launchable"),
                         "not_launchable_reason": m.get("not_launchable_reason"), "rewards": m.get("rewards"),
                         "loop_settings": m.get("loop_settings")} for m in d.get("methods") or []],
            "source": "CoreWeave Forge API reference via Tuning Engine", "refreshed_at": d.get("refreshed_at")}


# ---------------------------------------------------------------- dataset catalogue
# Every dataset TuningKit can train on is registered in datasets.json with a train file and
# (optionally) a held-out eval file. Built-in starters ship with the app; Hugging Face datasets
# and uploads are converted to chat messages and split here.

STARTERS = {
    "builtin:prompt-router": {
        "name": "prompt-router-starter", "file": "prompt_router.jsonl", "license": "TuningKit starter",
        "source": "TuningKit built-in starter (200 prompts, 8 routes)", "data_key": "builtin:prompt-router@v1",
        "description": "Classify a request into code, math, writing, factual, summarize, translate, chat or reasoning.",
    },
}
HF_PREP_CAP = 20000


def _registry():
    try:
        return json.loads(_store("datasets.json").read_text())
    except (OSError, json.JSONDecodeError):
        return {"items": {}}


def _save_registry(reg):
    tmp = _store("datasets.json.tmp")
    tmp.write_text(json.dumps(reg, indent=1))
    tmp.replace(_store("datasets.json"))


def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")[:48] or "dataset"


def _to_messages(row):
    """Convert common dataset shapes to {messages:[...]} ending with the assistant answer, or None."""
    if not isinstance(row, dict):
        return None
    msgs = row.get("messages") or row.get("conversations") or row.get("conversation")
    if isinstance(msgs, list) and msgs:
        out = []
        for m in msgs:
            if not isinstance(m, dict):
                return None
            role = m.get("role") or {"human": "user", "user": "user", "gpt": "assistant", "assistant": "assistant",
                                     "system": "system"}.get(str(m.get("from") or "").lower())
            content = m.get("content", m.get("value"))
            if role not in ("system", "user", "assistant") or not isinstance(content, str):
                return None
            out.append({"role": role, "content": content})
        return {"messages": out} if out[-1]["role"] == "assistant" and any(m["role"] == "user" for m in out) else None
    for q, a in (("instruction", "output"), ("instruction", "response"), ("prompt", "completion"), ("prompt", "response"), ("question", "answer"),
                 ("input", "output"), ("query", "response")):
        if isinstance(row.get(q), str) and isinstance(row.get(a), str) and row[q].strip() and row[a].strip():
            user = row[q] + (f"\n\n{row['input']}" if q == "instruction" and str(row.get("input") or "").strip() else "")
            return {"messages": [{"role": "user", "content": user}, {"role": "assistant", "content": row[a]}]}
    return None


def _write_split(dataset_id, name, rows, *, eval_mode, eval_rows=None, source="", license="", data_key=None, builtin=False):
    import random
    seen, unique, dropped = set(), [], 0
    for r in rows:
        key = json.dumps(r["messages"][:-1], sort_keys=True)
        if key in seen:
            dropped += 1
            continue
        seen.add(key)
        unique.append(r)
    random.Random(42).shuffle(unique)
    held = []
    if eval_mode == "auto":
        n = max(1, round(len(unique) * (0.1 if len(unique) < 1000 else 0.02)))
        held, unique = unique[:n], unique[n:]
    elif eval_mode == "upload":
        held = eval_rows or []
    if len(unique) < 10:
        raise Problem(400, "The dataset needs at least 10 valid training examples after the split.")
    folder = _store("data") / "datasets" / _slug(dataset_id)
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "train.jsonl").write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in unique) + "\n")
    files = {"train": str((folder / "train.jsonl").relative_to(_store("")))}
    if held:
        (folder / "eval.jsonl").write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in held) + "\n")
        files["eval"] = str((folder / "eval.jsonl").relative_to(_store("")))
    digest = __import__("hashlib").sha256((folder / "train.jsonl").read_bytes()).hexdigest()[:12]
    entry = {"id": dataset_id, "name": name, "source": source, "license": license, "builtin": builtin,
             "train_rows": len(unique), "eval_rows": len(held), "eval_mode": eval_mode, "dropped_duplicates": dropped,
             "files": files, "data_key": data_key or f"{dataset_id}@{digest}",
             "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    reg = _registry()
    reg["items"][dataset_id] = entry
    _save_registry(reg)
    return entry


def dataset_catalog(_body=None):
    reg = _registry()
    changed = False
    for sid, info in STARTERS.items():
        if sid not in reg["items"]:
            rows = [json.loads(l) for l in (Path(__file__).parent / info["file"]).read_text().splitlines() if l.strip()]
            _write_split(sid, info["name"], rows, eval_mode="auto", source=info["source"], license=info["license"],
                         data_key=info["data_key"], builtin=True)
            reg = _registry()
            reg["items"][sid]["description"] = info["description"]
            changed = True
    legacy = _store("dataset-split.json")
    if legacy.exists():
        split = json.loads(legacy.read_text())
        lid = f"hf:{split.get('dataset')}"
        if split.get("dataset") and lid not in reg["items"]:
            reg["items"][lid] = {"id": lid, "name": split["dataset"], "source": f"Hugging Face · {split['dataset']}",
                                 "license": split.get("license", ""), "builtin": False, "train_rows": split.get("train_rows"),
                                 "eval_rows": split.get("eval_rows"), "eval_mode": "auto", "files": split.get("files"),
                                 "dropped_duplicates": split.get("dropped_duplicates", 0),
                                 "data_key": f"hf:{split['dataset']}@{split.get('revision')}",
                                 "created_at": split.get("prepared_at") or ""}
            changed = True
    if changed:
        _save_registry(reg)
    items = sorted(reg["items"].values(), key=lambda e: (not e.get("builtin"), e.get("name", "")))
    return {"datasets": items}


def dataset_upload(body):
    name = str(body.get("name") or "uploaded dataset")[:80]
    rows = [r for r in (_to_messages(x) for x in body.get("rows") or []) if r]
    eval_mode = body.get("eval_mode") if body.get("eval_mode") in ("auto", "upload", "none") else "auto"
    eval_rows = [r for r in (_to_messages(x) for x in body.get("eval_rows") or []) if r] if eval_mode == "upload" else None
    if eval_mode == "upload" and not eval_rows:
        raise Problem(400, "The evaluation file has no valid examples.")
    if not rows:
        raise Problem(400, "No rows matched a supported shape (messages, prompt/completion, instruction/output, question/answer).")
    return _write_split(f"upload:{_slug(name)}", name, rows, eval_mode=eval_mode, eval_rows=eval_rows, source=f"Uploaded · {name}")


def hf_prepare(body):
    """Fetch a Hugging Face split in bounded pages (the app calls this until done), then convert and split it."""
    dataset = str(body.get("dataset") or "")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", dataset):
        raise Problem(400, "Choose a valid Hugging Face dataset.")
    config, split = str(body.get("config") or "default"), str(body.get("split") or "train")
    eval_mode = body.get("eval_mode") if body.get("eval_mode") in ("auto", "none") else "auto"
    staging = _store("data") / "hf-staging" / f"{_slug(dataset)}.jsonl"
    meta_path = staging.with_suffix(".json")
    staging.parent.mkdir(parents=True, exist_ok=True)
    offset = int(body.get("offset") or 0)
    if offset == 0:
        staging.write_text("")
        info = _public_json(f"https://huggingface.co/api/datasets/{dataset}")
        meta_path.write_text(json.dumps({"sha": (info or {}).get("sha"), "license": ((info or {}).get("cardData") or {}).get("license"),
                                         "skipped": 0}))
    meta = json.loads(meta_path.read_text())
    started, total = time.time(), None
    enc = urllib.parse.quote(dataset, safe="")
    while time.time() - started < 9 and offset < HF_PREP_CAP:
        page = _public_json(f"{HF_VIEWER_URL}/rows?dataset={enc}&config={urllib.parse.quote(config, safe='')}"
                            f"&split={urllib.parse.quote(split, safe='')}&offset={offset}&length=100")
        total = page.get("num_rows_total") or 0
        got = [item.get("row") for item in page.get("rows") or []]
        converted = [_to_messages(r) for r in got]
        meta["skipped"] += sum(1 for c in converted if not c)
        with staging.open("a", encoding="utf-8") as handle:
            for c in converted:
                if c:
                    handle.write(json.dumps(c, ensure_ascii=False) + "\n")
        offset += len(got)
        if not got or offset >= total:
            break
    meta_path.write_text(json.dumps(meta))
    target = min(total or offset, HF_PREP_CAP)
    if offset < target:
        return {"done": False, "fetched": offset, "total": target}
    rows = [json.loads(l) for l in staging.read_text().splitlines() if l.strip()]
    if not rows:
        raise Problem(400, "None of this dataset's rows look like prompt → answer pairs that SFT can use.")
    lic = meta.get("license")
    entry = _write_split(f"hf:{dataset}", dataset, rows, eval_mode=eval_mode,
                         source=f"Hugging Face · {dataset} · {config}/{split}" + (f" · first {HF_PREP_CAP:,} rows" if (total or 0) > HF_PREP_CAP else ""),
                         license=lic if isinstance(lic, str) else ", ".join(lic or []),
                         data_key=f"hf:{dataset}@{meta.get('sha') or 'latest'}:{config}/{split}")
    staging.unlink(missing_ok=True)
    meta_path.unlink(missing_ok=True)
    return {"done": True, "fetched": offset, "total": target, "skipped": meta["skipped"], "dataset": entry}


def _selected_dataset():
    pipeline = json.loads(_store("pipeline.json").read_text()) if _store("pipeline.json").exists() else {}
    if pipeline.get("provider") != "wandb-training":
        raise Problem(409, "Choose CoreWeave Forge in the Provider step.")
    entry = _registry()["items"].get(pipeline.get("datasetId") or "")
    if not entry or not (entry.get("files") or {}).get("train"):
        raise Problem(409, "Choose a dataset first.")
    return pipeline, entry


def _prepared_training():
    pipeline, entry = _selected_dataset()
    split = {"dataset": entry["name"], "license": entry.get("license"), "eval_rows": entry.get("eval_rows")}
    return pipeline, split, entry["data_key"], _store(entry["files"]["train"])


def training_upload(body):
    """Send the prepared training split to the engine in batches; the app calls this until done."""
    pipeline, split, data_key, train_file = _prepared_training()
    method = "sft"  # TuningKit datasets always carry reference answers; RL runs use them as rewards' references
    cache = _store("engine-dataset.json")
    state = json.loads(cache.read_text()) if cache.exists() else {}
    if state.get("data_key") != data_key or state.get("method") != method:
        ds = engine("POST", "datasets", {"name": f"{split.get('dataset')} train", "method": method, "source": data_key,
                                          "license": split.get("license") or ""})
        state = {"data_key": data_key, "method": method, "dataset_id": ds["id"], "sent": 0, "sealed": False}
    if state.get("sealed"):
        return {"dataset_id": state["dataset_id"], "done": True, "sent": state["sent"], "total": state["sent"]}
    total = sum(1 for _ in train_file.open(encoding="utf-8"))
    rows = []
    with train_file.open(encoding="utf-8") as handle:
        for position, line in enumerate(handle):
            if position < state["sent"]:
                continue
            if len(rows) >= UPLOAD_BATCH:
                break
            rows.append(json.loads(line))
    if rows:
        engine("POST", f"datasets/{state['dataset_id']}/rows", {"rows": rows})
        state["sent"] += len(rows)
    if state["sent"] >= total:
        engine("POST", f"datasets/{state['dataset_id']}/seal", {})
        state["sealed"] = True
    cache.write_text(json.dumps(state))
    return {"dataset_id": state["dataset_id"], "done": state["sealed"], "sent": state["sent"], "total": total}


ENGINE_STATUS = {"QUEUED": "PREPARING", "STARTING": "PENDING"}


def _engine_public(r, local):
    return {"engine_run_id": r["id"], "request_id": local.get("request_id"), "data_key": local.get("data_key"), "run_label": r.get("label"),
            "status": ENGINE_STATUS.get(r["status"], r["status"]), "job_id": r.get("job_id"), "model_id": r.get("model_id"),
            "model_name": r.get("model_name"), "entity": r.get("entity"), "project": r.get("project"),
            "base_model": r.get("base_model"), "method": r.get("method"), "adapter": r.get("adapter"),
            "config": r.get("config"), "train_rows": r.get("train_rows"), "eval_rows": local.get("eval_rows"),
            "started_at": r.get("started_at"), "updated_at": r.get("updated_at"), "wandb_url": r.get("wandb_url"),
            "error": r.get("error"), "stopped_note": r.get("stopped_note"), "stop_requested": r.get("stop_requested"),
            "chunk_total": r.get("checkpoints_total"), "chunks_done": r.get("checkpoints_saved"),
            "chunk_minutes": r.get("checkpoint_minutes"), "kept_step": r.get("latest_checkpoint_step"),
            "trained_rows": r.get("trained_rows"), "total_rows": r.get("total_rows"), "eta_seconds": r.get("eta_seconds"),
            "events": r.get("events"), "via": ENGINE_SLUG, "rl": r.get("rl"), "rl_phase": r.get("rl_phase"),
            "rl_samples": r.get("rl_samples"), "mean_reward": r.get("mean_reward"), "steps_done": r.get("steps_done")}


def _save_engine_mirror(local, public):
    keep = {k: public.get(k) for k in ("status", "model_id", "model_name", "entity", "project", "base_model",
                                       "run_label", "kept_step", "job_id", "chunks_done", "chunk_total")}
    local.update(keep, updated_at=datetime.now(timezone.utc).isoformat(timespec="seconds"))
    _store("training-run.json").write_text(json.dumps(local, indent=2))


def _rl_from_pipeline(pipeline):
    rl = pipeline.get("rl") or {}
    reward = {"type": rl.get("reward") or "similarity"}
    if reward["type"] == "json_field":
        reward["field"] = rl.get("field") or ""
    if reward["type"] == "regex":
        reward["pattern"] = rl.get("pattern") or ""
    out = {"reward": reward}
    for k in ("steps", "prompts_per_step", "samples_per_prompt", "temperature", "max_tokens"):
        if rl.get(k) not in (None, ""):
            out[k] = rl[k]
    return out


def training_start(body):
    pipeline, split, data_key, _ = _prepared_training()
    current = _run_record()
    if current.get("status") in RUN_ACTIVE | {"PREPARING"}:
        raise Problem(409, "A training run is already in progress.")
    state = json.loads(_store("engine-dataset.json").read_text()) if _store("engine-dataset.json").exists() else {}
    if state.get("data_key") != data_key or not state.get("sealed"):
        raise Problem(409, "Upload the training data first.")
    expected = body.get("expected") or {}
    if expected.get("base_model") != pipeline.get("modelId") or expected.get("data_key") != data_key:
        raise Problem(409, "The setup changed since you confirmed. Press Train again.")
    params = {k: v for k, v in (pipeline.get("parameters") or {}).items() if v not in (None, "")}
    run = engine("POST", "runs", {"dataset_id": state["dataset_id"], "model": pipeline.get("modelId"),
                                  "method": pipeline.get("method") or "sft", "label": str(body.get("run_label") or "")[:80],
                                  "rl": _rl_from_pipeline(pipeline) if pipeline.get("method") == "rl" else None,
                                  "project": ENGINE_PROJECT, "parameters": params,
                                  "checkpoint_minutes": int(body.get("chunk_minutes") or 5)})
    local = {"engine_run_id": run["id"], "request_id": body.get("id"), "data_key": data_key,
             "eval_rows": split.get("eval_rows"), "started_at": run.get("created_at")}
    public = _engine_public(run, local)
    _save_engine_mirror(local, public)
    return {"run": public}


def _engine_record():
    record = _run_record()
    return record if record.get("engine_run_id") else None


def engine_training_status():
    local = _engine_record()
    r = engine("GET", f"runs/{local['engine_run_id']}")["run"]
    public = _engine_public(r, local)
    _save_engine_mirror(local, public)
    return {"run": public}


def engine_training_stop():
    local = _engine_record()
    r = engine("POST", f"runs/{local['engine_run_id']}/stop", {})["run"]
    public = _engine_public(r, local)
    _save_engine_mirror(local, public)
    return {"run": public}


def engine_training_rename(body):
    local = _engine_record()
    r = engine("POST", f"runs/{local['engine_run_id']}/rename", {"label": str((body or {}).get("label") or "")})["run"]
    public = _engine_public(r, local)
    _save_engine_mirror(local, public)
    return {"run": public}


def engine_telemetry():
    local = _engine_record()
    d = engine("GET", f"runs/{local['engine_run_id']}/metrics")
    history = []
    for p in d.get("points") or []:
        if d.get("method") == "rl":
            history.append({"_step": p["step"], "rl/reward": p["reward"], "rl/reward_max": p.get("reward_max"), "_timestamp": p.get("t")})
            continue
        row = {"sft/gradient_step": p["step"], "_step": p["step"], "sft/loss/train": p["loss"], "_timestamp": p.get("t")}
        if _finite(p.get("grad_norm")):
            row["sft/loss/grad_norm"] = p["grad_norm"]
        if _finite(p.get("learning_rate")):
            row["sft/loss/learning_rate"] = p["learning_rate"]
        history.append(row)
    status = ENGINE_STATUS.get(d.get("status"), d.get("status"))
    return {"provider": "coreweave-forge", "fetched_at": datetime.now(timezone.utc).isoformat(), "job_status": status,
            "run": {"name": local.get("run_label") or local.get("model_name"), "state": (status or "").lower(),
                    "history": history, "source": "tuning-engine", "archived": False, "url": None}}


def _engine_targets():
    local = _engine_record()
    if not local or not local.get("model_id"):
        return []
    try:
        d = engine("GET", f"runs/{local['engine_run_id']}/checkpoints")
    except Problem:
        return []
    return [{"id": f"engine:{local['engine_run_id']}:{c['step']}", "kind": "engine", "run_id": local["engine_run_id"],
             "label": f"{local.get('run_label') or local.get('model_name')} · step {c['step']:,}",
             "entity": local.get("entity"), "project": local.get("project"), "name": local.get("model_name"),
             "step": c["step"], "base_model": local.get("base_model"), "servable": True} for c in d.get("checkpoints") or []]


def _complete(target, step, messages, max_tokens):
    """One chat completion from a checkpoint, through the engine's infer route."""
    if target.get("kind") != "engine":
        raise Problem(409, "These weights are download-only; Forge cannot serve them.")
    d = engine("POST", "infer", {"run_id": target["run_id"], "step": step, "messages": messages,
                                 "max_tokens": max_tokens, "temperature": 0})
    return d.get("output") or "", d.get("finish_reason")

ROUTES = {
    ("GET", "provider/status"): lambda b: engine_status(),
    ("POST", "provider/connect"): engine_connect,
    ("GET", "provider/models"): lambda b: engine_models(),
    ("GET", "datasets/catalog"): dataset_catalog,
    ("POST", "datasets/upload"): dataset_upload,
    ("POST", "datasets/huggingface/prepare"): hf_prepare,
    ("GET", "provider/capabilities"): lambda b: engine_methods(),
    ("POST", "documents/pdf"): extract_pdf,
    ("POST", "datasets/huggingface/search"): search_huggingface,
    ("POST", "datasets/huggingface/link"): link_huggingface,
    ("POST", "training/upload"): training_upload,
    ("POST", "training/start"): training_start,
    ("GET", "training/status"): lambda b: engine_training_status() if _engine_record() else {"run": None},
    ("POST", "training/stop"): lambda b: engine_training_stop(),
    ("POST", "training/rename"): engine_training_rename,
    ("POST", "telemetry/sync"): lambda b: engine_telemetry() if _engine_record() else {"run": None},
    ("GET", "eval/checkpoints"): lambda b: eval_checkpoints(),
    ("POST", "eval/prepare"): eval_prepare,
    ("POST", "eval/sample"): eval_sample,
    ("POST", "bench/resolve"): bench_resolve,
    ("POST", "bench/suggest"): bench_suggest,
    ("POST", "bench/plan"): bench_plan,
    ("POST", "bench/sample"): bench_sample,
}


def main(req):
    if not isinstance(req, dict) or req.get("schema") != 1:
        raise Problem(400, "Invalid service request.")
    if (req.get("actor") or {}).get("scope") not in {"owner", "app"}:
        raise Problem(403, "Only this private app can use its service.")
    handler = ROUTES.get((req.get("method"), str(req.get("path") or "").strip("/")))
    if not handler:
        raise Problem(404, "Not found.")
    return handler(req.get("body") or {})


if __name__ == "__main__":
    try:
        result = main(json.load(sys.stdin))
        print(json.dumps({"status": 200, "body": result}))
    except Problem as exc:
        print(json.dumps({"status": exc.status, "body": {"error": exc.message}}))
    except Exception as exc:
        print(type(exc).__name__, file=sys.stderr)
        print(json.dumps({"status": 500, "body": {"error": "TuningKit hit an unexpected error."}}))
