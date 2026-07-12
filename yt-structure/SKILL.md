---
name: yt-structure
description: Use when turning a YouTube video, talk, podcast, or web article into a clean, citable Markdown document for an LLM knowledge library or RAG/OKF bundle — triggers like "transcribe and structure this video", "structure this transcript", "add this talk/article to the library". Covers pulling captions, faithful structuring, and editor's-note / [?] flagging.
---

# yt-structure

## Overview

Turn a spoken or web source into a faithful, scannable, citable Markdown file for LLM ingestion.

**Core principle: structure and clean phrasing only — never paraphrase substance, never invent content, and flag what you can't verify instead of guessing.**

## When to use

- A YouTube video, conference talk, podcast, or lecture → a cleaned `.md`.
- A blog post / web article you want as faithful text (not a summary).
- Adding a source to a knowledge library (the Agents library, an OKF/RAG bundle).

**When NOT to use:**
- A messy *meeting* transcript with crosstalk (Gemini/Fathom) → that's the sibling "transcript cleanup process" (de-fragment turns), not this.
- You just want a quick summary — this produces a faithful structured document, not a digest.

## Step 1 — Ingest the raw source

**Video / talk / podcast:**
```
yt-transcript <youtube-url> [output-dir]
```
Writes a clean `<slug>.txt` (strips YouTube's rolling-window caption duplication) and prints the path. Run `yt-transcript` with no args for usage. Do NOT use Tactiq, web tools, or `youtube-transcript-api` — they waste tokens and break sentences.

**Web article:**
```
curl -sL "<url>" | pandoc -f html -t markdown_strict
```
Use this for blog posts — `WebFetch` *summarizes* prose and loses faithful text. (Official docs pages come through `WebFetch` fine.)

## Step 2 — Structure into a sibling `.md`

Write `<slug>.md` next to the raw source, same slug. Follow these conventions exactly:

- **Header block:** `# Title`, then `**Speaker:**` / `**Author:**` line, then `**Source:**` <url>.
- **`##` headers** at topic transitions; `###` for sub-beats.
- **Strip filler** (um, uh, "kind of", "you know", redundant so/well/right, doubled phrases). Phrasing cleanup only.
- **`> [Visual: …]`** blockquotes for on-screen references (clips, slides, diffs, B-roll, demos).
- **Verbatim quotes / cited passages → blockquotes**; **bold** the takeaways.
- **End with `## Recap`.**
- **`### Editor's note`** at the end: list proper-noun corrections you made + any unresolved `[?]` flags.
- **Multi-speaker:** preserve who-said-what; never invert authorship (don't credit a listener/agreer with the speaker's point).
- **Flag, don't guess:** garbled names/tools/companies get a `[?]`. Verify the big factual flags (names, tools, claims) with `WebSearch` before de-flagging.

## Step 3 — Add to the library (if building one)

Append the new file to the library's `INDEX.md` / `index.md`. If the library is an **LLM-wiki / OKF bundle**, also update the concept pages the source touches (don't just add a file) — follow that library's `CLAUDE.md` maintenance loop.

## Common mistakes

| Mistake | Fix |
|---|---|
| Tactiq / `youtube-transcript-api` for captions | Use `yt-transcript` (dedups, LLM-ready) |
| `WebFetch` for a blog article | It summarizes — use `curl … \| pandoc` for faithful text |
| Paraphrasing or compressing substance | Clean phrasing only; keep the content |
| Guessing a garbled proper noun | `[?]` flag + `WebSearch` to confirm |
| Inverting authorship in multi-speaker talks | Preserve attribution; agreement ≠ authorship |
| Skipping the Recap / Editor's note | Both are required closers |
</content>
