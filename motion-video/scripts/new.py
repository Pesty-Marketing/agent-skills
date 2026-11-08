#!/usr/bin/env python3
"""Start a motion-video project from a preset template, or refresh its copy of the scene library.

usage:
  new.py <preset> <dir> --title "Native Pest case study" [--theme pesty|neutral]
  new.py --refresh <dir>          re-copy motion/ (library + themes) into an existing project

preset: loop | walkthrough | story. The project is self-contained: video.html, storyboard.json,
motion/ (a copy of the library), and later shots/, audio/, stills/, out/.
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
LIB = SKILL / "assets" / "motion"
TPL = SKILL / "assets" / "templates"


def copy_lib(proj):
    shutil.rmtree(proj / "motion", ignore_errors=True)
    shutil.copytree(LIB, proj / "motion")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("preset", nargs="?", choices=["loop", "walkthrough", "story"])
    ap.add_argument("dir")
    ap.add_argument("--title")
    ap.add_argument("--theme", default="pesty")
    ap.add_argument("--refresh", action="store_true")
    a = ap.parse_args()
    proj = Path(a.dir).resolve()

    if a.refresh:
        copy_lib(proj)
        print("refreshed", proj / "motion")
        return
    if not a.preset or not a.title:
        sys.exit("need a preset and --title")
    if not (LIB / "themes" / f"{a.theme}.css").exists():
        sys.exit(f"no theme {a.theme!r}; have: {', '.join(p.stem for p in (LIB / 'themes').glob('*.css'))}")
    if (proj / "storyboard.json").exists():
        sys.exit(f"{proj} already has a storyboard.json; edit it, or pick a new folder")
    proj.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "-", a.title.lower()).strip("-")
    for f in ("storyboard.json", "video.html"):
        s = (TPL / a.preset / f).read_text()
        s = s.replace("{{TITLE}}", a.title.replace('"', "'")).replace("{{SLUG}}", slug).replace("{{THEME}}", a.theme)
        (proj / f).write_text(s)
    copy_lib(proj)
    (proj / "shots").mkdir(exist_ok=True)
    (proj / ".gitignore").write_text("out/\nstills/\nframes/\naudio/cache.json\n")
    print(f"created {proj}\n  next: write the storyboard (storyboard.json), get it approved, then build video.html")


if __name__ == "__main__":
    main()
