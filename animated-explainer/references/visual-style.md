# Visual style: polished flat motion design

**Target:** a clean, confident explainer of the kind a good motion studio ships: calm navy canvas, consistent layout, content in well-proportioned panels, crisp type hierarchy, a small cast of crafted characters, and illustrations drawn for *this* concept. [`assets/reference.png`](../assets/reference.png) shows the system rendered; its source is `assets/reference_src.py`. Look at it before designing, and match that level of finish.

**The failure to avoid:** frames that look like a first attempt, with loose clip-art icons floating in empty space, a background that changes every act, every word the same bold size, and things placed by eye. Viewers read that as amateur, and it distracts from a good script.

## The system (consistency is what makes it look designed)
- **One canvas.** Every act uses the same `background()` (the default in `ExplainerScene`). Mood comes from accent colour and character expression, not from changing backgrounds.
- **Header + content.** Each idea gets a section header (`self.set_header("Two kinds of exam", accent)`) in the top-left with its accent underline. Content lives in the content area below it. Change the header when the idea changes, typically once or twice per act. The hook may skip the header for its opening character moment.
- **Grid, not eyeballing.** Position with `place(mob, "left_third")`, `zone(...)`, `arrange`, `next_to`, `align_to`. Use the zones: halves for comparisons, thirds for character + content or three-up cards, full for a pipeline. Align edges and centres; equal gaps between siblings.
- **Containers.** Group related things in `panel` / `card` / `titled_panel`. A loose element is either a character or a deliberate hero illustration. Use `tinted=True` for the panel that represents the "good"/chosen option.
- **Type scale.** `h1` for a rare big statement or term (e.g. the acronym reveal), `h2` for headers, `body` for key sentences on screen, `label` for names on things, `caption` (muted) for secondary notes under objects. At least two sizes in any text-bearing frame; muted captions carry detail without competing.
- **Palette with meaning.** Choose 2–3 accents for the video and keep each meaning fixed, e.g. teal = the solution / good, pink = the problem / wrong, orange = the user's own stuff, yellow = highlights. Surfaces stay navy. Text is `text` or `muted`. On a bright fill, text is `ink`.

## Fill the frame
The content area is the stage; use it. The main group of a frame should span most of the content area's width or height and sit balanced in it. A small character and one bubble in the top-left corner with the rest empty reads as unfinished. Practical defaults: characters 2.2–3 units tall when they're the subject; diagrams scaled with `place(group, zone, grow=0.85)` so they fill their zone (plain `place` only shrinks); when a frame has one element, make it big and centred, or pair it with a supporting panel in the opposite zone. The render's QA log flags frames whose content is small or lopsided.

## Characters
- The cast is `Person` (chest-up human: shirt colour, skin, hair style/colour) and `Bot` (an AI/system as a character). Give the protagonist a name label (caption under them) on first appearance and keep their look identical all video.
- Use an expression change as the emotional beat: worried in the hook, thinking in the concept, happy when the engine clicks. `look()` toward what matters; `blink()` during holds; `nod()`/`hop()` for agreement or delight.
- Speech bubbles sit above the speaker, aligned to their side, tail toward them. Stagger two bubbles vertically or show them one at a time; never side by side at the same height.
- Size: 2.2–3 units tall in the hook; smaller (1.4–2) when sharing a frame with a diagram.

## Illustrate the concept, don't decorate it
The engine section is where the design earns its keep: build a **bespoke diagram** of the mechanism from primitives and the containers, not a row of library icons. Examples of the right level:
- RAG: documents split into coloured chunks → dots clustering on a "meaning map" → a question dot lights up its nearest neighbours → those chunks slide into a "prompt" card → the Bot answers with a source pill.
- Signal vs noise: a feed of message cards, most greying out and shrinking as a filter question sweeps over them, the few that survive turning teal and enlarging.
- Agency: two characters on a split screen facing the same broken thing; one waits (clock ticking, greyed), the other's three moves appear as step chips.

Icons from `icon()` are for small supporting glyphs (a check in a card, a clock beside a stalled task). If an icon is the main subject of a frame, draw something better.

Helpers that make bespoke diagrams quick: `doc()` (paper document), `pill()`, `step_chip()`, `flow()`, `arrow()`, `connector()`, `highlight()`, `stamp()`, `callout()`, `Counter`, plus Manim primitives (`RoundedRectangle`, `Circle`, `Dot`, `Line`, `Polygon`, `Arc`) styled with palette colours: solid fills, no outlines except accent strokes on panels.

## Motion
- **Entrances:** `rise_in` for text and panels, `pop_in` for objects and characters, `Create`/`GrowArrow` for lines and arrows, `stagger([...])` for sets (cards, chips, chunks). One entrance style per element type across the video.
- **Transformations explain:** move things *between* containers (a chunk sliding into the prompt card), recolour to show status (grey → teal), `Transform` when one thing becomes another. Prefer these to fading old things out and new things in.
- **Holds stay alive:** a blink, a look, `float_idle`, or `Indicate` on the key element during long lines.
- **Scene changes:** `clear_stage()` (keeps the header) or swap the header; move the protagonist rather than re-creating them.

## Composition checklist (use during visual QA)
1. Header present (except the opening hook moment), and it matches what the frame shows.
2. Everything aligns to the grid: shared edges/centres, equal gaps, nothing hugging the frame edge, bottom ~0.75 units clear.
3. One focal point. The element the narration names is the largest, brightest, or highlighted.
4. Related items share a container; no orphan icons floating in space.
5. At least two type sizes; secondary info is muted caption, not bold.
6. Colours keep their assigned meanings; no more than 3 accents in the frame.
7. The frame fills the content area with intent: no half-empty frame unless the emptiness is the point.
8. Nothing overlaps unintentionally, including bubbles, labels, arrows and stamps.
