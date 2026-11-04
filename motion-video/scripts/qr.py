#!/usr/bin/env python3
"""Make a QR code PNG for a video, and print the <img> tag to paste.

usage: qr.py <url> --out <project>/qr.png

Shorter URLs give fewer, bigger squares that scan from farther away: drop utm_content and
other parameters you don't need. render.py checks that the code decodes to exactly this URL.
"""
import argparse
from pathlib import Path

import qrcode


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=1, box_size=20)
    q.add_data(a.url)
    q.make(fit=True)
    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    q.make_image(fill_color="black", back_color="white").save(out)
    print(f"wrote {out} (version {q.version}, {q.modules_count}x{q.modules_count} modules)")
    print(f'<img class="qr" src="{out.name}" data-qr="{a.url}" alt="QR code">')


if __name__ == "__main__":
    main()
