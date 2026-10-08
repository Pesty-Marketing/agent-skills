"""Paid-call recovery checks. All API, credentials, and audio probes are mocked."""
import base64
import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


SPEC = importlib.util.spec_from_file_location(
    "explainer_tts", Path(__file__).resolve().parents[1] / "scripts/tts.py"
)
tts = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(tts)


class NarrationCacheTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.project = Path(self.directory.name)
        self.lines = ["A clear next action.", "Then record the outcome."]
        storyboard = {"acts": [{"id": "hook", "scene": "Hook", "beats": [
            {"id": f"hook-{i + 1}", "narration": line, "visual": "A card appears."}
            for i, line in enumerate(self.lines)
        ]}]}
        (self.project / "storyboard.json").write_text(json.dumps(storyboard))

    def response(self):
        alignment = {
            "characters": list("Test."),
            "character_start_times_seconds": [0, .2, .4, .6, .8],
            "character_end_times_seconds": [.2, .4, .6, .8, 1],
        }
        return Mock(status_code=200, json=Mock(return_value={
            "audio_base64": base64.b64encode(b"mock-audio").decode(),
            "alignment": alignment,
        }))

    def run_tts(self, *options):
        output = io.StringIO()
        with patch.object(tts.sys, "argv", ["tts.py", str(self.project), *options]), \
                contextlib.redirect_stdout(output):
            tts.main()
        return output.getvalue()

    def test_interrupted_run_reuses_paid_beat_and_cached_run_needs_no_key(self):
        with patch.object(tts, "api_key", return_value="mock-key"), \
                patch.object(tts, "probe_duration", return_value=1), \
                patch.object(tts.requests, "post", side_effect=[
                    self.response(), Mock(status_code=429, text="rate limit")
                ]) as post:
            with self.assertRaises(SystemExit):
                self.run_tts()
            self.assertEqual(post.call_count, 2)
        self.assertTrue((self.project / "audio/hook-1.mp3").exists())
        self.assertFalse((self.project / "timings.json").exists())
        self.assertIn("hook-1", json.loads(
            (self.project / "audio/cache.json").read_text())["beats"])

        with patch.object(tts, "api_key", side_effect=AssertionError("key accessed")), \
                patch.object(tts.requests, "post", side_effect=AssertionError("API called")):
            output = self.run_tts("--dry-run")
        self.assertIn(f"would bill {len(self.lines[1])} characters", output)

        with patch.object(tts, "api_key", return_value="mock-key"), \
                patch.object(tts, "probe_duration", return_value=1), \
                patch.object(tts.requests, "post", return_value=self.response()) as post:
            self.run_tts()
            self.assertEqual(post.call_count, 1)
            self.assertEqual(post.call_args.kwargs["json"]["text"], self.lines[1])

        with patch.object(tts, "api_key", side_effect=AssertionError("key accessed")), \
                patch.object(tts.requests, "post", side_effect=AssertionError("API called")):
            output = self.run_tts()
        self.assertIn("billed 0 characters", output)
        self.assertEqual(len(json.loads((self.project / "timings.json").read_text())["beats"]), 2)


if __name__ == "__main__":
    unittest.main()
