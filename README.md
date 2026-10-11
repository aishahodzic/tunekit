# TuningKit

TuningKit is the guided visual interface for building, running, and evaluating
fine-tunes in Möbius. It helps users choose a training method, compatible base
model, dataset shape, and hyperparameters without hiding the underlying run.

TuningKit does not implement provider training itself. It is the reference
client for the shared **Tuning Engine** app:

```text
documents or dataset → TuningKit → Tuning Engine → W&B / CoreWeave Forge
```

## What TuningKit provides

- Built-in starters (a prompt-router dataset and one-click Alpaca), uploads,
  documents, and linked Hugging Face datasets
- Method-specific data review for SFT and RL
- Live model and method choices from the engine
- Hyperparameters and optional search configuration
- Explicit review before a paid run starts
- Live training progress, metrics, checkpoints, stopping, and evaluation

## Requirements

Tuning Engine must be installed. The user connects a W&B API key through the
Provider step; TuningKit forwards it directly to the engine's encrypted store
and never keeps it. W&B/CoreWeave Forge handles managed training and billing,
so a separate CoreWeave API key is not required.

## Relationship to use-case apps

TuningKit is a general-purpose workflow, not a library that other app UIs
import. A specialized app (for example, a personal writing-style tuner) should
call Tuning Engine directly for datasets and runs. It may open TuningKit when the user wants the
general-purpose workflow or manual inspection.

This distinction keeps the products clear:

- **Tuning Engine** — reusable backend and agent tools
- **TuningKit** — user-facing workflow built on the engine
- **Use-case apps** — focused experiences that share the engine

See the Tuning Engine app's `README.md` and installed `tuning-engine.md` skill
for its service routes, agent tools, dataset formats, approval boundary, and
checkpoint lifecycle.
