#!/usr/bin/env python3
"""Render a motion-video project (video.html + storyboard.json) to stills, checks, or MP4.

usage:
  render.py stills  <project> [--size 16x9] [--at 3.2 7.5]   per-scene stills + contact sheet (also runs checks)
  render.py check   <project> [--size 16x9]                  gates only; exit 1 on any failure
  render.py video   <project> [--size 16x9] [--deliver]      gates, then frames -> MP4 (+ narration, captions.srt)

--size repeats; the default is every size in storyboard.json "sizes". Sizes: 16x9, 9x16, 1x1.
Every animation is paused and seeked to each frame's time, so frames are exact and repeatable.
Writes timeline.js (read by video.html), captions.srt (narrated), stills/<size>/, out/<slug>-<size>.mp4.
--deliver also copies the MP4 (and .srt) to ~/Downloads.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import gates  # noqa: E402

SIZES = {"16x9": (1920, 1080), "9x16": (1080, 1920), "1x1": (1080, 1080)}
PRESET_MIN_PX = {"loop": 56, "walkthrough": 30, "story": 30}
LEAD, TAIL = 0.4, 0.7  # silence before / after each scene's narration


# ---------- timeline -------------------------------------------------------------------------
def load(proj: Path):
    sb = json.loads((proj / "storyboard.json").read_text())
    ids = [s["id"] for s in sb["scenes"]]
    if len(ids) != len(set(ids)):
        sys.exit("duplicate scene ids in storyboard.json")
    narrated = sb.get("narration", sb.get("preset") != "loop")
    tim = {}
    if narrated:
        tp = proj / "timings.json"
        if not tp.exists():
            sys.exit("storyboard is narrated but timings.json is missing: run scripts/tts.py first "
                     "(or set \"narration\": false)")
        tim = json.loads(tp.read_text())["scenes"]
    return sb, narrated, tim


def build_timeline(sb, narrated, tim):
    t, scenes, notes = 0.0, [], []
    for s in sb["scenes"]:
        text = (s.get("narration") or "").strip()
        dur = float(s.get("dur") or 0)
        words, audio = [], None
        if narrated and text:
            v = tim.get(s["id"])
            if not v:
                sys.exit(f"scene {s['id']} has narration but no audio in timings.json: re-run tts.py")
            need = LEAD + v["duration"] + TAIL
            if dur and need > dur + 0.01:
                notes.append(f"scene {s['id']}: narration needs {need:.1f}s, storyboard said {dur:.1f}s -> using {need:.1f}s")
            dur = max(dur, need)
            audio = {"file": v["audio"], "at": round(t + LEAD, 3)}
            words = [{"w": w["w"], "start": round(t + LEAD + w["start"], 3), "end": round(t + LEAD + w["end"], 3)} for w in v["words"]]
        if dur <= 0:
            sys.exit(f"scene {s['id']} has no narration and no \"dur\"")
        scenes.append({"id": s["id"], "start": round(t, 3), "dur": round(dur, 3), "words": words, "audio": audio,
                       "still": s.get("still")})
        t += dur
    cues = make_cues([w for s in scenes for w in s["words"]])
    tl = {"total": round(t, 3), "loop": bool(sb.get("loop", sb.get("preset") == "loop")),
          "captions": caption_sizes(sb, narrated), "cues": cues, "scenes": scenes}
    return tl, notes


def caption_sizes(sb, narrated):
    c = sb.get("captions", False)
    if not narrated or not c:
        return []
    return list(SIZES) if c is True else list(c)


UNITS = {"million", "billion", "thousand", "hundred", "percent", "k", "m", "x", "times", "months", "years", "days", "hours", "minutes", "seconds"}


def make_cues(words, max_words=7, max_chars=42):
    cues, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        nxt = words[i + 1] if i + 1 < len(words) else None
        full = nxt is not None and (len(cur) >= max_words or len(text) + len(nxt["w"]) + 1 > max_chars)
        # Don't strand a sentence's last word alone on its own caption.
        if full and nxt["w"][-1] in ".?!" and len(cur) < max_words + 2 and len(text) + len(nxt["w"]) < max_chars + 14:
            full = False
        # Keep a number with its unit ("$12.5 million", "48.9 percent"): break before the number instead.
        if full and any(c.isdigit() for c in w["w"]) and nxt["w"].strip(".,?!;:").lower() in UNITS and len(cur) > 1:
            cur.pop()
            prev = cur[-1]
            cues.append({"start": cur[0]["start"], "end": round(min(prev["end"] + 0.2, w["start"]), 3),
                         "text": " ".join(x["w"] for x in cur)})
            cur = [w]
            continue
        brk = nxt is None or full or w["w"][-1] in ".?!:;" or nxt["start"] - w["end"] > 0.45
        if brk:
            end = w["end"] + 0.2
            if nxt:
                end = min(end, nxt["start"])
            cues.append({"start": cur[0]["start"], "end": round(end, 3), "text": text})
            cur = []
    return cues


def srt_time(x):
    ms = int(round(x * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def write_side_files(proj, tl):
    (proj / "timeline.js").write_text("window.MOTION_TIMELINE = " + json.dumps(tl, indent=1) + ";\n")
    if tl["cues"]:
        (proj / "captions.srt").write_text("".join(
            f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n\n" for i, c in enumerate(tl["cues"], 1)))


# ---------- browser --------------------------------------------------------------------------
class Page:
    def __init__(self, pw, proj, size):
        w, h = SIZES[size]
        self.browser = pw.chromium.launch()
        self.page = self.browser.new_page(viewport={"width": w, "height": h})
        self.page.goto((proj / "video.html").as_uri() + "?render=1", wait_until="load")
        self.page.evaluate("window.motion ? motion.ready : Promise.reject(new Error('motion.js did not load'))")

    def seek(self, t):
        self.page.evaluate(f"motion.seek({t:.4f})")

    def close(self):
        self.browser.close()


def scene_still_times(tl):
    # A scene is "built" ~75% of the way in, but never inside the closing fade.
    # storyboard "still": seconds into the scene, for scenes whose built moment isn't at 75%.
    return [(s["id"], round(s["start"] + (s["still"] if s.get("still") is not None else min(s["dur"] * 0.75, s["dur"] - 0.6)), 2))
            for s in tl["scenes"]]


def contact_sheet(paths, out):
    import cv2
    import numpy as np
    thumbs = []
    for p in paths:
        im = cv2.imread(str(p))
        h, w = im.shape[:2]
        tw = 640 if w >= h else 360
        im = cv2.resize(im, (tw, int(h * tw / w)), interpolation=cv2.INTER_AREA)
        im = cv2.copyMakeBorder(im, 0, 34, 0, 0, cv2.BORDER_CONSTANT, value=(0, 0, 0))  # label strip below, not over, the frame
        cv2.putText(im, p.stem, (8, im.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        thumbs.append(im)
    cols = 3 if thumbs[0].shape[1] > thumbs[0].shape[0] else 5
    th, tw = max(t.shape[0] for t in thumbs), max(t.shape[1] for t in thumbs)
    rows = (len(thumbs) + cols - 1) // cols
    sheet = np.full((rows * (th + 8), cols * (tw + 8), 3), 40, np.uint8)
    for i, t in enumerate(thumbs):
        r, c = divmod(i, cols)
        sheet[r * (th + 8):r * (th + 8) + t.shape[0], c * (tw + 8):c * (tw + 8) + t.shape[1]] = t
    cv2.imwrite(str(out), sheet)


# ---------- audio + encode -------------------------------------------------------------------
def audio_track(proj, tl, out_wav):
    clips = [s["audio"] for s in tl["scenes"] if s["audio"]]
    if not clips:
        return False
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    for c in clips:
        cmd += ["-i", str(proj / c["file"])]
    parts = [f"[{i}:a]adelay={int(c['at'] * 1000)}:all=1[a{i}]" for i, c in enumerate(clips)]
    mix = "".join(f"[a{i}]" for i in range(len(clips)))
    fc = ";".join(parts) + f";{mix}amix=inputs={len(clips)}:normalize=0:dropout_transition=0,apad[out]"
    cmd += ["-filter_complex", fc, "-map", "[out]", "-t", f"{tl['total']:.3f}", "-ar", "48000", str(out_wav)]
    subprocess.run(cmd, check=True)
    return True


def encode(frames_dir, fps, wav, out):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps), "-i", str(frames_dir / "%05d.jpg")]
    if wav:
        cmd += ["-i", str(wav)]
    cmd += ["-vf", "scale=out_range=tv,format=yuv420p", "-c:v", "libx264", "-crf", "18", "-preset", "medium"]
    if wav:
        cmd += ["-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += ["-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)


# ---------- main -----------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["stills", "check", "video"])
    ap.add_argument("project")
    ap.add_argument("--size", action="append", choices=list(SIZES))
    ap.add_argument("--at", nargs="*", type=float, default=[], help="extra still times (seconds)")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--deliver", action="store_true", help="copy finished MP4 (+ .srt) to ~/Downloads")
    ap.add_argument("--force", action="store_true", help="render even if checks fail (never for delivery)")
    args = ap.parse_args()

    proj = Path(args.project).resolve()
    sb, narrated, tim = load(proj)
    tl, notes = build_timeline(sb, narrated, tim)
    write_side_files(proj, tl)
    for n in notes:
        print("note:", n)
    sizes = args.size or sb.get("sizes") or ["16x9"]
    min_px = float(sb.get("min_px") or PRESET_MIN_PX.get(sb.get("preset"), 30))
    slug = sb.get("slug") or proj.name
    print(f"{slug}: {len(tl['scenes'])} scenes, {tl['total']:.1f}s, sizes {', '.join(sizes)}, min text {min_px:g}px")

    from playwright.sync_api import sync_playwright
    failed = False
    with sync_playwright() as pw:
        for size in sizes:
            pg = Page(pw, proj, size)
            print(f"\n[{size}]")
            times = scene_still_times(tl)
            problems = gates.run_all(pg, tl, times, min_px, args.fps)
            for p in problems:
                print("  FAIL", p)
            if not problems:
                print("  checks: all passed")
            failed |= bool(problems)

            if args.mode == "stills":
                d = proj / "stills" / size
                shutil.rmtree(d, ignore_errors=True)
                d.mkdir(parents=True)
                shots = []
                for i, (sid, t) in enumerate(times + [(f"t{t:g}", t) for t in args.at]):
                    pg.seek(t)
                    p = d / f"{i:02d}-{sid}.png"
                    pg.page.screenshot(path=str(p))
                    shots.append(p)
                contact_sheet(shots, d / "contact-sheet.jpg")
                print(f"  stills: {d}/ (contact-sheet.jpg has them all)")

            if args.mode == "video":
                if problems and not args.force:
                    pg.close()
                    sys.exit("checks failed: fix them, or re-run with --force for a draft (never deliver a --force render)")
                with tempfile.TemporaryDirectory() as tmp:
                    tmp = Path(tmp)
                    n = int(round(tl["total"] * args.fps))
                    for i in range(n):
                        pg.seek(i / args.fps)
                        pg.page.screenshot(path=str(tmp / f"{i:05d}.jpg"), type="jpeg", quality=93)
                        if i and i % (args.fps * 10) == 0:
                            print(f"  frames {i}/{n}", flush=True)
                    wav = tmp / "narration.wav" if audio_track(proj, tl, tmp / "narration.wav") else None
                    (proj / "out").mkdir(exist_ok=True)
                    out = proj / "out" / f"{slug}-{size}.mp4"
                    encode(tmp, args.fps, wav, out)
                print(f"  wrote {out}")
                if args.deliver and not problems:
                    dl = Path.home() / "Downloads"
                    shutil.copy2(out, dl / out.name)
                    print(f"  delivered {dl / out.name}")
                    if (proj / "captions.srt").exists():
                        shutil.copy2(proj / "captions.srt", dl / f"{slug}.srt")
            pg.close()
    if failed and args.mode == "check":
        sys.exit(1)


if __name__ == "__main__":
    main()
