#!/usr/bin/env python3
"""Narrate every scene in storyboard.json with ElevenLabs and record word timings.

usage: tts.py <project> [--voice ID] [--model ID] [--dry-run] [--max-chars N]

Writes <project>/audio/<scene_id>.mp3 and <project>/timings.json:
  {"voice":..., "model":..., "scenes": {"hook": {"audio": "audio/hook.mp3", "duration": 4.12,
     "words": [{"w": "Ever", "start": 0.0, "end": 0.21}, ...], "hash": ...}}}
Word times are relative to the clip; render.py places each clip in the timeline.

Voice: --voice, else storyboard "voice", else the theme default (pesty -> Chris, neutral -> George).
Unchanged lines are reused from cache, so an edit only bills the changed scenes. The API key comes
from $ELEVENLABS_API_KEY or the macOS Keychain item "elevenlabs-api" (never stored in the project).
Adapted from the animated-explainer skill's tts.py so this skill installs on its own.
"""
import argparse
import base64
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import requests

THEME_VOICE = {"pesty": "iP95p4xoKVk53GoZ742B",   # Chris: American male, the Pesty narrator
               "neutral": "JBFqnCBsd6RMkjVDRZzb"}  # George: warm storyteller
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


def speech_end(path: Path, dur: float) -> float:
    """Where the voice stops: ElevenLabs pads ~0.5 s of silence after the last word, which drags the cut."""
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=n=-40dB:d=0.2", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    last_start, ended = None, True
    for line in log.splitlines():
        if "silence_start:" in line:
            last_start, ended = float(line.split("silence_start:")[1]), False
        elif "silence_end:" in line:
            ended = float(line.split("silence_end:")[1].split("|")[0]) < dur - 0.05
    if last_start is not None and not ended and last_start > dur * 0.5:
        return round(min(dur, last_start + 0.08), 3)
    return dur


def stretch(src: Path, out: Path, tempo: float):
    """Speed a voice up without changing pitch. Rubber Band's R3 engine keeps one clean voice; ffmpeg atempo
    (the fallback) smears speech into a faint doubled echo that listeners hear as two voices at once."""
    rb = shutil.which("rubberband")
    if not rb:
        print("  WARNING: rubberband not installed (brew install rubberband); atempo will sound doubled", file=sys.stderr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", f"atempo={tempo}",
                        "-b:a", "192k", str(out)], check=True)
        return
    a, b = out.with_suffix(".in.wav"), out.with_suffix(".out.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ar", "44100", str(a)], check=True)
    subprocess.run([rb, "-q", "-3", "-F", "-T", str(tempo), str(a), str(b)], check=True, capture_output=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(b), "-b:a", "192k", str(out)], check=True)
    a.unlink(); b.unlink()


def tighten(raw: Path, out: Path, words: list, dur: float, maxgap: float):
    """Shorten every pause inside a line to maxgap seconds (pace "punchy"), and remap word times to match."""
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", f"silencedetect=n=-38dB:d={maxgap + 0.06}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    sil, st = [], None
    for line in log.splitlines():
        if "silence_start:" in line:
            st = float(line.split("silence_start:")[1])
        elif "silence_end:" in line and st is not None:
            en = float(line.split("silence_end:")[1].split("|")[0])
            if st > 0.05 and en < dur - 0.05:
                sil.append((st + maxgap / 2, en - maxgap / 2))  # the part to cut
            st = None
    if not sil:
        shutil.copy(raw, out)
        return words, dur
    keep, t0 = [], 0.0
    for a, b in sil:
        keep.append((t0, a)); t0 = b
    keep.append((t0, dur))
    fc = "".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[k{i}];" for i, (a, b) in enumerate(keep))
    fc += "".join(f"[k{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[o]"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-filter_complex", fc, "-map", "[o]", "-b:a", "192k", str(out)], check=True)

    def m(t):
        cut = 0.0
        for a, b in sil:
            if t >= b:
                cut += b - a
            elif t > a:
                return round(a - cut, 3)
        return round(t - cut, 3)
    return [{"w": w["w"], "start": m(w["start"]), "end": m(w["end"])} for w in words], dur - sum(b - a for a, b in sil)


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
    ap.add_argument("--max-chars", type=int, help="refuse to run if this would bill more than N characters")
    args = ap.parse_args()

    proj = Path(args.project).resolve()
    sb = json.loads((proj / "storyboard.json").read_text())
    voice = args.voice or sb.get("voice") or THEME_VOICE.get(sb.get("theme", "pesty"), THEME_VOICE["neutral"])
    model = args.model or sb.get("model") or DEFAULT_MODEL
    # Narration pace: storyboard "speed" (ElevenLabs 0.7-1.2). Narrated presets default to 1.1: brisk, still natural.
    settings = {**VOICE_SETTINGS, "speed": float(sb.get("speed", 1.1))}
    if sb.get("pace") == "punchy":  # higher-energy, more expressive read
        settings.update({"stability": 0.4, "style": 0.2})
    lines = [(s["id"], (s.get("narration") or "").strip()) for s in sb["scenes"]]
    lines = [(i, t) for i, t in lines if t]
    if not lines:
        sys.exit("no scene has narration; set \"narration\": false in storyboard.json for a silent video")

    (proj / "audio").mkdir(exist_ok=True)
    cache_path = proj / "audio" / "cache.json"
    old = json.loads(cache_path.read_text()).get("scenes", {}) if cache_path.exists() else {}
    h = lambda text: hashlib.sha1(json.dumps([text, voice, model, settings], sort_keys=True).encode()).hexdigest()[:12]
    cached = lambda i, text: old.get(i, {}).get("hash") == h(text) and (proj / "audio" / f"{i}.mp3").exists()
    to_bill = sum(len(t) for i, t in lines if not cached(i, t))
    if args.dry_run:
        print(f"would bill {to_bill} characters ({sum(len(t) for _, t in lines)} in script), voice {voice}")
        return
    if args.max_chars is not None and to_bill > args.max_chars:
        sys.exit(f"would bill {to_bill} characters, over --max-chars {args.max_chars}")
    key = api_key() if to_bill else None

    out = {}
    for n, (i, text) in enumerate(lines):
        mp3 = proj / "audio" / f"{i}.mp3"
        if cached(i, text):
            out[i] = old[i]
            continue
        body = {"text": text, "model_id": model, "voice_settings": settings}
        if n > 0:
            body["previous_text"] = lines[n - 1][1]
        if n + 1 < len(lines):
            body["next_text"] = lines[n + 1][1]
        r = requests.post(API.format(voice=voice), headers={"xi-api-key": key}, json=body, timeout=120)
        if r.status_code == 400 and "previous_text" in r.text:
            body.pop("previous_text", None)
            body.pop("next_text", None)
            r = requests.post(API.format(voice=voice), headers={"xi-api-key": key}, json=body, timeout=120)
        if r.status_code != 200:
            sys.exit(f"ElevenLabs error on scene {i}: {r.status_code} {r.text[:300]}")
        data = r.json()
        mp3.write_bytes(base64.b64decode(data["audio_base64"]))
        out[i] = {"audio": f"audio/{i}.mp3", "duration": round(probe_duration(mp3), 3),
                  "words": words_from_alignment(data.get("alignment") or data.get("normalized_alignment")), "hash": h(text)}
        cache_path.write_text(json.dumps({"scenes": {**old, **out}}, indent=2))  # paid work survives an interrupt
        print(f"  voiced {i:<16} {out[i]['duration']:5.1f}s")

    maxgap = sb.get("max_pause", 0.15 if sb.get("pace") == "punchy" else None)
    # "tempo": post-process speed-up (Rubber Band R3, pitch and formants kept). ElevenLabs "speed" tops out at 1.2 and barely
    # moves the clock; tempo 1.15-1.3 gets a fast YouTube-narrator read (~180-200 spoken wpm).
    tempo = float(sb.get("tempo", 1.0))
    for i, v in list(out.items()):  # local post-processing on a copy; the cache keeps the raw take
        v = out[i] = json.loads(json.dumps(v))
        if maxgap:
            raw = proj / "audio" / f"{i}.mp3"
            tight = proj / "audio" / f"{i}.tight.mp3"
            v["words"], _ = tighten(raw, tight, v["words"], probe_duration(raw), float(maxgap))
            v["audio"] = f"audio/{i}.tight.mp3"
        if tempo != 1.0:  # pitch-preserving speed-up past ElevenLabs' 1.2 ceiling
            src = proj / v["audio"]
            fast = proj / "audio" / f"{i}.fast.mp3"
            stretch(src, fast, tempo)
            v["words"] = [{"w": w["w"], "start": round(w["start"] / tempo, 3), "end": round(w["end"] / tempo, 3)} for w in v["words"]]
            v["audio"] = f"audio/{i}.fast.mp3"
        full = probe_duration(proj / v["audio"])
        # silence detection can mistake a soft last word ("months") for the end; never end before the aligned last word
        last = max((w["end"] for w in v["words"]), default=0.0)
        v["duration"] = round(min(full, max(speech_end(proj / v["audio"], full), last + 0.05)), 3)
        for w in v["words"]:
            w["end"] = min(w["end"], v["duration"])
    (proj / "timings.json").write_text(json.dumps({"voice": voice, "model": model, "scenes": out}, indent=2))
    total = sum(v["duration"] for v in out.values())
    print(f"billed {to_bill} characters; narration {total:.1f}s across {len(out)} scenes")


if __name__ == "__main__":
    main()
