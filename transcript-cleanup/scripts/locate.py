#!/usr/bin/env python3
"""Locate raw phrases in a transcript for the Open questions list: word offset, estimated
minute, and surrounding words. Estimates assume speech at --wpm (default 160) from the
transcript's first word; state them as estimates.

Usage: locate.py <raw.md> "<phrase>" ["<phrase>" ...] [--wpm 160]
"""
import argparse, sys

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("raw")
    parser.add_argument("phrases", nargs="+")
    parser.add_argument("--wpm", type=float, default=160.0)
    args = parser.parse_args()
    if args.wpm <= 0:
        parser.error("--wpm must be greater than 0")
    wpm = args.wpm
    raw = open(args.raw, encoding="utf-8").read()
    body = "\n".join(l for l in raw.splitlines() if not l.startswith("#"))
    words = body.split(); total = len(words)
    for ph in args.phrases:
        i = body.find(ph)
        if i < 0: print(f"NOT FOUND: {ph!r}"); continue
        n = len(body[:i].split()); mins = n / wpm
        ctx = " ".join(words[max(0, n - 12): n + 14])
        print(f"word {n:,} of {total:,} · ≈ {int(mins)}:{int((mins % 1) * 60):02d} at {int(wpm)} wpm · …{ctx}…")

if __name__ == "__main__":
    main()
