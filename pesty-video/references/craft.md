# Craft: what makes these videos look premium

Ordinary screen recordings feel cheap because nothing tells the viewer where to look. These videos feel premium because every second has one focal point, and that point moves in step with the voice.

## The rules of attention

1. **One focal point at a time.** At any moment the viewer should know exactly where to look: the zoomed element, the spotlighted card, the new line in a list. If two things move at once, one of them is wrong.
2. **The voice leads, the picture confirms.** When the narration says "check the three numbers", the camera is already gliding to the numbers (start the move 0.2 s before the chunk), the spotlight lands as the words land (+0.1), and the callout adds the takeaway (+0.8).
3. **Callouts add, captions repeat.** The caption is the sentence. A callout is a 2 to 6 word fact the sentence implies ("Down 24%: flag it", "Read-only", "Sent from Adam's address"). Never paste the caption into a callout.
4. **Return to rest between ideas.** Zoom in for a detail, then come back to the full view (`p.cam(id, at, null, 1)`) before the next topic, so the viewer re-anchors. Don't chain zoom → zoom → zoom across five sentences.
5. **Clicks are honest.** The pointer goes to the real control and clicks it, the UI responds (page change, dialog, toggle, toast) 0.1 to 0.2 s later, and the lower third updates to the new location.

## Motion

- Use only the helpers: `M.enter` (0.45 s, 14 px rise), `M.pop` for small objects, `M.glide` (easeInOutCubic) for anything that travels, and `M.fade` for windows. Same curves everywhere = one video, not a collage.
- The camera glides for 0.9 to 1.2 s. Zoom 1.15 to 1.4 on an element, never above 1.6 (UI text gets soft and the context disappears). A cut (`dur: 0.01`) only happens on a page change.
- Stagger lists by 0.12 to 0.25 s, or better, key each item to the word that names it (`V.o2 + 1.0`).
- Nothing moves just to move. The backdrop drifts slowly (that is the only idle motion), and everything else moves because the story moved.
- Hold the final state of each beat for at least 1 s before the next change.

## Layout and type

- Stage 1920×1080. Keep the top band (0–76) for the chapter label and step tracker, and the bottom band (960–1080) for captions. App frames go in between.
- Motion-graphic scenes use a left margin of 140, with titles at the upper third. The left-aligned title + right-side visual composition (see the template's Intro) reads as "designed" rather than "slide".
- Type sizes: title 64–96 Epilogue 700; section headline 56–68; body in motion scenes 22–32 Montserrat 500; callouts 22 Epilogue 600; captions 32 Montserrat 500.
- App UI is authored at real size (14 px) at a real width (1280–1440) and scaled by the layer. Don't enlarge UI text by hand; zoom the camera.
- Colour: neutral grey stage (`#EDF0F2`), white cards, ink text. Pesty red only marks focus (the spotlight ring, the callout dot and line, the key metric, the primary button, the active step). The closing scene sits on dark ink.
- Cards: 14–24 px radius, a soft shadow (`0 14px 40px rgba(0,35,48,.10)`) plus a 1 px hairline. Never use heavy borders.

## Recreating screens

- **Best: rebuild the UI as HTML** from screenshots or repo source, using the kit primitives. It stays crisp at any zoom, every element can be targeted, and data can be animated (typing, counters, toggles). Keep only what the narration needs plus enough context to recognise the tool. Use the tool's exact labels.
- **Fast: a retina screenshot in a camera layer** (`<img style={{width: 1440}}>` from a 2880-px capture) with `<Hotspot>` targets on top. It stays sharp up to about 1.6× zoom. Use it for third-party tools you can't rebuild faithfully, and for static views. It can't type or change state, so cut to a second screenshot for "after" states.
- **Devices:** `frame: 'browser'` for web apps, `'ipad'` with `mode: 'whole'` for booth and tablet flows, `'phone'` for mobile.
- **Multi-page apps:** keep every page mounted in one grid cell and show the current one with `visibility` (see `AdminApp` in the template). Switch pages with `p.set('page', …)` right after the click.
- **Sample data:** consistent across the video (same client, city, numbers everywhere), realistic, fictional. Put it in one constant at the top of the composition.

## Pacing

- About 2.6 words per second of narration. A chunk is one sentence or clause (6 to 16 words, at most 2 caption lines).
- The intro hooks within 15 s: the problem or the payoff, not "In this video we will…".
- SOP length: 1.5 to 4 min. Every 20 to 40 s something structural changes (a new scene, chapter or screen).
- Pauses are content. Give a beat (a `[pause]` in v3, or a new paragraph) before each chapter.

## Scene recipes

| Purpose | Build |
|---|---|
| Hook / title | `Backdrop` + `Title` (kicker, title with `Hl`, sub) left, a floating product card or metric right |
| Overview of the steps | `Title` + `Flow` (nodes keyed to the words) or `StepList` |
| Walkthrough | browser `Layer` + `AppShell`/screens + `p.cam`/`p.spot`/`p.callout`/`p.click` + `StepTracker` + `LowerThird` |
| A number that matters | camera zoom to the tile + `Metric` counting up, or a spotlight + callout |
| Rules and guardrails | `Title` + `RuleCards` (do / don't / warn), each keyed to its sentence |
| Process logic | `Flow` with labelled edges, `hot` on the critical path |
| Recap | `Checklist` ticking in time with the recap sentence |
| Close | dark `Scene` + `EndCard` (owner, where to ask, a version line) |

## Review checklist (run on every contact sheet)

- [ ] Nothing is cut off at the frame edges. Titles, cards and callouts sit inside the safe area.
- [ ] The camera never shows grey stage inside a browser frame, and zoomed text is still crisp.
- [ ] Each spotlight surrounds exactly the thing the caption names, and its callout points at it, doesn't cover what the sentence is about, and doesn't overlap another callout.
- [ ] The pointer is on the control at click time, and the UI reacts afterwards, not before (state appears only after its `p.set`).
- [ ] The caption under each frame matches what is on screen.
- [ ] No empty frames, half-faded leftovers, or two scenes visible at once (except mid-crossfade).
- [ ] Text never wraps awkwardly (single orphan words, a title breaking after one word).
- [ ] Sample data is consistent (same numbers in the intro card and the app).
- [ ] The terminal reported no page errors and no "missing element".
- [ ] Brand: red only marks focus, and fonts loaded (Epilogue headings look geometric, not system sans; export.mjs refuses to render if the fonts did not load).
