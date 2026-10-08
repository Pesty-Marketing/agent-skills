#!/usr/bin/env python3
"""Enforce the CLEANED file's output contract. Exit 1 on any FAIL.

Usage: check_cleaned.py <raw.md> <cleaned.md> [--min-ratio 0.85]
Checks: header block; at least one topic section; `## Editor's note` and `## Open questions`
present; a numbered flag list; a non-empty Reviewer corrections paragraph; every
uncertainty raw string accounted for in the Editor's note; every Q&A question followed
by a labeled answer; open-question locators; compression and expansion warnings;
no backslash-escaped quotes. These are structural checks, not semantic validation.
"""
import argparse, re, sys

def words(s): return len(re.findall(r"\S+", s))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("raw")
    parser.add_argument("cleaned")
    parser.add_argument("--min-ratio", type=float, default=0.85)
    args = parser.parse_args()
    if not 0 < args.min_ratio <= 1:
        parser.error("--min-ratio must be greater than 0 and at most 1")
    min_ratio = args.min_ratio
    raw = open(args.raw, encoding="utf-8").read()
    raw_body = "\n".join(l for l in raw.splitlines() if not l.startswith("#"))
    cleaned = open(args.cleaned, encoding="utf-8").read()
    fails, warns = [], []

    if not re.match(r"# \S", cleaned): fails.append("no H1 title on line 1")
    for field in ("Speaker", "Date", "Source"):
        if not re.search(rf"^\*\*{field}:\*\* ", cleaned, re.M): fails.append(f"header missing **{field}:**")
    if not re.search(r"^\*\*(Event|Meeting):\*\* ", cleaned, re.M): fails.append("header missing **Event:** or **Meeting:**")

    m_note = re.search(r"^## Editor's note\s*$", cleaned, re.M)
    m_open = re.search(r"^## Open questions\s*$", cleaned, re.M)
    if not m_note: fails.append("no `## Editor's note` section")
    if not m_open: fails.append("no `## Open questions` section")
    body = cleaned[:m_note.start()] if m_note else cleaned
    note = cleaned[m_note.start():m_open.start()] if (m_note and m_open and m_open.start() > m_note.start()) else (cleaned[m_note.start():] if m_note else "")
    if m_note and m_open and m_open.start() < m_note.start(): fails.append("`## Open questions` must come after `## Editor's note`")

    sections = re.findall(r"^## (?!Editor's note|Open questions)(.+)$", body, re.M)
    if not sections: fails.append("no `## ` topic sections in the body")

    if '\\"' in cleaned: fails.append("backslash-escaped quote present")

    markers = re.findall(r"\[(?:\?|garbled)[^\]]*\]", body)
    garbled_raws = re.findall(r'\[(?:garbled:|\?\s+raw:)\s*"([^"]+)"', body)
    accounting_items = re.findall(r"(?ms)^\d+\.\s+(.+?)(?=^\d+\.\s|^\*\*|^##|\Z)", note)
    accounting_text = "\n".join(accounting_items)
    missing = [g for g in garbled_raws if g not in accounting_text]
    if missing: fails.append(f"{len(missing)} uncertainty raw strings not echoed in the Editor's note, e.g. {missing[0][:60]!r}")
    numbered = re.findall(r"^\d+\.\s", note, re.M)
    if markers and not numbered: fails.append("body carries flags but the Editor's note has no numbered flag list")
    if markers and numbered and len(numbered) < 0.5 * len(markers):
        warns.append(f"{len(markers)} flags in the body but only {len(numbered)} numbered items in the Editor's note")
    if not re.search(r"\*\*Reviewer corrections[^*]*\*\*\s*\S", note):
        fails.append("Editor's note has no non-empty **Reviewer corrections** paragraph")

    if m_open:
        open_txt = cleaned[m_open.end():]
        questions = re.findall(r"^(?:\d+\.|-)\s+(.+)$", open_txt, re.M)
        for question in questions:
            if not re.search(r"\bword\s+[\d,]+|\b\d{1,2}:\d{2}(?::\d{2})?\b|locator unavailable", question, re.I):
                fails.append("open question has no timestamp or word-offset locator (or explained unavailable locator): " + question[:70])
        if not re.search(r"^(\d+\.|-)\s+\S|^None\b", open_txt, re.M): fails.append("`## Open questions` is empty (write `None` if there are none)")

    qa = re.search(r"^## Q&A\s*$(.*?)(?=^## |\Z)", body, re.M | re.S)
    if qa:
        # A question must be followed by a labeled answer; continuation paragraphs of an answer need no label.
        prev_was_question, first = False, True
        for para in re.split(r"\n\s*\n", qa.group(1)):
            p = para.strip()
            if not p: continue
            labeled = p.startswith("**") or p.startswith(">") or p.startswith("#")
            if not labeled and (first or prev_was_question):
                fails.append(f"unlabeled Q&A paragraph where a speaker label is required: {p[:60]!r}"); break
            first = False
            is_question = p.startswith("**Audience")
            if prev_was_question and is_question:
                fails.append("Q&A question followed by another question instead of an answer")
            if is_question:
                prev_was_question = True
            elif p.startswith("**"):
                prev_was_question = False
        if prev_was_question:
            fails.append("final Q&A question has no labeled answer")

    ratio = words(body) / max(1, words(raw_body))
    if ratio < 0.75: fails.append(f"cleaned body is {ratio:.0%} of raw — substance was cut, not filler")
    elif ratio < min_ratio: warns.append(f"cleaned body is {ratio:.0%} of raw (bound {min_ratio:.0%}) — check for dropped passages")

    if ratio > 1.15:
        warns.append(f"cleaned body is {ratio:.0%} of raw — review added wording, flags, and header overhead")

    for w in warns: print("WARN", w)
    for f in fails: print("FAIL", f)
    print(f"{'PASS' if not fails else 'FAIL'}: {len(sections)} sections, {len(markers)} flags, body {ratio:.0%} of raw, {len(numbered)} numbered note items")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
