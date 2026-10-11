import json
import base64
import io
import unittest
from pathlib import Path
from unittest import mock

import service
from pypdf import PdfWriter


ROOT = Path(__file__).resolve().parent


class TuningKitTests(unittest.TestCase):
    def setUp(self):
        self.source = (ROOT / "service.py").read_text()
        self.ui = (ROOT / "index.jsx").read_text()

    def test_tuningkit_holds_no_credentials(self):
        self.assertNotIn("/secrets/", self.source)
        self.assertNotIn("wandb-api-key", self.source)
        self.assertIn('request(\'provider/connect\'', self.ui)
        self.assertIn('engine("POST", "connect"', self.source)

    def test_provider_work_goes_through_the_tuning_engine(self):
        self.assertIn('/api/services/{ENGINE_SLUG}/v1/', self.source)
        self.assertNotIn("forge.coreweave.com", self.source)
        self.assertNotIn("api.wandb.ai", self.source)
        for route in ("provider/models", "provider/capabilities", "training/upload", "training/start",
                      "training/status", "training/stop", "telemetry/sync", "eval/sample"):
            self.assertIn(f'"{route}"', self.source)

    def test_engine_calls_use_the_app_token(self):
        calls = []

        class Reply:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self, *args):
                return json.dumps({"connected": True, "entity": "team"}).encode()

        def fake_urlopen(request, timeout=None):
            calls.append(request)
            return Reply()

        with mock.patch.object(service, "API_BASE", "http://backend"), \
                mock.patch.object(service, "APP_TOKEN", "app-token"), \
                mock.patch.object(service.urllib.request, "urlopen", fake_urlopen):
            status = service.main({"schema": 1, "actor": {"scope": "app"}, "method": "GET", "path": "provider/status"})
        self.assertTrue(status["connected"])
        self.assertEqual(calls[0].full_url, "http://backend/api/services/tuning-engine/v1/status")
        self.assertEqual(calls[0].headers["Authorization"], "Bearer app-token")

    def test_app_has_no_embedded_chat(self):
        manifest = json.loads((ROOT / "mobius.json").read_text())
        self.assertNotIn("embeds_agent", manifest)
        self.assertFalse((ROOT / "FineTuneChat.jsx").exists())
        self.assertNotIn("FineTuneChat", self.ui)

    def test_no_launcher_scripts_or_schedule_remain(self):
        manifest = json.loads((ROOT / "mobius.json").read_text())
        self.assertNotIn("schedule", manifest)
        self.assertFalse((ROOT / "forge_train.py").exists())
        self.assertFalse((ROOT / "tick.sh").exists())

    def test_image_only_pdf_is_retained_and_flagged_for_ocr(self):
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        buffer = io.BytesIO()
        writer.write(buffer)
        result = service.main(
            {
                "schema": 1,
                "actor": {"scope": "owner"},
                "method": "POST",
                "path": "documents/pdf",
                "body": {
                    "filename": "scan.pdf",
                    "data_base64": base64.b64encode(buffer.getvalue()).decode(),
                },
            }
        )
        self.assertTrue(result["needs_ocr"])
        self.assertEqual(result["extraction"], "ocr-required")

    def test_fake_pdf_is_rejected(self):
        with self.assertRaises(service.Problem) as caught:
            service.extract_pdf(
                {
                    "filename": "fake.pdf",
                    "data_base64": base64.b64encode(b"not a pdf").decode(),
                }
            )
        self.assertEqual(caught.exception.status, 400)


if __name__ == "__main__":
    unittest.main()
