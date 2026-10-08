#!/usr/bin/env python3
"""List glossary candidates from a raw transcript: capitalized tokens (not sentence-initial),
figures with units, and out-of-dictionary words. It surfaces; it does not resolve.

Usage: glossary_candidates.py <raw.md>
Prereq: python3. Uses /usr/share/dict/words if present for the dictionary pass.
"""
import re, sys, collections, os

def main():
    if len(sys.argv) != 2:
        print(__doc__); sys.exit(2)
    text = open(sys.argv[1], encoding="utf-8").read()
    text = "\n".join(l for l in text.splitlines() if not l.startswith("#"))
    sentences = re.split(r"(?<=[.!?])\s+", text)
    caps = collections.Counter()
    for s in sentences:
        toks = re.findall(r"[A-Za-z][A-Za-z'&\-]*", s)
        for i, t in enumerate(toks):
            if i and t[0].isupper() and t.lower() not in {"i", "i'm", "i've", "i'd", "i'll"}:
                caps[t] += 1
    bigrams = collections.Counter(re.findall(r"\b([A-Z][a-z]+ [A-Z][a-z]+)\b", text))
    figures = collections.Counter(re.findall(r"[$£€]?\d[\d,.]*\s?(?:%|K|M|B|k|million|billion|thousand|x|X|percent|figures?|people|years?|weeks?|months?|hours?)?", text))
    figures = collections.Counter({k: v for k, v in figures.items() if re.search(r"[$£€%KMBx]|million|billion|thousand|percent|figure|people|year|week|month|hour", k, re.I)})
    words = set()
    for path in ("/usr/share/dict/words", "/usr/dict/words"):
        if os.path.exists(path):
            words = {w.strip().lower() for w in open(path, encoding="utf-8", errors="ignore")}
            break
    odd = collections.Counter()
    if words:
        for t in re.findall(r"[a-z][a-z']+", text.lower()):
            base = t.rstrip("'s").rstrip("s") if t.endswith("s") else t
            if t not in words and base not in words and len(t) > 3:
                odd[t] += 1
    print("## Capitalized tokens (not sentence-initial)")
    for t, n in caps.most_common(): print(f"- {t} ×{n}")
    print("\n## Capitalized bigrams")
    for t, n in bigrams.most_common(): print(f"- {t} ×{n}")
    print("\n## Figures")
    for t, n in figures.most_common(): print(f"- {t.strip()} ×{n}")
    if words:
        print("\n## Out-of-dictionary words")
        for t, n in odd.most_common(): print(f"- {t} ×{n}")
    else:
        print("\n(no system dictionary found; skipped the out-of-dictionary pass)")

if __name__ == "__main__":
    main()
