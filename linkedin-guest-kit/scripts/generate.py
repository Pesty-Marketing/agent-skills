#!/usr/bin/env python3
"""Generate or edit images via the Gemini image API (Nano Banana models).

Usage:
  generate.py --model gemini-2.5-flash-image --prompt concept.txt \
      --refs headshot.jpg style_ref.jpg --out out/draft --n 2

  # Edit pass: the image being edited goes FIRST in --refs
  generate.py --model gemini-2.5-flash-image --prompt edit.txt \
      --refs out/draft_1.png new_person.jpg --out out/draft_edited

  # Final at 2K on the Pro model
  generate.py --model gemini-3-pro-image-preview --size 2K \
      --prompt final.txt --refs out/approved.png --out out/final

API key: GEMINI_API_KEY env var, or ~/.gemini_api_key. The key's Google Cloud
project must have billing enabled — image models have zero free-tier quota.

Stdlib only; Python 3.9+. Reference-image order matters: prompts should refer to
"attached photo 1", "attached photo 2" in the order passed to --refs.
"""
import argparse, base64, json, mimetypes, os, pathlib, sys, urllib.request


def api_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    f = pathlib.Path.home() / ".gemini_api_key"
    if f.exists():
        return f.read_text().strip()
    sys.exit("No API key: set GEMINI_API_KEY or create ~/.gemini_api_key")


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default="gemini-2.5-flash-image",
                    help="image model id (default: %(default)s)")
    ap.add_argument("--prompt", required=True, help="path to prompt text file")
    ap.add_argument("--refs", nargs="*", default=[],
                    help="reference images, in prompt order (edit target first)")
    ap.add_argument("--out", required=True, help="output path prefix (no extension)")
    ap.add_argument("--n", type=int, default=1, help="number of generations")
    ap.add_argument("--size", default=None, choices=["1K", "2K", "4K"],
                    help="output resolution (Pro models only)")
    ap.add_argument("--aspect", default="16:9", help="aspect ratio (default: %(default)s)")
    args = ap.parse_args()

    prompt = pathlib.Path(args.prompt).read_text()
    parts = []
    for ref in args.refs:
        p = pathlib.Path(ref)
        mime = mimetypes.guess_type(p.name)[0] or "image/jpeg"
        parts.append({"inline_data": {"mime_type": mime,
                      "data": base64.b64encode(p.read_bytes()).decode()}})
    parts.append({"text": prompt})

    image_config = {"aspectRatio": args.aspect}
    if args.size:
        image_config["imageSize"] = args.size
    body = json.dumps({
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE"],
                             "imageConfig": image_config},
    }).encode()

    url = ("https://generativelanguage.googleapis.com/v1beta/models/"
           f"{args.model}:generateContent")
    saved = []
    for n in range(args.n):
        req = urllib.request.Request(url, data=body, headers={
            "Content-Type": "application/json", "x-goog-api-key": api_key()})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                resp = json.load(r)
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code}: {e.read().decode()[:500]}", file=sys.stderr)
            sys.exit(1)
        got = False
        for part in resp.get("candidates", [{}])[0].get("content", {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob:
                mt = blob.get("mimeType", blob.get("mime_type", "image/png"))
                ext = ".png" if "png" in mt else ".jpg"
                out = pathlib.Path(f"{args.out}_{n + 1}{ext}")
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(base64.b64decode(blob["data"]))
                saved.append(str(out))
                got = True
        if not got:
            reason = resp.get("candidates", [{}])[0].get("finishReason", "?")
            print(f"gen {n + 1}: no image returned (finishReason={reason})",
                  file=sys.stderr)
            print(json.dumps(resp)[:800], file=sys.stderr)
    print("\n".join(saved))


if __name__ == "__main__":
    main()
