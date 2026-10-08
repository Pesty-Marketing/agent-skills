"""Run with python3 -m unittest discover -s transcript-cleanup/tests."""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
SPEECH = "We counted 12 percent of the accounts. The figure was eighty. " * 12


class TranscriptScriptsTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.raw = self.root / "raw.md"
        self.raw.write_text("# Synthetic source\n" + SPEECH)

    def run_script(self, name, *args):
        return subprocess.run(
            [sys.executable, str(SCRIPTS / name), *map(str, args)],
            capture_output=True, text=True,
        )

    def check(self, *, answer="**Speaker:** We do not know yet.",
              accounting='1. "eighty" — unit unresolved.',
              question='1. What does eighty mean? — word 10, "the figure was eighty".',
              options=()):
        cleaned = self.root / "cleaned.md"
        cleaned.write_text(
            "# Synthetic meeting\n\n"
            "**Speaker:** Test speaker\n**Meeting:** Test\n"
            "**Date:** 2026-10-08\n**Source:** Synthetic source, raw.md\n\n"
            "## Account review\n\n" + SPEECH +
            '\n\nThe figure was eighty [? raw: "eighty"].\n\n'
            "## Q&A\n\n**Audience:** Do we know the units?\n\n" + answer +
            "\n\n## Editor's note\n\n" + accounting +
            "\n\n**Reviewer corrections:** Checked eighty and all units against RAW.\n\n"
            "## Open questions\n\n" + question + "\n"
        )
        return self.run_script("check_cleaned.py", self.raw, cleaned, *options)

    def test_valid_transcript_and_min_ratio_option(self):
        result = self.check(options=("--min-ratio", "0.95"))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_unanswered_question_and_room_aside_do_not_count_as_answer(self):
        for answer in ("", "> [Room: microphone noise.]",
                       "**Audience:** Are we finished?"):
            with self.subTest(answer=answer):
                result = self.check(answer=answer)
                self.assertEqual(result.returncode, 1, result.stdout)

    def test_room_aside_followed_by_speaker_answer_is_valid(self):
        result = self.check(answer="> [Room: microphone noise.]\n\n"
                                   "**Speaker:** We do not know yet.")
        self.assertEqual(result.returncode, 0, result.stdout)

    def test_review_comment_does_not_replace_flag_accounting(self):
        result = self.check(accounting="1. All names were checked.")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertIn("uncertainty raw strings", result.stdout)

    def test_open_question_requires_locator(self):
        result = self.check(question="1. What does eighty mean?")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertIn("locator", result.stdout)

    def test_figure_candidates_include_numeric_percent(self):
        result = self.run_script("glossary_candidates.py", self.raw)
        self.assertEqual(result.returncode, 0, result.stderr)
        figures = result.stdout.split("## Figures", 1)[1].split("\n## ", 1)[0]
        self.assertIn("12 percent", figures)

    def test_wpm_option_is_not_interpreted_as_a_phrase(self):
        result = self.run_script("locate.py", self.raw, "figure was eighty",
                                 "--wpm", "180")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("180 wpm", result.stdout)
        self.assertNotIn("NOT FOUND", result.stdout)


if __name__ == "__main__":
    unittest.main()
