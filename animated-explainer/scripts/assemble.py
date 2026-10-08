#!/usr/bin/env python3
"""Join rendered act scenes into the final video, write captions, and verify the result.

usage: assemble.py <project_dir> [--out DIR]

Scene order comes from storyboard.json (acts[].scene). Captions are timed from the beat start
times each scene logged while rendering plus the per-word ElevenLabs timings, so they stay in
sync even when animations ran longer than the narration.

Writes <out>/explainer.mp4 and <out>/captions.srt (out defaults to the project dir) and exits
non-zero if the checks fail: 1920x1080, has audio, 120-240 s, captions cover the narration.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

MAX_CHARS = 84  # two lines of ~42


def probe(path: Path) -> dict:
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height",
                                   "-of", "json", str(path)], text=True)
    return json.loads(out)


def fmt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def cues_for_beat(words: list[dict], offset: float) -> list[tuple[float, float, str]]:
    cues, cur = [], []
    for w in words:
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        ends_sentence = w["w"][-1:] in ".?!"
        soft_break = w["w"][-1:] in ",;:—" and len(text) > 40
        if len(text) > MAX_CHARS - 10 or ends_sentence or soft_break or (cur[-1]["end"] - cur[0]["start"] > 5.5):
            cues.append((offset + cur[0]["start"], offset + cur[-1]["end"], text))
            cur = []
    if cur:
        cues.append((offset + cur[0]["start"], offset + cur[-1]["end"], " ".join(x["w"] for x in cur)))
    return cues


def wrap(text: str) -> str:
    if len(text) <= 42:
        return text
    mid = len(text) // 2
    left, right = text.rfind(" ", 0, mid + 1), text.find(" ", mid)
    cut = left if right == -1 or (left != -1 and mid - left <= right - mid) else right
    return text[:cut] + "\n" + text[cut + 1:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--out")
    ap.add_argument("--any-length", action="store_true", help="skip the 120-240 s check (smoke tests)")
    args = ap.parse_args()
    proj = Path(args.project).resolve()
    out = Path(args.out).expanduser().resolve() if args.out else proj
    out.mkdir(parents=True, exist_ok=True)

    sb = json.loads((proj / "storyboard.json").read_text())
    timings = json.loads((proj / "timings.json").read_text())["beats"]
    scenes = []
    for act in sb["acts"]:
        if act["scene"] not in scenes:
            scenes.append(act["scene"])

    files = []
    for s in scenes:
        hits = sorted(proj.glob(f"media/videos/**/1080p*/{s}.mp4"))
        if not hits:
            sys.exit(f"missing render for scene {s} (expected media/videos/**/1080p*/{s}.mp4)")
        newer = [h for h in proj.glob(f"media/videos/**/{s}.mp4") if h.stat().st_mtime > hits[-1].stat().st_mtime
                 and "1080p" not in str(h)]
        if newer:
            sys.exit(f"scene {s}: a preview ({newer[0].parent.name}) is newer than the 1080p render, so the final is "
                     f"stale; re-render it with -qh")
        files.append(hits[-1])

    lst = proj / "build" / "concat.txt"
    lst.parent.mkdir(exist_ok=True)
    lst.write_text("".join(f"file '{f}'\n" for f in files))
    mp4 = out / "explainer.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(mp4)], check=True)

    # captions
    cues, offset = [], 0.0
    for s, f in zip(scenes, files):
        log = json.loads((proj / "build" / f"beatlog_{s}.json").read_text())
        for b in log["beats"]:
            cues += cues_for_beat(timings[b["id"]]["words"], offset + b["start"])
        offset += float(probe(f)["format"]["duration"])
    srt = out / "captions.srt"
    srt.write_text("\n".join(f"{i}\n{fmt(a)} --> {fmt(max(b, a + 0.8))}\n{wrap(t)}\n" for i, (a, b, t) in enumerate(cues, 1)))

    # verify
    info = probe(mp4)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), {})
    has_audio = any(s["codec_type"] == "audio" for s in info["streams"])
    dur = float(info["format"]["duration"])
    covered = sum(b - a for a, b, _ in cues)
    narration = sum(t["duration"] for t in timings.values())
    checks = {
        "1920x1080": (v.get("width"), v.get("height")) == (1920, 1080),
        "audio track": has_audio,
        ("duration override (verify requested length)" if args.any_length else "duration 120-240s"): args.any_length or 120 <= dur <= 240,
        "captions cover narration": covered >= 0.8 * narration,
    }
    print(f"{mp4}  {dur:.1f}s  {v.get('width')}x{v.get('height')}  {len(cues)} caption cues")
    for name, ok in checks.items():
        print(f"  [{'ok' if ok else 'FAIL'}] {name}")
    if not all(checks.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
