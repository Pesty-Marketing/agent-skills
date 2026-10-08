#!/usr/bin/env python3
"""Grab the last frame of every beat and tile them into one contact sheet per scene, for visual QA.

usage: frames.py <project_dir> [--scene NAME]

Reads build/beatlog_<Scene>.json (written by kurz.ExplainerScene) and the rendered scene videos.
Writes build/frames/<Scene>/<beat>.png and build/frames/<Scene>_sheet.png, and prints any
layout warnings recorded in build/qa_<Scene>.json.
"""
import argparse
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def scene_video(proj: Path, scene: str) -> Path:
    hits = sorted(proj.glob(f"media/videos/**/{scene}.mp4"), key=lambda p: p.stat().st_mtime)
    if not hits:
        raise SystemExit(f"no rendered video for {scene}; render it first")
    return hits[-1]  # newest render, whatever quality (so -ql previews can be checked too)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--scene")
    args = ap.parse_args()
    proj = Path(args.project).resolve()
    logs = sorted((proj / "build").glob("beatlog_*.json"))
    if args.scene:
        logs = [p for p in logs if p.stem == f"beatlog_{args.scene}"]

    for log in logs:
        data = json.loads(log.read_text())
        scene = data["scene"]
        video = scene_video(proj, scene)
        outdir = proj / "build" / "frames" / scene
        outdir.mkdir(parents=True, exist_ok=True)
        shots = []
        for b in data["beats"]:
            t = max(b["end"] - 0.1, b["start"])
            png = outdir / f"{b['id']}.png"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1", str(png)], check=True)
            shots.append((b["id"], png))

        # contact sheet: 2 columns of 960x540 thumbnails (large enough to judge labels)
        cols, tw, th = 2, 960, 540
        rows = (len(shots) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * (th + 30)), "black")
        draw = ImageDraw.Draw(sheet)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
        except OSError:
            font = ImageFont.load_default()
        for i, (bid, png) in enumerate(shots):
            x, y = (i % cols) * tw, (i // cols) * (th + 30)
            sheet.paste(Image.open(png).resize((tw, th)), (x, y + 30))
            draw.text((x + 8, y + 4), bid, fill="white", font=font)
        sheet_path = proj / "build" / "frames" / f"{scene}_sheet.png"
        sheet.save(sheet_path)
        print(f"{scene}: {len(shots)} beats -> {sheet_path}")

        qa = proj / "build" / f"qa_{scene}.json"
        for issue in json.loads(qa.read_text()) if qa.exists() else []:
            print(f"  QA {issue['beat']}: {issue['issue']}")


if __name__ == "__main__":
    main()
