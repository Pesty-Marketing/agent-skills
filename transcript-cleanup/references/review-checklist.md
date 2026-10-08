# Review checklist — reading CLEANED against RAW

Read the whole file. The drafter's list of uncertain passages is where it *knew* it was
unsure; the errors that matter are where it was confident. Record each finding as
*cleaned → raw → fix* and carry the list into the Editor's note's **Reviewer corrections**.

## Where drafts have actually gone wrong (three runs, same patterns)

1. **A lead-in word misread, inverting the point.** "The number one suggestion … is great"
   became "control costs" when the talk meant *growth*. Check every sentence that names what
   comes next ("the first thing is…", "number one is…") against the passage that follows.
2. **A garbled sentence rendered as if it parsed.** Raw: "he's looking out, apparently, for the
   client's best interest, of not really. You didn't examine it." Draft: a smooth sentence.
   Wherever the cleaned text is fluent and the raw is word salad, the draft guessed.
3. **A turn given to the wrong speaker.** "I have a lot of gas in the tank" belonged to the
   30-year-old questioner, not the speaker. In Q&A, check each turn's content against who would
   say it; agreement is not authorship.
4. **An unflagged smooth reading of a raw the glossary did not cover.** "Fortune 500" for raw
   "fortune in 2000"; "everything falls into place" for "everything is down"; "before Prime
   Week" for "every end of year in prime, prime week"; "it's cost-effective" for a garbled
   list of countries. Each needed `[? raw: "…"]` or `[garbled: "…"]`.
5. **A glossary entry not applied.** "recording" left where the glossary said "reporting".
   Grep the cleaned file for each glossary garble.
6. **An inserted bracket that adds meaning.** "Different people [at different levels] imagine
   different things" — the bracket is the editor's theory. Brackets carry raw text or a flag,
   never an interpretation.
7. **Editorial sentences in the speaker's voice.** Bold third-person takeaways, a bridging
   sentence ("The presentation he built follows the same shape…"), meta-commentary about the
   brief ("per the assignment's instruction"). Remove; the Editor's note is the only place the
   editor speaks.

## Mechanical pass (the script does these; confirm it ran)

- Header block complete; `## Editor's note` and `## Open questions` present.
- Every `[garbled: "…"]` and `[? raw: "…"]` raw string appears in the Editor's note.
- Every Q&A question is followed by a labeled answer; the first Q&A paragraph is labeled, and the final question has an answer.
- Review compression and expansion warnings. The checker counts header text and flags, so
  inspect the actual spoken body before interpreting the ratio.
- No `\"`.

## Before you finish

- The Reviewer corrections paragraph names each fix. If you found nothing, say what you
  checked; a review that found nothing on a 7,000-word live transcription is the exception.
- The Open questions list holds what the person in the room can resolve, most consequential
  first, each with a source locator (or an explained unavailable locator).
