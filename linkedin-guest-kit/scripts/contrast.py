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


# Share of the frame (%) occupied by accent-coloured LETTERFORMS above which the card fails.
# Measured separation on real cards: correct cards (accent used only as blocks/rules) land at
# 0.00-0.34%, cards containing accent letters at 0.69-5.11%.
LETTERFORM_PCT = 0.5

# A region is treated as an emphasis BLOCK if this share of the non-accent pixels inside its
# bounding box are light — i.e. it has pale letters sitting on it. Accent letterforms instead
# enclose the dark page background.
BLOCK_INNER_BRIGHT = 0.25
MIN_REGION = 0.0004          # ignore specks below this share of the frame


def _accent_mask(a):
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    return (r > 70) & (r - g > 30) & (r - b > 25) & (r > g * 1.5)


def _letterform_share(im, _accent):
    """% of the frame taken by accent pixels that are LETTERS rather than blocks.

    Ratio alone cannot tell "white on a red block" from "red letters on navy" — the accent
    pixels are the same colour on the same background either way. What separates them is what
    the accent region *encloses*: a block has pale letters sitting inside its bounding box,
    while accent letterforms enclose the dark page background. Stroke width and pixel-density
    heuristics both fail here, because correct cards legitimately contain blocks and rules.
    """
    import numpy as np

    W0, H0 = im.size
    sc = max(1, W0 // 450)                      # downscale: this is a shape test, not a colour one
    small = im.resize((W0 // sc, H0 // sc))
    a = np.array(small).astype(int)
    m = _accent_mask(a)
    lum = 0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]

    H, W = m.shape
    seen = -np.ones((H, W), int)
    total = H * W
    letter_area = 0
    regions = letters = 0

    for sy in range(H):
        for sx in range(W):
            if not m[sy, sx] or seen[sy, sx] >= 0:
                continue
            stack = [(sy, sx)]
            seen[sy, sx] = 1
            pts = []
            while stack:                        # flood fill, 4-connected
                y, x = stack.pop()
                pts.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and seen[ny, nx] < 0:
                        seen[ny, nx] = 1
                        stack.append((ny, nx))
            if len(pts) < MIN_REGION * total:
                continue
            regions += 1
            ys = [p[0] for p in pts]
            xs = [p[1] for p in pts]
            box = lum[min(ys):max(ys) + 1, min(xs):max(xs) + 1]
            boxm = m[min(ys):max(ys) + 1, min(xs):max(xs) + 1]
            inner = box[~boxm]
            bright = float((inner > 140).mean()) if inner.size else 1.0
            if bright < BLOCK_INNER_BRIGHT:     # encloses dark background -> letterforms
                letter_area += len(pts)
                letters += 1

    return 100.0 * letter_area / total, letters, regions


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
    lf_pct, n_letters, n_regions = _letterform_share(im, accent)

    print(f"{path}")
    print(f"  dominant accent pixel : {hexof(a)}  ({share:.2f}% of frame)")
    print(f"  dominant dark ground  : {hexof(d)}")
    print(f"  accent-on-dark ratio  : {r:.2f}:1   (threshold {threshold})")
    print(f"  accent letterforms    : {lf_pct:.2f}% of frame ({n_letters} of {n_regions} regions)")

    if r >= threshold:
        print("  PASS — the accent itself clears the threshold against the dark ground")
        return True

    # Ratio alone cannot separate a red BLOCK (fine) from red LETTERS (the defect) — both are
    # accent pixels on a dark ground. What separates them is whether the region encloses pale
    # letters (a block) or the dark page background (letterforms).
    if lf_pct < LETTERFORM_PCT:
        print("  PASS — accent appears only as blocks/rules, not as letterforms.")
        print("         White-on-accent is the correct emphasis treatment.")
        return True

    print("  FAIL — accent is rendered as LETTERFORMS on the dark ground.")
    print(f"         {n_letters} region(s) enclose the dark background rather than pale text,")
    print(f"         and at {r:.2f}:1 those letters are unreadable in a phone feed.")
    print("         Fix: set the word in white on an accent block instead — see the")
    print("         colour contract in references/image-prompt-template.md.")
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
