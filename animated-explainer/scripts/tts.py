#!/usr/bin/env python3
"""Narrate every beat in storyboard.json with ElevenLabs and record exact timings.

usage: tts.py <project_dir> [--voice ID] [--model ID] [--dry-run] [--max-chars N]

Writes <project>/audio/<beat_id>.mp3 and <project>/timings.json:
  {"voice":..., "model":..., "total": seconds,
   "beats": {"hook-1": {"audio": "audio/hook-1.mp3", "duration": 4.12,
                         "words": [{"w": "Ever", "start": 0.0, "end": 0.21}, ...]}}}

Beats whose text, voice and model are unchanged are reused from cache, so re-running after a
script edit only bills the changed lines. The API key comes from $ELEVENLABS_API_KEY or the
macOS Keychain item "elevenlabs-api".
"""
import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

import requests

DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb"  # George: warm, captivating storyteller
DEFAULT_MODEL = "eleven_v4"
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True}
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128"


def api_key() -> str:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        return key
    try:
        return subprocess.check_output(["security", "find-generic-password", "-s", "elevenlabs-api", "-w"], text=True).strip()
    except subprocess.CalledProcessError:
        sys.exit("No ElevenLabs key: set ELEVENLABS_API_KEY or run "
                 "`security add-generic-password -s elevenlabs-api -a $USER -w <key>`")


def probe_duration(path: Path) -> float:
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], text=True)
    return float(out.strip())


def words_from_alignment(al: dict) -> list[dict]:
    words, cur, start, end = [], "", None, None
    for ch, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "start": round(start, 3), "end": round(end, 3)})
            cur, start = "", None
            continue
        if start is None:
            start = s
        cur += ch
        end = e
    if cur:
        words.append({"w": cur, "start": round(start, 3), "end": round(end, 3)})
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--voice")
    ap.add_argument("--model")
    ap.add_argument("--dry-run", action="store_true", help="count characters that would be billed, call nothing")
    ap.add_argument("--max-chars", type=int, help="refuse to run if this would bill more characters than N")
    args = ap.parse_args()

    proj = Path(args.project).resolve()
    sb = json.loads((proj / "storyboard.json").read_text())
    voice = args.voice or sb.get("voice") or DEFAULT_VOICE
    model = args.model or sb.get("model") or DEFAULT_MODEL

    beats = [(act, b) for act in sb["acts"] for b in act["beats"]]
    ids = [b["id"] for _, b in beats]
    if len(ids) != len(set(ids)):
        sys.exit("duplicate beat ids in storyboard.json")

    (proj / "audio").mkdir(exist_ok=True)
    old = {}
    if (proj / "timings.json").exists():
        old = json.loads((proj / "timings.json").read_text()).get("beats", {})

    cache_path = proj / "audio" / "cache.json"
    if cache_path.exists():
        old.update(json.loads(cache_path.read_text()).get("beats", {}))

    to_bill = sum(len(b["narration"].strip()) for _, b in beats
                  if not (old.get(b["id"], {}).get("hash") == hashlib.sha1(json.dumps([b["narration"].strip(), voice, model, VOICE_SETTINGS], sort_keys=True).encode()).hexdigest()[:12]
                          and (proj / "audio" / f"{b['id']}.mp3").exists()))
    if args.max_chars is not None and to_bill > args.max_chars and not args.dry_run:
        sys.exit(f"would bill {to_bill} characters, over --max-chars {args.max_chars}; trim the script or raise the cap")
    key = None if args.dry_run or to_bill == 0 else api_key()
    out, billed = {}, 0
    for i, (act, b) in enumerate(beats):
        text = b["narration"].strip()
        h = hashlib.sha1(json.dumps([text, voice, model, VOICE_SETTINGS], sort_keys=True).encode()).hexdigest()[:12]
        mp3 = proj / "audio" / f"{b['id']}.mp3"
        if old.get(b["id"], {}).get("hash") == h and mp3.exists():
            out[b["id"]] = old[b["id"]]
            continue
        billed += len(text)
        if args.dry_run:
            continue
        body = {"text": text, "model_id": model, "voice_settings": VOICE_SETTINGS}
        # Neighbouring lines keep intonation continuous across separately generated beats.
        if i > 0:
            body["previous_text"] = beats[i - 1][1]["narration"]
        if i + 1 < len(beats):
            body["next_text"] = beats[i + 1][1]["narration"]
        r = requests.post(API.format(voice=voice), headers={"xi-api-key": key}, json=body, timeout=120)
        if r.status_code == 400 and "previous_text" in r.text:
            body.pop("previous_text", None)
            body.pop("next_text", None)
            r = requests.post(API.format(voice=voice), headers={"xi-api-key": key}, json=body, timeout=120)
        if r.status_code != 200:
            sys.exit(f"ElevenLabs error on beat {b['id']}: {r.status_code} {r.text[:300]}")
        data = r.json()
        mp3.write_bytes(base64.b64decode(data["audio_base64"]))
        out[b["id"]] = {
            "audio": f"audio/{b['id']}.mp3",
            "duration": round(probe_duration(mp3), 3),
            "words": words_from_alignment(data.get("alignment") or data.get("normalized_alignment")),
            "hash": h,
        }
        # Persist paid work immediately; an interrupted run can resume without re-billing it.
        cache_path.write_text(json.dumps({"beats": {**old, **out}}, indent=2))
        print(f"  voiced {b['id']:<14} {out[b['id']]['duration']:5.1f}s")

    if args.dry_run:
        print(f"would bill {billed} characters ({sum(len(b['narration']) for _, b in beats)} total in script)")
        return

    total = sum(v["duration"] for v in out.values()) + 0.25 * len(out)
    (proj / "timings.json").write_text(json.dumps({"voice": voice, "model": model, "total": round(total, 2), "beats": out}, indent=2))

    print(f"\nbilled {billed} characters this run")
    # Act balance: shares of the runtime, against the 80/20 shape (engine carries the most time).
    ideal = {"hook": (0.10, 0.20), "concept": (0.20, 0.33), "engine": (0.38, 0.55), "takeaway": (0.08, 0.18)}
    t = 0.0
    for act in sb["acts"]:
        d = sum(out[b["id"]]["duration"] + 0.25 for b in act["beats"])
        share = d / total
        aid = act.get("id") or act.get("scene", "?").lower()
        lo, hi = ideal.get(aid, (0, 1))
        flag = "" if lo <= share <= hi else f"   <- outside {lo:.0%}-{hi:.0%}"
        print(f"  {aid:<10} {t:6.1f}s -> {t + d:6.1f}s  ({d:5.1f}s, {share:4.0%}){flag}")
        t += d
    print(f"narration total ~{total:.0f}s (+ transitions)")
    if total < 130:
        print("WARNING: too short - the video must be at least 120 s after rendering. Add beats (more engine depth, "
              "a concrete example) and re-run; only new or changed lines are billed.")
    elif total > 230:
        print("WARNING: too long for the 4-minute cap - cut nice-to-knows and re-run.")


if __name__ == "__main__":
    main()
