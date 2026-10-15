---
name: ai-writing-tells
description: "Anti-AI-slop audit for prose. Use before shipping any copy that goes out under the Pesty name or a client's: blog posts, emails, LinkedIn posts, reports, landing pages, case studies. Also use when asked to de-AI, humanize, check a draft for AI tells or AI slop, or make writing sound less like ChatGPT. Not for structure or narrative frameworks."
---

# AI writing tells

Pesty's blog reader is an owner who has been pitched by four agencies and is scanning for anything that smells automated. These patterns are how they clock it. They also signal weak thinking: B and D *claim* significance instead of earning it (Zinsser, *On Writing Well* ch. 3: "If it should be pointed out, point it out.").

A real example, from a draft article on Yelp and ChatGPT leads that read as "littered with the AI style":

> "And the honest counterweight, from the same data: weekend leads converted slightly better than weekday leads — 33.0% versus 30.2% — despite average replies that were markedly slower. Speed matters. Speed is not the only thing that matters, and anyone selling you speed as the whole answer is overselling it."

Four tells in three sentences: pre-announced honesty, an em-dash appositive, the X-matters/X-is-not-the-only-thing reversal, and a rule-of-three closer that escalates to a moral.

## Done when

the bundled checker (`bash scripts/check.sh <file>`, run from this skill's folder; needs only bash and grep) returns no hits you haven't consciously kept, em-dash count is at or under target, and you've read the draft once for categories C and D, which regex only partly catches (two-beat reversals, rule-of-three moral closers, one-word dramatic paragraphs).

Run the script on the **built HTML** too, not just the markdown, so component copy is covered.

## The checklist

**A. Announcing significance instead of showing it.** "the distinction matters" · "that matters more than it sounds" · "X matters. X is not the only thing that matters." · "worth reading twice" · "worth being blunt" · "worth knowing about" · "it is worth noting" · "the part that matters is" · "and that is the point" · "this is the finding that changes the decision" · "here's the thing"

**B. Pre-announcing your own honesty.** "To be precise, because…" · "To be clear" · "the honest version is this" · "the honest counterweight" · "Honestly, it depends" · "we want to be careful here" · "we will not claim either way" · "let me be direct" · "full disclosure" · "read it that way round"

**C. The antithesis tic.** "It is not X. It is Y." · "not just X, but Y" · "X — and that is exactly the problem" · two-beat reversals · rule-of-three closers that build to a moral

**D. False-profundity fragments.** One-word dramatic paragraphs ("No." "Yes." "It is real.") · "Now put X next to it." · "Read that again." · "Hold onto that distinction." · "That is the whole story."

**E. Filler intensifiers and hedge-stacking.** genuinely · truly · meaningful/meaningfully · "some meaningful share of" · "it is entirely possible that" · arguably · "at the end of the day" · "make no mistake" · ("actually" is fine when it contrasts with something stated, not as an intensifier)

**F. Vocabulary tells.** delve · leverage (verb) · landscape · navigate · robust · underscore · crucial · pivotal · testament · seamless · game-changer · double-edged · nuanced · "in today's…" · "the reality is"

**G. Punctuation habit.** Em-dash appositives in consecutive sentences; the trailing "— and that is…" clause. Roughly one em-dash per 250 words reads human; five in a row does not.

## Fixing a hit

- **Delete rather than reword.** Zinsser's bracket test: if the sentence survives without the phrase, cut it. Swapping one tell for another is the common failure.
- Commit to the claim or drop it. "The honest counterweight is X" becomes "X." If X isn't worth stating plainly, it wasn't worth a preamble.
- Supporting reading: Zinsser, *On Writing Well*, ch. 2 "Simplicity", ch. 3 "Clutter" (bracket test), ch. 4 "Style" (don't hedge), ch. 9 "The Lead and the Ending" (stop when ready; no summary conclusions).
- Blog/SEO copy also targets Flesch-Kincaid grade 11.
