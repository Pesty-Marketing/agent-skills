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
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import gates  # noqa: E402

SIZES = {"16x9": (1920, 1080), "9x16": (1080, 1920), "1x1": (1080, 1080)}
PRESET_MIN_PX = {"loop": 56, "walkthrough": 30, "story": 30}
PRESET_MAX_STILL = {"loop": 6.0, "walkthrough": 3.0, "story": 3.0}
JCUT = 0.12  # pace "punchy": audio leads picture by this much
LEAD, TAIL = 0.15, 0.35  # silence before / after each scene's narration (keep it tight: dead air drags)


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
    """Lay scenes end to end. Pace "punchy": J-cuts (each line's audio starts JCUT s before its
    picture), near-zero gaps, and every scene cut snapped to the music's eighth-note grid."""
    punchy = sb.get("pace") == "punchy"
    lead, tail = (-JCUT, 0.2) if punchy else (LEAD, TAIL)
    grid = 30.0 / float(sb["sound"].get("bpm", 120)) if punchy and (sb.get("sound") or {}).get("music") else 0
    t, scenes, notes = 0.0, [], []
    for n, s in enumerate(sb["scenes"]):
        text = (s.get("narration") or "").strip()
        dur = float(s.get("dur") or 0)
        words, audio = [], None
        ld = 0.1 if (punchy and n == 0) else lead
        if narrated and text:
            v = tim.get(s["id"])
            if not v:
                sys.exit(f"scene {s['id']} has narration but no audio in timings.json: re-run tts.py")
            need = ld + v["duration"] + tail
            if dur and need > dur + 0.01:
                notes.append(f"scene {s['id']}: narration needs {need:.1f}s, storyboard said {dur:.1f}s -> using {need:.1f}s")
            dur = max(dur, need)
            audio = {"file": v["audio"], "at": round(t + ld, 3)}
            words = [{"w": w["w"], "start": round(t + ld + w["start"], 3), "end": round(t + ld + w["end"], 3)} for w in v["words"]]
        if dur <= 0:
            sys.exit(f"scene {s['id']} has no narration and no \"dur\"")
        if grid:
            dur = math.ceil((t + dur) / grid - 1e-6) * grid - t
        scenes.append({"id": s["id"], "start": round(t, 3), "dur": round(dur, 3), "words": words, "audio": audio,
                       "still": s.get("still")})
        t += dur
    cues = make_cues([w for s in scenes for w in s["words"]])
    tl = {"total": round(t, 3), "loop": bool(sb.get("loop", sb.get("preset") == "loop")), "pace": sb.get("pace", "normal"),
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
LUFS = {"voice": -16, "music": -22, "hit": -20, "stamp": -19, "sting": -21, "riser": -24, "whoosh": -26,
        "count": -29, "marker": -28, "pop": -29, "tick": -30}  # mix targets: big moments loud, texture quiet
VARY = [(1.0, 0.0), (0.95, -1.5), (1.05, -0.5), (0.97, -2.0), (1.03, -1.0)]  # (pitch, dB) per play of a kind
_lufs_cache = {}


def lufs(path: Path) -> float:
    """Integrated loudness of a file, so every element can be set to a target level whatever its source level."""
    key = (str(path), path.stat().st_mtime)
    if key not in _lufs_cache:
        log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        vals = [float(l.split("I:")[1].split("LUFS")[0]) for l in log.splitlines() if l.strip().startswith("I:")]
        _lufs_cache[key] = vals[-1] if vals and vals[-1] > -70 else -23.0
    return _lufs_cache[key]


def gain(path: Path, target: float) -> str:
    return f"volume={target - lufs(path):.2f}dB"


def audio_track(proj, tl, out_wav, sound=None, sfx=(), until=None):
    """Mix narration, an optional music bed (ducked under the voice) and SFX cues into one WAV.
    sound = storyboard "sound" block; files come from audio/sound.json (scripts/sound.py)."""
    total = until or tl["total"]
    clips = [s["audio"] for s in tl["scenes"] if s["audio"] and s["audio"]["at"] < total]
    lib = {}
    if sound and (proj / "audio" / "sound.json").exists():
        lib = json.loads((proj / "audio" / "sound.json").read_text())
    music = lib.get("music") if sound and sound.get("music") else None
    takes = {k: (v if isinstance(v, list) else [v]) for k, v in lib.get("sfx", {}).items()}
    events = [q for q in sfx if takes.get(q["kind"]) and q["t"] < total] if sound and sound.get("sfx", True) else []
    if not clips and not music and not events:
        return False
    cmd, parts, n = ["ffmpeg", "-y", "-loglevel", "error"], [], 0

    def inp(path):
        nonlocal n
        cmd.extend(["-i", str(proj / path)])
        n += 1
        return n - 1

    vox = []
    for c in clips:
        i = inp(c["file"])
        parts.append(f"[{i}:a]{gain(proj / c['file'], LUFS['voice'])},adelay={max(0, int(c['at'] * 1000))}:all=1[v{i}]")
        vox.append(f"[v{i}]")
    bus = []
    if vox:
        parts.append(f"{''.join(vox)}amix=inputs={len(vox)}:normalize=0:dropout_transition=0,apad,atrim=0:{total:.3f}[vox]")
    if music:
        i = inp(music)
        fade = max(0.0, total - 1.5)
        parts.append(f"[{i}:a]atrim=0:{total:.3f},{gain(proj / music, LUFS['music'] + sound.get('music_db', 0))},afade=t=out:st={fade:.3f}:d=1.5[mus]")
        if vox:
            parts.append("[vox]asplit=2[voxa][key]")
            parts.append("[mus][key]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=400:makeup=1[duck]")
            bus += ["[voxa]", "[duck]"]
        else:
            bus.append("[mus]")
    elif vox:
        bus.append("[vox]")
    plays = {}
    for k, q in enumerate(events):  # rotate takes and nudge pitch/level so a repeated kind never sounds identical
        play = plays[q["kind"]] = plays.get(q["kind"], -1) + 1  # not "n": that is inp()'s input counter
        f = takes[q["kind"]][play % len(takes[q["kind"]])]
        pitch, db = VARY[play % len(VARY)]
        i = inp(f)
        chain = f"aresample=48000,asetrate={int(48000 * pitch)},aresample=48000,"
        if q.get("dur"):  # e.g. a counter's roll: as long as the count, faded out
            chain += f"atrim=0:{q['dur']:.3f},afade=t=out:st={max(0, q['dur'] - 0.15):.3f}:d=0.15,"
        vol = LUFS.get(q["kind"], -26) + sound.get("sfx_db", 0) + db
        parts.append(f"[{i}:a]{chain}{gain(proj / f, vol)},adelay={max(0, int(q['t'] * 1000))}:all=1[s{k}]")
        bus.append(f"[s{k}]")
    assert n == len(cmd[4:]) // 2, "audio_track: input count drifted; a filter would read the wrong file"
    parts.append(f"{''.join(bus)}amix=inputs={len(bus)}:normalize=0:dropout_transition=0,apad,atrim=0:{total:.3f},alimiter=limit=0.89[out]")
    cmd += ["-filter_complex", ";".join(parts), "-map", "[out]", "-ar", "48000", str(out_wav)]
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
    ap.add_argument("--until", type=float, help="video mode: render only the first N seconds (a test cut; never delivered)")
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
            max_still = float(sb.get("max_still") or PRESET_MAX_STILL.get(sb.get("preset"), 3.0))
            read_wps = float(sb.get("read_wps") or 3.0)
            problems = gates.run_all(pg, tl, times, min_px, args.fps, max_still, read_wps, root=proj)
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
                    span = min(args.until or tl["total"], tl["total"])
                    n = int(round(span * args.fps))
                    for i in range(n):
                        pg.seek(i / args.fps)
                        pg.page.screenshot(path=str(tmp / f"{i:05d}.jpg"), type="jpeg", quality=93)
                        if i and i % (args.fps * 10) == 0:
                            print(f"  frames {i}/{n}", flush=True)
                    sfx = pg.page.evaluate("motion.sfx ? motion.sfx() : []")
                    wav = tmp / "mix.wav" if audio_track(proj, tl, tmp / "mix.wav", sb.get("sound"), sfx, args.until) else None
                    (proj / "out").mkdir(exist_ok=True)
                    out = proj / "out" / (f"{slug}-{size}-test{args.until:g}s.mp4" if args.until else f"{slug}-{size}.mp4")
                    encode(tmp, args.fps, wav, out)
                print(f"  wrote {out}")
                if args.deliver and not problems and not args.until:
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
