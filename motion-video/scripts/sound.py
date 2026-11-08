#!/usr/bin/env python3
"""Generate a video's music bed and SFX library with ElevenLabs, from storyboard "sound".

usage:
  sound.py <project> [--dry-run]

storyboard.json:
  "sound": {"music": "upbeat modern electronic, driving drums", "bpm": 120, "sfx": true,
            "music_db": -7, "sfx_db": 0}

Writes audio/music.mp3, audio/sfx/<kind>-<n>.mp3 (several takes of each kind in SFX) and audio/sound.json. Cached: only a
changed prompt, BPM or a longer video regenerates. render.py mixes them: music ducks under the
narration; SFX play where motion.js places cues (ground-changing cuts, counters, highlights, and hand-spotted data-sfx).
Run after tts.py (the music length comes from the timeline). Key: $ELEVENLABS_API_KEY or Keychain
"elevenlabs-api".
"""
import argparse
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).parent))
import render  # noqa: E402
from tts import api_key  # noqa: E402

# kind: (prompt, seconds, takes). Several takes per repeated kind; render.py rotates them and nudges pitch and
# level so no two plays sound identical. One-off kinds (riser, stamp, sting) get one take.
SFX = {
    "whoosh": ("fast clean whoosh swish transition, short, airy, modern motion graphics", 0.6, 4),
    "hit": ("punchy cinematic impact hit, tight deep sub thump with a short snap, no reverb tail", 0.8, 3),
    "pop": ("soft subtle UI pop, rounded and short, gentle", 0.5, 3),
    "marker": ("felt tip highlighter marker swipe across paper, quick single stroke", 0.6, 3),
    # count is synthesized locally (see tick_roll): generated rolls came back with energy in the 300-3000 Hz voice
    # band, and under narration that murmur reads as a second person talking.
    "count": ("SYNTH tick roll, high-passed above the voice band", 2.5, 2),
    "riser": ("short tension riser swelling up into a hit, modern electronic, 2 seconds", 2.0, 1),
    "stamp": ("heavy rubber stamp slammed down on a desk, solid thud with a paper slap", 0.7, 1),
    "sting": ("short bright logo sting, clean modern chime with a soft whoosh, confident, ends cleanly", 1.6, 1),
    "tick": ("tiny crisp digital click tick, very short, UI", 0.5, 2),
}


def h(*parts):
    return hashlib.sha1(json.dumps(parts, sort_keys=True).encode()).hexdigest()[:12]


def tick_roll(out: Path, seconds: float, seed: int):
    """A counter's roll: crisp clicks at ~22-28/s, each a 4 ms noise burst high-passed at 3.5 kHz, so nothing sits
    where the narrator's voice does. Deterministic per seed."""
    import numpy as np
    sr, rng = 48000, np.random.default_rng(seed)
    x = np.zeros(int(sr * seconds))
    rate, t = 22 + 6 * seed, 0.0
    while t < seconds - 0.01:
        i, n = int(t * sr), int(0.004 * sr)
        burst = rng.standard_normal(n) * np.exp(-np.linspace(0, 6, n)) * rng.uniform(0.6, 1.0)
        x[i:i + n] += burst[: len(x) - i]
        t += 1 / rate * rng.uniform(0.9, 1.1)
    x /= np.abs(x).max()
    raw = out.with_suffix(".f32")
    raw.write_bytes(x.astype("<f4").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", str(raw),
                    "-af", "highpass=f=3500:poles=2,highpass=f=3500:poles=2", "-b:a", "192k", str(out)], check=True)
    raw.unlink()


def trim_lead(path: Path):
    tmp = path.with_suffix(".trim.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02",
                    "-b:a", "192k", str(tmp)], check=True)
    tmp.replace(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    proj = Path(args.project).resolve()
    sb, narrated, tim = render.load(proj)
    snd = sb.get("sound")
    if not snd:
        sys.exit('storyboard has no "sound" block')
    tl, _ = render.build_timeline(sb, narrated, tim)
    bpm = int(snd.get("bpm", 120))
    length = int(math.ceil((tl["total"] + 2) / 5) * 5)  # round up to 5 s so small edits reuse the track

    d = proj / "audio"
    (d / "sfx").mkdir(parents=True, exist_ok=True)
    meta_p = d / "sound.json"
    meta = json.loads(meta_p.read_text()) if meta_p.exists() else {}
    todo = []
    if snd.get("music"):
        prompt = (f"{snd['music']}. {bpm} BPM, steady beat from the very first bar, no intro, no vocals, "
                  f"energetic and modern, consistent groove, ends on a clean final hit")
        key = h(prompt, length)
        if meta.get("music_hash") != key or not (d / "music.mp3").exists():
            todo.append(("music", prompt, length, key))
    if snd.get("sfx", True):
        for kind, (prompt, dur, takes) in SFX.items():
            for n in range(takes):
                name = f"{kind}-{n + 1}"
                key = h(prompt, dur, n)
                if meta.get("sfx_hash", {}).get(name) != key or not (d / "sfx" / f"{name}.mp3").exists():
                    todo.append((name, prompt, dur, key))
    print(f"video {tl['total']:.1f}s; to generate: {', '.join(t[0] for t in todo) or 'nothing (cached)'}")
    if args.dry_run:
        return
    k = api_key() if any(not t[1].startswith("SYNTH") for t in todo) else None
    for kind, prompt, ln, key in todo:
        if prompt.startswith("SYNTH"):
            out = d / "sfx" / f"{kind}.mp3"
            tick_roll(out, ln, int(kind.rsplit("-", 1)[1]))
            meta.setdefault("sfx_hash", {})[kind] = key
            print(f"  made {out.relative_to(proj)} (synthesized)")
            continue
        if kind == "music":
            r = requests.post("https://api.elevenlabs.io/v1/music", headers={"xi-api-key": k},
                              json={"prompt": prompt, "music_length_ms": ln * 1000}, timeout=300)
            out = d / "music.mp3"
        else:
            r = requests.post("https://api.elevenlabs.io/v1/sound-generation", headers={"xi-api-key": k},
                              json={"text": prompt, "duration_seconds": ln, "prompt_influence": 0.6}, timeout=120)
            out = d / "sfx" / f"{kind}.mp3"
        if r.status_code != 200:
            sys.exit(f"ElevenLabs error on {kind}: {r.status_code} {r.text[:300]}")
        out.write_bytes(r.content)
        trim_lead(out)
        if kind == "music":
            meta["music_hash"] = key
        else:
            meta.setdefault("sfx_hash", {})[kind] = key
        print(f"  made {out.relative_to(proj)}")
    meta["music"] = "audio/music.mp3" if snd.get("music") else None
    meta["sfx"] = {kk: [f"audio/sfx/{kk}-{n + 1}.mp3" for n in range(t) if (d / "sfx" / f"{kk}-{n + 1}.mp3").exists()]
                   for kk, (_, _, t) in SFX.items()} if snd.get("sfx", True) else {}
    meta["sfx"] = {kk: v for kk, v in meta["sfx"].items() if v}
    meta_p.write_text(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
