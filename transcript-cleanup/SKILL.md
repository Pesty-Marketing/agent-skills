---
name: transcript-cleanup
description: "Use when a pasted or exported speech transcript is garbled — a live auto-transcription of a talk, a Gemini/Fathom meeting note with crosstalk, a recording that starts mid-sentence, names mangled by the recognizer — and the user wants a faithful cleaned version (\"run the usual transcript cleanup\", \"clean this up\", \"next transcript\"). Not for clean YouTube captions or articles (use yt-structure) and not for summaries."
---

# Transcript cleanup

Turn a garbled transcript into two files: the **RAW** exactly as received and a **CLEANED**
sibling a reader can trust. The work is *recovery*, not writing: every sentence in CLEANED is
one the speaker said, every uncertain word is **flagged with its raw wording**, and the file
ends with the **questions only the human can answer** — the person who was in the room resolves
more garbles in a minute than any search.

The stakes on each side: an unflagged guess reads as fact and poisons everything built on the
file (a knowledge library, a quote, a decision), while a file that flags every second word is
unreadable and hides the flags that matter. Flag what changes the meaning; smooth what does not.

## Run in four phases

The phases are a generate–evaluate–repair loop with a research step in front. Keep them
separate: the model that drafts is not the model that checks it.

### 1. Ground it (reviewer model)

1. **Save RAW first**, verbatim, with a three-line `#` provenance header (event or meeting,
   speaker as far as known, who captured it and when). Nothing is cleaned until RAW exists.
2. **Identify the event and speaker from evidence**, in this order: the user's note; the
   user's calendar or the meeting's attendee list; a client or team roster; how the audience
   addresses the speaker ("Mr. Bond"); a web search on the biographical facts stated on stage.
   No evidence → the speaker stays `[?]` and becomes an open question. Never infer a name from a
   sound-alike.
3. **Build the glossary** — the judgment step, and the one that decides the quality of
   everything after it. Run `scripts/glossary_candidates.py <raw>` to surface candidate capitalized
   tokens, figures, and out-of-dictionary words, inspect RAW for candidates the script missed, then resolve each one to *intended wording*,
   *flag*, or *leave*. Write it to a file. Format and sources of truth:
   [`references/glossary.md`](references/glossary.md).

### 2. Draft (a cheaper drafting model, dispatched with the glossary)

Hand the drafter RAW, the glossary, and the output contract
([`references/output-contract.md`](references/output-contract.md)). Its brief, in full:

- Strip filler and false starts; fix garbles the glossary resolves; break into `##` sections
  at topic transitions and label every Q&A turn.
- Keep every number, name, example, joke and profanity. Verbatim recovery, not summary.
- Any word substituted by inference the glossary does not cover carries `[? raw: "…"]`. Any
  phrase that does not parse becomes `[garbled: "…"]`, optionally with a likely reading.
- Bold only words the speaker said. Insert no summary or takeaway sentences.
- End with the Editor's note listing every correction and every flag with its raw wording, and
  report back the passages it was least sure of.

### 3. Evaluate and repair (reviewer model — the step that has caught every real error so far)

**Read the whole CLEANED file against RAW**, start to finish, not the drafter's flag list.
Three drafts in a row each shipped several confident sentences the raw did not support; every
one was found by a full read and none by the flag list. Work from
[`references/review-checklist.md`](references/review-checklist.md) and write each finding as
*cleaned text → raw text → fix*. Apply the fixes, then add a **Reviewer corrections** paragraph
to the Editor's note naming them. An empty paragraph means the review did not happen.

Then run `scripts/check_cleaned.py <raw> <cleaned>` and fix anything it reports. It enforces the
output contract mechanically (header, sections, labeled Q&A turns, Editor's note, flag
accounting, compression ratio, open questions) so the review can spend itself on meaning.

### 4. Hand back with questions

The last section of the CLEANED file, and the last thing in your reply, is **Open questions**:
the flags a person who was present can resolve (a lost acronym, a surname, a figure), the
speaker or title if unconfirmed, and where the file should go next if that is not already
settled. One line each, most consequential first, **each with a locator** so the person can go
to the recording: the source timestamp when the transcript has them, otherwise the word offset
and an estimated minute (word count ÷ 160 wpm, stated as an estimate) plus the surrounding
words to scrub for. "None" is a valid list; a missing list is not. Resolved answers go back
into the file with who confirmed them and when — a recovered fact is worth more than a flag.

The skill ends here. Structuring the CLEANED file into a knowledge library or a wiki is a
separate job with its own conventions per destination.

## Two input shapes

- **Live talk** (one speaker, room noise, a Q&A): sections by topic, then `## Q&A` with
  `**Audience:**` / `**Speaker-surname:**` turns, room noise reduced to a labeled `> [Room: …]`
  aside.
- **Meeting notes** (Gemini/Fathom, several speakers, timestamps): merge each speaker's
  fragments into coherent turns, drop backchannel ("Yeah", "Mhm"), keep timestamps as section
  anchors, keep who-said-what — agreement is not authorship.

## Cost model and runtimes

Grounding and review need the strongest model available; the draft is mechanical once the
glossary exists and runs well on a cheaper one. Where the runtime can hand a task to a second
model (a subagent with a named model), do that and name the model. Where it runs one model
(Codex CLI, Gemini CLI, most single-agent setups), keep the phases as separate passes in one
session: finish the draft, then re-open RAW and CLEANED and read them side by side as the
reviewer, then run the checker. The separation is what catches the errors, not the model swap.

The scripts need only `python3`. Web search is optional: without it, whatever the room and the
user's note do not settle stays flagged and goes into Open questions.
