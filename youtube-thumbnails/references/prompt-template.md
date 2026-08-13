# Nano Banana prompt template for thumbnails

Every generation prompt uses five blocks in this order. Refer to reference images by
position ("attached photo 1") — the order you pass `--refs` is the order the model sees.

```
Create a photorealistic YouTube thumbnail, 16:9 aspect ratio, 1280x720.

PERSON: Use the [person] from attached photo 1 EXACTLY — identical face, identical
[clothing/accessories], identical [expression] expression. Preserve their identity and
likeness perfectly; do not change their features. Place them [position], chest-up,
cleanly cut out and composited onto the background with a subtle rim light around
their silhouette and a soft drop shadow.

STYLE: Match the graphic design language of attached photo 2, which is a previous
thumbnail from this same channel: [background color/texture], [text-block style],
[rotation/shadow treatment].

TEXT — render these exact strings, spelled character-for-character, stacked top to
bottom on the [side]:
1. "[LINE ONE]" — [size], [color] on a [color] block
2. "[LINE TWO]" — ...
The text must be crisp, perfectly spelled, and readable at small sizes.

GRAPHIC: [One supporting graphic and where it sits.]

LOGO: [Corner], the "[brand]" wordmark exactly as it appears in attached photo 2.

Overall: high-contrast, punchy, professional business thumbnail. Exactly three
visual elements: the person, the text stack, the graphic. No other people, no
clutter, no watermark.
```

## Why each block earns its place

- **PERSON** — "EXACTLY / identical / preserve identity" repeated is what holds likeness;
  a single mention drifts. Name the expression so the model doesn't substitute a generic smile.
- **TEXT** — quoting each string on its own numbered line with explicit colors is what gets
  correct spelling. Loose text descriptions produce mangled glyphs.
- **Overall** — restating the 3-element cap prevents the model from decorating empty space.

## Worked example (real, shipped)

Podcast episode about routing efficiency; contrarian hook from the guest ("you probably
don't need to hire"). Concept: title "Stop Hiring Techs. Do This Instead." + thumbnail
text that reinforces rather than restates:

```
Create a photorealistic YouTube thumbnail, 16:9 aspect ratio, 1280x720.

PERSON: Use the man from attached photo 1 EXACTLY — identical face, identical worn red
baseball cap with the small white bird logo, identical light-gray crewneck sweatshirt,
identical skeptical raised-eyebrow expression with his fist on his chin. Preserve his
identity and likeness perfectly; do not change his features. Place him on the right half
of the frame, chest-up, cleanly cut out and composited onto the background with a subtle
cool white rim light around his silhouette and a soft drop shadow.

STYLE: Match the graphic design language of attached photo 2, which is a previous
thumbnail from this same channel: a dark navy-blue background (#0d2c47) with subtle
diagonal light streaks and a faint tech-grid glow, bold stacked italic sans-serif text
blocks with hard offset drop shadows, each block rotated about -2 degrees.

TEXT — render these exact strings, spelled character-for-character, stacked top to
bottom on the left half:
1. "STOP HIRING" — very large white extra-bold italic caps on a red (#e8253c) block
2. "TECHS" — very large navy (#12365a) extra-bold italic caps on an off-white block
3. "YOUR NEXT TECH" — small white italic bold caps, no background block
4. "IS FREE" — large white extra-bold italic caps on a red (#e8253c) block
The text must be crisp, perfectly spelled, and readable at small sizes.

GRAPHIC: In the lower-left area below the text, a small tilted white rectangular sign
reading "NOW HIRING" in navy block letters, with a single thick red diagonal line
crossing it out.

LOGO: Top-left corner, the "pesty" wordmark — lowercase bold white letters with a small
angular red bird icon to its left, exactly as it appears in attached photo 2.

Overall: high-contrast, punchy, professional MrBeast-style business thumbnail. Exactly
three visual elements: the man, the text stack, the crossed-out sign. No other people,
no clutter, no watermark.
```

First draft from this prompt shipped with only one edit pass (guest composited in).

## Edit-pass prompts

Same discipline, smaller scope. Lead with the one change, then lock everything else:

```
Edit the first attached image (a finished YouTube thumbnail). Add ONE new person: the
man from the second attached photo ([description] — preserve his exact face, hair and
likeness; discard his original background entirely).

Place him as a SMALLER secondary figure at the far right edge, chest-up, slightly
behind the existing man, at about 60% of his size, [expression]. Cut him out with the
same white outline treatment and match the scene's lighting and color grade.

CRITICAL: change NOTHING else. The text blocks ("[EXACT TEXT]"), the [graphic], the
logo, the background, and the existing man must remain exactly as they are,
pixel-identical. Do not add any new text, borders, or graphics.
```

Quoting the existing text inside the "change nothing" clause protects it — unquoted text
is the first thing edit passes corrupt.
