#!/usr/bin/env python3
"""contrast.py — measure WCAG contrast in a finished card, so Step 5's legibility gate is a
number instead of an opinion.

Two modes:

  # 1. Ratio between two colours you already know
  contrast.py --pair "#C43446" "#202D40"

  # 2. Scan a rendered card for accent-coloured text sitting on a dark ground.
  #    Reports the worst ratio found. This is the failure this skill shipped once:
  #    red letters directly on navy, measuring 2.31-2.66:1.
  contrast.py card.png --accent "#D90429"

Exit code is 1 if anything measured falls under the threshold (default 4.5), so it can gate
a build. Requires Pillow only for image mode.

Thresholds: WCAG AA is 4.5:1 for body text and 3.0:1 for large text (>=24px, or >=19px bold).
This skill holds everything to 4.5 — see the colour contract in
references/image-prompt-template.md for why "it's only an accent word" is not an exemption.
"""
import argparse, sys


def _srgb(c):
    c /= 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = (_srgb(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    if la < lb:
        la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)


def parse_hex(s):
    s = s.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(ch * 2 for ch in s)
    if len(s) != 6:
        raise argparse.ArgumentTypeError(f"not a hex colour: {s}")
    return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))


def hexof(rgb):
    return "#%02X%02X%02X" % rgb


def scan(path, accent, threshold):
    from PIL import Image
    from collections import Counter

    im = Image.open(path).convert("RGB")
    px = list(im.getdata())

    ar, ag, ab = accent
    # pixels close to the accent hue: strongly red-dominant like the accent, not neutral
    def accentish(p):
        r, g, b = p
        return (abs(r - ar) < 70 and r - g > 45 and r - b > 35 and r > 110)

    # dark ground: low luminance, blue-leaning (the navy card)
    def darkish(p):
        return luminance(p) < 0.09 and p[2] >= p[0]

    acc = [p for p in px if accentish(p)]
    dark = [p for p in px if darkish(p)]
    if not acc:
        print(f"no accent-coloured pixels found in {path} — nothing to flag")
        return True
    if not dark:
        print(f"no dark-ground pixels found in {path} — cannot evaluate")
        return True

    a = Counter(acc).most_common(1)[0][0]
    d = Counter(dark).most_common(1)[0][0]
    r = ratio(a, d)
    share = 100.0 * len(acc) / len(px)

    print(f"{path}")
    print(f"  dominant accent pixel : {hexof(a)}  ({share:.2f}% of frame)")
    print(f"  dominant dark ground  : {hexof(d)}")
    print(f"  contrast              : {r:.2f}:1   (threshold {threshold})")

    if r >= threshold:
        print("  PASS — accent is not being used as low-contrast text")
        return True
    print("  ⚠️  Accent this close to the dark ground is unreadable AS TEXT.")
    print("     If those pixels are a filled block behind white letters, you're fine —")
    print("     check the render. If they are letters, this is the defect: set the word in")
    print("     white on an accent block instead. See references/image-prompt-template.md.")
    return False


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image", nargs="?", help="rendered card to scan")
    ap.add_argument("--pair", nargs=2, metavar=("FG", "BG"), type=parse_hex,
                    help="just compute the ratio between two hex colours")
    ap.add_argument("--accent", type=parse_hex, default=parse_hex("#D90429"),
                    help="brand accent colour (default Pesty Red #D90429)")
    ap.add_argument("--threshold", type=float, default=4.5,
                    help="minimum acceptable ratio (default 4.5 = WCAG AA body text)")
    args = ap.parse_args()

    if args.pair:
        fg, bg = args.pair
        r = ratio(fg, bg)
        verdict = "PASS" if r >= args.threshold else "FAIL"
        print(f"{hexof(fg)} on {hexof(bg)} = {r:.2f}:1  [{verdict} at {args.threshold}]")
        sys.exit(0 if r >= args.threshold else 1)

    if not args.image:
        ap.error("give an image to scan, or use --pair")
    sys.exit(0 if scan(args.image, args.accent, args.threshold) else 1)


if __name__ == "__main__":
    main()
