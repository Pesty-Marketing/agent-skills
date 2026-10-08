# Output contract — the CLEANED file

`scripts/check_cleaned.py` enforces the shape below. The reviewer enforces the meaning.

```markdown
# <Title> [? working title — actual title not captured]

**Speaker:** <Name>, <role>, <organization>
**Event:** <event> — <city>            (or **Meeting:** for meeting notes)
**Date:** <YYYY-MM-DD>
**Source:** <how captured>. Raw file: <raw filename>

> [Editor's note: recording begins mid-sentence.]     (only if true)

## <Specific, self-describing section title>

Cleaned prose. Every number, name and example kept. Filler gone.

> [Slide: …]  / > [Room: an attendee reports the QR code is not working.]

## Q&A

**Audience (Raphael):** <question>

**Ross:** <answer, with [? raw: "…"] and [garbled: "…"] where earned>

## Editor's note

**Speaker identification:** how the speaker was identified and verified.

**Corrections applied (from the glossary):**
- "curry bambond" → Kirshenbaum Bond
- …

**Every `[?]` / `[garbled]` left in the body, with the raw wording it replaces:**
1. "…raw…" — rendered "…".
2. …

**Reviewer corrections (after the draft):** the drafter's readings the full read overturned,
each as cleaned → raw → fix. This paragraph is the evidence the review happened.

## Open questions

1. <the flag a person in the room can resolve, most consequential first> — <locator: timestamp,
   or "word 1,880 of 6,700, ≈ 11:45 at 160 wpm — '…What's your capacity to onboard … LTD National…'">
2. <speaker / title if unconfirmed>
3. <destination, if not settled> — <source locator, or "locator unavailable" with a reason>
```

## Flag forms

| Situation | Write |
|---|---|
| A word substituted by inference the glossary did not cover | `growth [? raw: "is great"]` |
| A name or fact you could not verify | `Steve Fick [?]` |
| A phrase that does not parse | `[garbled: "we will loop from"]` |
| A phrase that does not parse but has a likely reading | `[garbled: "buyers" — likely "fires"]` |
| A speaker or attribution you are unsure of | `**Audience [?]:**` |

## What the contract forbids, and why

- **Invented sentences**, including bold "takeaway" lines in the editor's voice. A reader
  cannot tell them from the speaker's words. Bold only what was said.
- **Smoothing a garble into a confident sentence.** The one that reads well is the one nobody
  checks. Three drafts in a row did this; each was caught only by a full read against RAW.
- **Summary.** Cleaned body length stays within about 15% of the raw; a larger drop means
  substance was cut, not filler.
- **Backslash-escaped quotes** (`\"`). They break downstream parsers. Use plain or curly quotes.
