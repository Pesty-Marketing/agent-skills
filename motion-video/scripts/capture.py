#!/usr/bin/env python3
"""Capture a real page for a walkthrough: a screenshot, or a short screen recording.

usage:
  capture.py <url> --out shots/home.png [--size 1440x900] [--full] [--wait 1500]
             [--actions steps.json] [--hide ".cookie-banner,#chat"] [--state FILE]
  capture.py <url> --out clips/search.webm --record [--actions steps.json] ...
  capture.py <url> --login [--state FILE]

Screenshots are taken at 2x pixel density so the video can zoom in and stay sharp.
--actions is a JSON list run in order before the screenshot (or during the recording):
  [{"click": "text=Run test"}, {"fill": ["#company", "Acme Pest"]}, {"type": ["#city", "Dallas"]},
   {"press": "Enter"}, {"wait": 1500}, {"waitfor": ".results"}, {"scroll": 600}]
"type" types visibly (good for recordings); "fill" is instant.

Pages behind a login: run once with --login. A browser window opens; the USER signs in, then closes
the window. The session is saved to --state (default ~/.config/motion-video/sessions/<host>.json,
outside any repo) and reused by later captures until it expires. Agents never type passwords.
"""
import argparse
import json
import shutil
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright


def state_path(url, given):
    if given:
        return Path(given).expanduser()
    return Path.home() / ".config" / "motion-video" / "sessions" / f"{urlparse(url).hostname}.json"


def run_actions(page, steps):
    for st in steps:
        (k, v), = st.items()
        if k == "click":
            page.click(v)
        elif k == "fill":
            page.fill(v[0], v[1])
        elif k == "type":
            page.click(v[0])
            page.keyboard.type(v[1], delay=70)
        elif k == "press":
            page.keyboard.press(v)
        elif k == "wait":
            page.wait_for_timeout(int(v))
        elif k == "waitfor":
            page.wait_for_selector(v, timeout=120000)
        elif k == "scroll":
            page.mouse.wheel(0, int(v))
            page.wait_for_timeout(500)
        else:
            sys.exit(f"unknown action {k!r}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("url")
    ap.add_argument("--out")
    ap.add_argument("--size", default="1440x900")
    ap.add_argument("--full", action="store_true", help="full-page screenshot")
    ap.add_argument("--wait", type=int, default=1500, help="ms to wait after load")
    ap.add_argument("--actions")
    ap.add_argument("--hide", help="comma-separated selectors to hide (cookie banners, chat widgets)")
    ap.add_argument("--record", action="store_true", help="record a .webm clip of the actions instead of a screenshot")
    ap.add_argument("--login", action="store_true")
    ap.add_argument("--state")
    args = ap.parse_args()

    w, h = map(int, args.size.split("x"))
    sp = state_path(args.url, args.state)
    steps = json.loads(Path(args.actions).read_text()) if args.actions else []

    with sync_playwright() as pw:
        if args.login:
            sp.parent.mkdir(parents=True, exist_ok=True)
            b = pw.chromium.launch(headless=False)
            ctx = b.new_context(viewport={"width": w, "height": h})
            page = ctx.new_page()
            page.goto(args.url)
            print(f"Sign in in the browser window, then close the window. Saving the session to {sp}", flush=True)
            deadline = time.time() + 900
            while not page.is_closed() and time.time() < deadline:
                ctx.storage_state(path=str(sp))
                time.sleep(2)
            try:
                ctx.storage_state(path=str(sp))
            except Exception:
                pass
            sp.chmod(0o600)
            b.close()
            print("saved", sp)
            return

        if not args.out:
            sys.exit("--out is required")
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        b = pw.chromium.launch()
        opts = {"viewport": {"width": w, "height": h}, "device_scale_factor": 1 if args.record else 2}
        if sp.exists():
            opts["storage_state"] = str(sp)
        tmpdir = None
        if args.record:
            tmpdir = out.parent / ".rec"
            opts["record_video_dir"] = str(tmpdir)
            opts["record_video_size"] = {"width": w, "height": h}
        ctx = b.new_context(**opts)
        page = ctx.new_page()
        page.goto(args.url, wait_until="load")
        try:  # many apps poll forever and never go idle; don't hang on them
            page.wait_for_load_state("networkidle", timeout=8000)
        except Exception:
            pass
        if args.hide:
            page.add_style_tag(content=",".join(args.hide.split(",")) + "{display:none!important}")
        page.wait_for_timeout(args.wait)
        if "login" in page.url.lower() or "signin" in page.url.lower():
            print(f"warning: landed on {page.url}; the page may need a login. Run with --login first.", file=sys.stderr)
        run_actions(page, steps)
        if args.record:
            page.wait_for_timeout(800)
            vid = page.video.path()
            ctx.close()
            shutil.move(vid, out)
            shutil.rmtree(tmpdir, ignore_errors=True)
        else:
            page.screenshot(path=str(out), full_page=args.full)
            ctx.close()
        b.close()
        print("wrote", out)


if __name__ == "__main__":
    main()
