#!/usr/bin/env bash
# Idempotent environment check/install for animated-explainer. Safe to run every time; fast once set up.
set -euo pipefail
VENV="$HOME/.local/share/animated-explainer/venv"
if [ "$(uname -s)" != "Darwin" ] || ! command -v brew >/dev/null; then
  echo "This setup script requires macOS with Homebrew. Install the runtime dependencies manually on other platforms."
  exit 1
fi

for b in ffmpeg ffprobe uv; do command -v "$b" >/dev/null || { echo "missing $b (brew install ${b/ffprobe/ffmpeg})"; exit 1; }; done
if ! brew list cairo pango pkg-config >/dev/null 2>&1; then brew install cairo pango pkg-config; fi
if [ ! -x "$VENV/bin/manim" ]; then
  uv venv --python 3.12 "$VENV"
  VIRTUAL_ENV="$VENV" uv pip install "manim==0.21.0" requests
fi
if [ -z "${ELEVENLABS_API_KEY:-}" ] && ! security find-generic-password -s elevenlabs-api -w >/dev/null 2>&1; then
  echo "No ElevenLabs key. Ask the user to run: security add-generic-password -s elevenlabs-api -a \$USER -w <key>"; exit 1
fi
"$VENV/bin/python" - <<'PYFONT'
import manimpango
if "Avenir Next" not in manimpango.list_fonts():
    raise SystemExit("Missing Avenir Next font. Restore the macOS system font or choose an installed font in assets/kurz.py and rerun setup.")
PYFONT
echo "ready: $("$VENV/bin/manim" --version 2>&1 | tail -1)  python=$VENV/bin/python"
