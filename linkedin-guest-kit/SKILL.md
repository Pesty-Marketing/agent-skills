---
name: linkedin-guest-kit
description: "Build a share kit that a podcast guest can actually post — several LinkedIn post options written in the guest's own voice from the episode transcript, plus portrait graphics with their face on them, generated with Google's Nano Banana image models. Invoke on 'linkedin kit for <guest>', 'post options for our podcast guest', 'guest promo assets', 'help our guest share the episode', 'linkedin graphics for this episode'. Copy-only requests use Steps 1–3 and skip generation. Not for the host's own posting schedule, LinkedIn ads, or company-page content."
---

# linkedin-guest-kit

## Overview

A guest agrees to share the episode. Then nothing happens — because sharing means writing a post from scratch and finding an image, and that is real work you quietly handed to a busy person.

This skill removes the work. The deliverable is **one folder link** containing post options they can paste and graphics they can attach.

**Core principle: the guest is the author, not the subject.** Everything reads as though they wrote it — their claims, their numbers, their phrasing. The host earns one natural mention. A kit that sounds like the show's marketing team gets politely ignored, and the guest's own credibility is the entire reason their audience stops scrolling.

## Inputs to collect before starting

1. **The episode transcript.** Non-negotiable — it is the only legitimate source of the guest's voice and every number you will use. The `yt-structure` skill in this repo pulls captions from a URL.
2. **The live episode links** — every platform it's actually on. Verify each one resolves to this episode before it goes in a deliverable.
3. **A photo of the guest** — one clear front-facing shot. Their site's about page usually beats the headshot in your files; compare and take the sharper one.
4. **1–2 style references** — past thumbnails or graphics from the show, so the kit looks like the brand.
5. **The guest's exact name and title**, as *they* write it. Check their own site, not your CRM.
6. **Gemini API key** — in `GEMINI_API_KEY` or at `~/.gemini_api_key`, from a **billing-enabled** project (image models have no free tier). From zero: create a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), click **Set up billing**, then `echo '<key>' > ~/.gemini_api_key && chmod 600 ~/.gemini_api_key`.

## Step 1 — Mine the transcript

Read it and pull out, quoting the transcript line for each:

- **Numbers** — every figure the guest stated, with its exact wording and what it actually refers to.
- **Quotable lines** — sentences that survive on their own, stripped of speech filler but not reworded.
- **The named story** — a specific client, result, or moment. This is usually the strongest post.
- **The contrarian claim** — where they disagreed with how the industry does it.

Build a numbers ledger before writing anything. **Every figure in the finished kit must trace to a line in this ledger**, and each number must mean in the post exactly what it meant in the episode. Two figures that sound alike are the classic trap — "two to three weeks to get set up" is not the same claim as "schedule two to three weeks out," and swapping them puts a false statement under the guest's name.

## Step 2 — Draft the post options

Read `references/post-frameworks.md` first — hook types, structure, formatting, length, and the guest-specific rules live there.

Write **three options on three different hooks**, not one post in three outfits. This combination covers most episodes:

| Option | Hook type | What it is |
|---|---|---|
| A | Counter-narrative | Names something the audience can't answer about their own business |
| B | Value / teaching | The numbers or steps, listed — the most saveable and shareable |
| C | Story | A named result, ideally one that didn't require buying anything |

Label each with its angle and when to pick it, so the guest can choose without reading all three.

## Step 3 — Gate the copy

Check every option; fix or cut what fails:

- [ ] The hook works alone, in 1–2 lines, before "see more"
- [ ] The post opens with the guest's expertise — **never** "I was a guest on…"
- [ ] It sounds like the guest, using phrases they actually said
- [ ] Every number traces to the ledger and means the same thing it meant on the episode
- [ ] The host is credited once, naturally, and is not the hero
- [ ] One clear question at the end, answerable in a sentence
- [ ] Well under 250 words, long enough to trigger "see more"
- [ ] No claim about the guest's product the transcript doesn't support

## Step 4 — Generate the graphics

Three concepts, so the guest has a genuine choice rather than three near-identical files:

| Concept | Build |
|---|---|
| **Hook card** | Guest large, one big headline stack, one supporting graphic |
| **Quote card** | Their strongest line set large, small circular portrait + name/title |
| **Numbers card** | 3 benchmark rows, small circular portrait + name/title |

**Clean the reference photo first.** If it has sunglasses on the head, a hat, a busy background — fix that on the *source photo* in its own edit pass before any compositing. Attributes that survive into a composite are far harder to remove later, and editing a finished composite tends to wreck it.

**Read the colour contract at the top of `references/image-prompt-template.md` before writing
a prompt.** The short version: the accent colour is a background, never a foreground, and every
text element clears 4.5:1. If your brand has a design system, it almost certainly already says
this — Pesty's `pesty-design` skill mandates WCAG AA 4.5:1 on all text, and these graphics are
covered by it.

Write prompts from `references/image-prompt-template.md`, then:

```
scripts/generate.py --aspect 4:5 --model gemini-2.5-flash-image \
    --prompt concept.txt --refs guest_clean.png style_ref.jpg --out out/draft --n 2
```

**4:5 portrait is the format** — it takes the most vertical space in the mobile feed. Reference-image order matters; prompts refer to "attached photo 1", "attached photo 2" by position. Run with `--help` for all flags.

| Model | Use for | ~Cost |
|---|---|---|
| `gemini-2.5-flash-image` | drafts, reference-photo cleanup, edit passes | $0.04 |
| `gemini-3-pro-image-preview` | finals at 2K, best text rendering | $0.13–0.24 |

## Step 5 — Review, finish, size

**Look at every render yourself before showing anyone.** Check in order:

1. **Text** — exact spelling, no duplicated or dropped words (the #1 failure mode)
2. **Contrast** — every text element clears **4.5:1** against what sits directly behind it.
   No exemption for accent-coloured, "decorative," or emphasis text. Measure it, don't eyeball
   it — sample the glyph and background pixels and compute the WCAG ratio.
3. **Size** — the smallest text is at least **3% of frame height** (~45px at 1200×1500).
   Below that it renders under ~19px in the mobile feed and stops being readable.
4. **Likeness** — recognizably the guest, and still wearing what they wore in the source photo
5. **Collisions** — no head, hair, or graphic touching any letter
6. **Logo** — present and actually the brand's mark, not an invention

Checks 2 and 3 are pass/fail numbers on purpose. They replaced a "does this look legible?"
judgement that shipped a 2.31:1 element because it got logged as a cosmetic preference.

`scripts/contrast.py` does check 2 for you — it exits non-zero on a failure, so it can gate a
build rather than rely on someone remembering:

```
scripts/contrast.py out/final.png --accent "#D90429"   # scan a card for accent-on-dark text
scripts/contrast.py --pair "#FFFFFF" "#D90429"         # check any two colours
```

It distinguishes a red *block* (correct) from red *letters* (the defect) by stroke width, so
a passing card is genuinely clean rather than merely un-flagged. Verified 6/6 against the
known-good and known-bad cards from Ep 31. Still look at the render — it checks the accent
trap specifically, not spelling, likeness, or collisions.

Then: re-render the approved image on the Pro model at 2K, resize to **1200×1500**, and view it again at ~400px wide. If a headline doesn't survive that, it fails — the phone feed is the viewing environment.

Two failure modes worth pre-empting:

- **The Pro "reproduce exactly" pass can recompose**, sliding a face into text that was clear in the draft. Always re-review the final; never assume it matches the approved draft.
- **Never fix a botched render with another edit.** Go back to the newest image that predates the defect and redo that step with a tighter prompt. If a layout keeps colliding, don't ask for "less overlap" — divide the frame into explicit zones and forbid crossing them.

## Step 6 — Deliver as one folder

The guest gets **one link**, not an email of attachments and instructions.

- A doc holding all three options as clean copy-paste blocks, which image pairs with which, every episode link, and short posting notes.
- The graphics as image files in the same folder.
- Framing throughout: optional, editable, theirs. Offer to change anything.

**Confirm the guest can actually open the link before it is sent.** A folder on a company shared drive is invisible to outsiders by default — they land on "request access," which converts a favor into a chore. Check sharing and fix it, or the whole kit fails at the last step.

## Gotchas

| Symptom | Cause / fix |
|---|---|
| Image models 429 with "limit: 0" while text calls work | Image generation has **zero** free-tier quota — the key's project needs billing enabled. Text calls succeeding proves nothing. |
| 403 right after enabling billing | Propagation lag (~1–5 min). Poll with a cheap call until 200. |
| Guest's photo is small (400px) | Their site's about page usually has a better one. Generation tolerates ~600px; below that, likeness drifts once the face is rendered large. |
| Episode number differs between systems | Publishing platforms and internal folders drift apart. Verify against what's actually published — and keep episode numbers out of the post copy, where they buy nothing and can be wrong. |
| Logo comes out almost-right | Models approximate logos from style references. Regenerate, or patch the real logo in post. |
| Output is 1152×896 or similar | Expected — models render on their own grid. Resize after. |

## Common mistakes

| Mistake | Fix |
|---|---|
| "I had a great time on the [show] podcast!" as the opener | Lead with the guest's strongest claim; mention the show near the CTA |
| Three posts, one hook | One hook per option, from different material in the transcript |
| Sharpening a number for punch | Only what's in the ledger, meaning what it meant on the episode |
| Marketing-team voice | Rebuild from phrases the guest actually said |
| Shipping renders unviewed | Read every image — text corruption and likeness drift are common |
| Sending a link the guest can't open | Verify access from outside the org before sending |
| Logging a contrast failure as a "cosmetic nit" | Measure it. Under 4.5:1 is a defect, not a preference — and a reviewer who downgrades it is how the defect ships |
| Setting a word in the accent colour for emphasis | Accent is a background. Put a block behind the word and set the word in white — see the colour contract in `references/image-prompt-template.md` |

---

> Maintained by [Pesty Marketing](https://pestymarketing.com) · Browse the [full skill catalog](https://pestymarketing.com/agent-skills/).
