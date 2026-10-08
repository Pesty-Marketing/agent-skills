# Pesty visual style for explainer videos

Pesty's web design system (`pesty-design` skill) translated to motion. [`assets/reference.png`](../assets/reference.png) shows it rendered (source `assets/reference_src.py`): match that level of finish. The general craft rules from `animated-explainer/references/visual-style.md` still apply (grid, containers, type hierarchy, fill the frame, illustrate the concept, transformations that explain); this file covers what is Pesty-specific.

**Target:** a viewer who knows pestymarketing.com should recognise the video as Pesty within a second: bright, high-contrast, confident, with decisive shots of red and big real numbers. Premium and data-driven, grounded, never corporate-bland and never cartoon-chaotic.

## Helpers at a glance
Everything from kurz (zones, `place`, `card`, `titled_panel`, `flow`, `arrow`, `doc`, `Person`, `Bot`, motion, `clear_stage`), restyled, plus:
`PestyScene` (set `EYEBROW`; `self.end_card(promise, cta, url)`), `display(text, size, color)` (Epilogue), `kinetic(text, size, red=)` + `words_in(k)` (kinetic type), `third(col, row)` (rule-of-thirds points), motion tokens `EASE` / `SPRING` / `STAGGER_GAP`, `self.wait_until(b, "word")` (land a visual on a spoken word), `eyebrow(text)`, `stat(value, label, accent, sub)`, `StatCounter(0, fmt, final=v)` + `.count_to(v)`, `StepTracker(labels)` + `.activate(i)`, `self.clear_stage(keep=[...])`, `shadow(card)`, `on(accent)` (readable text colour for a fill), `logo()`, `mark()`.
Icon names: search bulb gear chat check cross clock target person star warning lock chart signal noise funnel book database folder mail calendar.

## Canvas and frame
- **Near-white canvas, never flat** for the whole video. `PestyScene` handles it: white with a soft deep-teal radial wash upper-left and a faint red one lower-right (the web hero's tint), finely dithered and drifting very slowly so the frame never sits dead still. Don't add other backgrounds or switch to a dark or coloured one mid-video. Red text on deep teal fails contrast, which is why the canvas stays light.
- **Safe zone:** nothing within 0.75 units (~100 px at 1080p) of any edge; the content zones already respect it.
- **Rule of thirds:** put the frame's focal element (the stat, the hero card, the character's face, a kinetic statement) on a thirds intersection with `third(col, row)` rather than dead centre, unless the frame is a single centred statement or the end card.
- **Header** top-left on every idea: red uppercase eyebrow (the video's `EYEBROW` topic label), Epilogue title in deep-teal ink, short red underline. The hook may open on the character before the first header.
- **The mark** sits top-right on every frame (part of the background). Don't add other logos mid-video; the full lockup appears only on the end card.

## Colour: red is a spotlight, not a wall
Each colour keeps one meaning for the whole video:
| Role | Token | Use |
|---|---|---|
| Spotlight | `red` (#D90429) | The one thing the narration is about: the key number, the active step, the answer, the CTA. Usually one red element per frame, never a red-filled panel. |
| Structure | `teal` (deep teal #1E5160), text ink #002330 | Default containers, characters' clothes, neutral things. Most of the frame. |
| Secondary | `blue` / `slate` (#4F8494) | Supporting things, the "other" option, speech bubbles. |
| Win | `green` (#1F8A5B) | Positive metrics, the good outcome, cost going down. |
| Attention | `amber` (#E8A317) | The problem or the costly option. Fills and outlines only; text on amber is ink. Never amber text. |
| Detail | `muted` grey | Captions and secondary notes. |
No purple, no blue gradients, no neon. Tints (`tinted=True`, `tint(accent, 0.1)`) are the light wash for a chosen or active option.

## Type
- **Epilogue Bold** (`display`, `h1`, `h2`, `stat`): headers, big statements, numbers. Tight and confident.
- **Montserrat** (`label`, `body`, `caption`): everything else. Labels bold, captions muted.
- **Three or four words per line, at most**, for anything meant to be read as a headline: headers, kinetic statements, hero text, pills. Headers should fit in four words ("Rent or own leads", not "Two ways to buy leads"). Card labels may run longer; captions and source notes are exempt.
- **Kinetic type** for big statements: `kinetic("Pay for customers, not clicks.", red="customers,")` breaks into balanced lines of four words or fewer and shrinks the block to fit the content width (pick a smaller `size` if it shrinks a lot); `words_in(k)` reveals it word by word, each word sliding up into place. Use it for the core concept's rule and the takeaway line, not every frame.
- `display(..., max_width=)` shrinks the text to fit; for a long line, break it instead with `display(wrap(text, size, max_width), size)` or `label(wrap(...))`.
- At least two sizes in every text frame. Headlines can colour one key phrase red with `rich()`, at most once per frame.

## Containers
White cards with a hairline border (`card`, `panel`, `titled_panel`); an accent outline (`accent=`) marks the important one. Pills are full-round (`pill`, `callout`, CTA). `shadow(card)` adds the soft ink-tinted lift: use it on the one hero card in a frame (usually the stat), not on everything.

## Numbers are the hero
Pesty leads with real results, so a proof frame is a designed moment: `stat("329", "new recurring customers", sub="source note")` large and centred (or the hero card with two supporting stats beside it), or `StatCounter` counting up while the narrator says it. The number is the largest element in its frame. With `StatCounter`, always pass `final=` (the value it will reach): the counter is then sized for its final width from the start, so `card(VGroup(counter, label(...)))`, `place()` and scaling all work and nothing gets overrun as the digits grow. Give it `set_z_index(5)` if a card is added after it, and `clear_updaters()` once it has landed. Green for good-direction metrics (a falling CAC is good, so green), red when it's the headline figure.

## Layouts that build across an act
The engine act is one diagram that builds beat by beat, so most of it should persist rather than be cleared each beat. Two patterns that work:
- **Step tracker:** `tracker = StepTracker(["Budget", "History", "Bidding"])` sits just under the header; `self.play(tracker.activate(i))` lights the current step. Each beat's detail goes below `tracker.get_bottom()`, and `self.clear_stage(keep=[tracker])` swaps the detail while the tracker and header stay.
- **Building card + swap zone:** a card on the left accumulates (a page's modules, a checklist) while the right zone swaps the proof for each item: `self.clear_stage(keep=[page_card])`.
The header stays on screen for every frame of the act (change it with `set_header` or `clear_stage(header=(...))`, never by clearing it away). For a full-frame statement such as the takeaway line, swap the header to one that names the statement, or clear it with `keep_header=False`; don't leave a stale header above it.
Rows of cards or pills: build them with `arrange(RIGHT)`, then `place(row, "full")` so they fit the content width. Long text inside a card: `label(wrap(text, size, max_width))`, since `max_width=` alone shrinks the text instead of wrapping it.

## Characters
Same cast as animated-explainer (`Person`, `Bot`), restyled for the white canvas. The PCO owner protagonist wears `teal` (deep teal) by default; give him a name caption on first appearance. Supporting characters in `blue`, `green`, `purple`; save a red shirt for someone the story spotlights. `Bot` (deep-teal screen, white face) is for Google, an AI or the CRM. Expressions carry the emotional beat as usual.

## Pest-control visual vocabulary
Draw the owner's world from primitives and the containers: Google result cards and the map pack (ranked rows, stars, review counts); a phone with missed-call badges; trucks as simple rounded shapes in brand colours; a city map as a grid of soft blocks with pins; service-area pages as `doc()`s; a calendar of booked jobs filling up; an ad bill as a receipt card. Keep competitor names generic and clearly fictional ("Apex Pest Co.").

## Motion
Quick and confident, **no bounce**. Every moving thing uses an easing token, never linear (linear is only for fades and colour changes):
| Token | Curve | Use |
|---|---|---|
| `EASE["enter"]` | cubic-bezier(0.16, 1, 0.3, 1) | Anything arriving: fast in, long soft settle. The default for `pop_in`, `rise_in`, `words_in`. |
| `EASE["move"]` | cubic-bezier(0.83, 0, 0.17, 1) | Repositioning something already on screen: a ranking row sliding #3→#1, a card making room. `mob.animate(rate_func=EASE["move"])`, ~0.5 s. |
| `EASE["exit"]` | cubic-bezier(0.64, 0, 0.78, 0) | Leaving: `pop_out`, things clearing away. Exits are shorter than entrances (~0.3 s). |
| `SPRING["smooth"]` / `["snappy"]` | mass/tension/friction 1/140/26, 0.5/210/20 | Physical moves that should feel weighty (smooth) or crisp (snappy). Neither overshoots. `SPRING["bouncy"]` exists but is off-brand. |

- **Stagger, don't pop all at once:** groups enter 0.1 s apart (about 3 frames). `stagger([...])` does this by default; pass `run_time=` to `stagger` itself (not to `self.play`) to keep the gap fixed.
- **Land on the word:** `self.wait_until(b, "329")` waits until just before the narrator says that word, so the stat, the red highlight or the arrow lands exactly on it. Use it for the beat's key moment; `b.at(word)` gives the time if you need it. Words are matched as the TTS spelled them: numbers usually come back as words ("three hundred twenty-nine"), and part of a hyphenated word matches ("twenty"). Check a beat's words with `$PY -c "import json;print([w['w'] for w in json.load(open('timings.json'))['beats']['engine-2']['words']])"`. A word that isn't found doesn't stop the render; it shows up as `wait_until skipped` in the QA output, so fix those.
- Transformations explain: a missed-call badge turning into a booked job, grey becoming red when it becomes the focus. `hop()` sparingly for a character's moment of delight.

## End card
The final beat calls `self.end_card(promise, cta, url)`: it clears the stage and brings in the full logo, a short Epilogue promise, the red CTA pill and the URL. Hold it at least 3 seconds (the narration's last line covers it).

## Brand checklist (use during visual QA)
1. White canvas; eyebrow + header present and naming what's on screen; mark top-right.
2. Red appears only on the frame's focal point (plus the eyebrow and header underline). Nothing washed in red.
3. Colours keep their roles; no amber text; no off-palette colours.
4. Epilogue for headers and numbers, Montserrat for the rest; two or more sizes; captions muted.
5. Every number on screen is in `sources.md`, and the narration matches it exactly.
6. Grid-aligned, balanced, focal element on a thirds point (or deliberately centred), filling the content area; nothing inside the 0.75-unit safe zone.
7. Headlines, headers and pills at most four words per line.
8. Cards and pills, no loose floating icons; at most one shadowed hero card per frame.
9. No unintended overlaps: bubbles, labels, arrows, stamps.
10. Motion: groups staggered, nothing linear except fades, no bounce, key visuals land on their word.
11. End card present, holding, with the right CTA for the video's purpose.
