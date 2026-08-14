# Nano Banana prompt templates for guest LinkedIn graphics

All three concepts render at **4:5 portrait**. Refer to reference images by position
("attached photo 1") — the order you pass `--refs` is the order the model sees.

## The colour contract — read before writing any prompt

**The accent colour is a background. It is never a foreground.** Every text element must
clear **4.5:1** against whatever sits behind it, with no exemption for a word that is
"just an accent" or "decorative."

Measured on the brand's own dark-navy card, which is where this went wrong:

| Treatment | Ratio | Verdict |
|---|---|---|
| Off-white text on navy | 11.72:1 | use freely |
| Dark navy text on an off-white block | 11.72:1 | use freely |
| White text on an accent block | 5.35:1 | **this is how you emphasise** |
| **Accent text on navy** | **2.60:1** | **never — fails AA outright** |

A lighter accent is not the fix: Pesty Red measures 4.43:1 even on cream, so it is under AA
as body text on *any* ground in this system. To emphasise a word, put a block behind it and
set the word in white. Never recolour the letters themselves.

Earlier versions of this file instructed accent-coloured text directly on the dark ground in
Concepts 2 and 3. Every kit built from them shipped a 2.3–2.7:1 element. Don't reintroduce it.

## Step 0 — Clean the reference photo first

Do this before any concept, in its own pass, on the *source photo*. One change only.

```
Edit the attached photo. Make exactly ONE change: [remove the sunglasses pushed up on
the man's head / remove the hat / …]. Fill in that area with [his own natural dark brown
hair], matching his existing hairline, texture, direction and lighting so it looks like
it was never there.

CRITICAL: change NOTHING else. His face, eyes, eyebrows, nose, mouth, smile, stubble,
skin tone, ears, neck, shoulders, his [exact garment], his exact head position and angle,
the background, the lighting and the color grade must all remain exactly as they are,
pixel-identical. Preserve his identity and likeness perfectly — this is a specific real
person and he must remain instantly recognizable as himself. Do not stylize, retouch,
smooth, or beautify his face. Do not crop or re-frame. Do not add text or graphics.

Output a photorealistic photograph, same framing as the input.
```

Generate two, pick the cleaner one, and use it as photo 1 for everything downstream.

## Concept 1 — Hook card

The zoning block is the important part. Without it the guest's head drifts into the
headline; asking for "no overlap" in prose does not hold.

```
Create a photorealistic vertical social-media graphic for LinkedIn, 4:5 portrait aspect
ratio, designed to be read on a phone.

LAYOUT — the frame is divided into two strict horizontal zones with a clear gap between
them. Nothing may cross from one zone into the other:
- TOP ZONE (the upper 50% of the frame): the logo and the text stack ONLY. No part of any
  person appears here.
- BOTTOM ZONE (the lower 50% of the frame): the person and the supporting graphic ONLY.
  No text here.

PERSON: Use the [man/woman] from attached photo 1 EXACTLY — identical face, identical
[hair], identical [garment], identical [expression] expression. Preserve their identity
and likeness perfectly; do not change their features, do not add glasses or a hat.
Discard the original background entirely. Place them in the BOTTOM ZONE on the right,
chest-up, cleanly cut out and composited with a subtle cool white rim light around the
silhouette and a soft drop shadow. The very top of their hair must sit well below the
bottom edge of the lowest text block, with clear empty background between them — their
head must never touch, overlap, or cover any letter.

STYLE: Match the graphic design language of attached photo 2, a previous graphic from this
same brand: [background color/texture], [text-block style], [rotation/shadow treatment].

TEXT — render these exact strings, spelled character-for-character, stacked top to bottom,
left-aligned, entirely inside the TOP ZONE:
1. "[LEAD-IN]" — small white extra-bold italic caps, no background block
2. "[THE NUMBER]" — very large white extra-bold italic caps on a [accent] block
3. "[LINE THREE]" — large [dark] extra-bold italic caps on an off-white block
4. "[LINE FOUR]" — large white extra-bold italic caps on a [accent] block
Every letter of every line must be fully visible and unobstructed. The text must be crisp,
perfectly spelled, and readable at small sizes. Do not render any other words anywhere.

GRAPHIC: In the BOTTOM ZONE on the left, well clear of the person, [one small supporting
object].

LOGO: Top-left corner, the "[brand]" wordmark exactly as it appears in attached photo 2.

Overall: high-contrast, punchy, professional business graphic. Exactly three visual
elements: the text stack, the person, the graphic. No other people, no clutter, no
watermark, no borders.
```

## Concept 2 — Quote card

Break the quote into explicit lines. Left to itself the model re-wraps and drops words.

```
Create a photorealistic vertical social-media quote graphic for LinkedIn, 4:5 portrait
aspect ratio, designed to be read on a phone.

STYLE: Match the graphic design language of attached photo 2 … Clean, premium,
high-contrast editorial layout with generous margins.

TEXT — render these exact strings, spelled character-for-character. Do not render any
other words anywhere in the image:
1. A large off-white opening double quotation mark, upper left, partially transparent.
2. The quote, centered in the upper two-thirds, large off-white bold italic sans-serif,
   broken across [N] lines exactly as written here:
   "[line 1]"
   "[line 2]"
   "[line 3]"
   For emphasis, set "[the punch line]" in white on a solid [accent] block that sits behind
   just those words — the letters themselves stay white, never [accent]. If the emphasised
   phrase wraps onto a second line, the [accent] block must continue behind the wrapped
   words too: EVERY word of that phrase sits on the block. No word of it may end up as
   [accent] letters on the background. Do not add quotation marks around these lines.
3. A short thick [accent] horizontal rule below the quote.
4. "[GUEST NAME]" — small white extra-bold sans-serif caps, lower left beside the photo.
5. "[TITLE, COMPANY]" — smaller light-gray sans-serif caps directly beneath the name.

PERSON: Use the [man/woman] from attached photo 1 EXACTLY … Render them small, as a
head-and-shoulders portrait cropped inside a neat circular frame with a thin off-white
ring, in the LOWER LEFT corner immediately left of the name.

LOGO: Lower-right corner, the "[brand]" wordmark exactly as it appears in attached photo 2.

Overall: calm, premium, highly legible editorial quote card. Exactly three visual elements:
the quote, the portrait with its name block, the logo. No clutter, no watermark, no borders.
```

## Concept 3 — Numbers card

Three rows. Four starts to crowd at feed size.

```
Create a photorealistic vertical social-media data-card graphic for LinkedIn, 4:5 portrait
aspect ratio, designed to be read on a phone.

STYLE: … Clean, premium dashboard-style layout with generous margins and clear vertical
rhythm.

TEXT — render these exact strings, spelled character-for-character, top to bottom. Do not
render any other words or numbers anywhere in the image:
1. "[CARD TITLE]" — large white extra-bold italic caps on a [accent] block near the top,
   rotated about -2 degrees.
2. Three statistic rows, evenly spaced down the middle, each a very large off-white
   extra-bold number on the left with a smaller light-gray sans-serif caps label to its
   right, separated by thin faint horizontal dividers:
   Row 1 number "[13-18]", label "[STOPS PER DAY]"
   Row 2 number "[UNDER 20%]", label "[DRIVE TIME]"
   Row 3 number "[80%+]", label "[PROFIT PER ROUTE]"
   Every number and every label in off-white, including the percent symbols. No word,
   digit or symbol anywhere in this card is rendered in [accent] — [accent] appears only
   as the title block behind white text.
3. "[GUEST NAME]" — small white extra-bold sans-serif caps, lower left beside the photo.
4. "[TITLE, COMPANY]" — smaller light-gray sans-serif caps beneath the name.
The numbers and labels must be crisp, perfectly spelled, correctly punctuated, and
readable at small sizes.

PERSON: [same circular-portrait block as Concept 2]

LOGO: Lower-right corner …

Overall: clean, credible, highly legible metrics card. No charts, no graphs, no icons, no
clutter, no watermark, no borders.
```

## Finals

```
Reproduce the attached image EXACTLY as it is, at maximum sharpness and full resolution.

This is a finished, approved graphic. Change NOTHING: every word of text must remain
spelled character-for-character identical, in the identical font, weight, italic slant,
size, color and position. The person's face and likeness, the portrait frame, the logo,
the accent blocks and rules, the background, the divider lines, the layout and all margins
must remain pixel-identical.

Do not re-letter, re-word, re-wrap, re-align, restyle, recolor, crop, extend, or recompose
anything. Do not add, remove, or move any element. Do not add a border or watermark.

The only difference from the input should be higher resolution and crisper edges.
```

Run it on the Pro model with `--size 2K`, then resize to 1200×1500. **Re-review the
output** — this pass reproduces faithfully most of the time and silently recomposes the
rest, which is exactly when a head slides into a headline.

## Why the blocks earn their place

- **LAYOUT zones** — the single highest-leverage line on the hook card. Descriptive
  requests ("place him below the text") drift; a forbidden-crossing rule holds.
- **PERSON, with "EXACTLY / identical / preserve"** repeated — one mention drifts. Name the
  garment too, or the model redresses them.
- **TEXT quoted line by line with colors** — this is what produces correct spelling. Loose
  descriptions produce mangled or duplicated words.
- **"Do not render any other words"** — otherwise the model invents captions and taglines.
- **Element cap in the closer** — stops it decorating empty space.
- **Emphasis stated as a block, not a colour** — "white on an accent block" renders legibly;
  "in [accent] for emphasis" renders 2.6:1 and reads as a smudge on a phone. The model does
  exactly what the colour instruction says, so the instruction has to be the accessible one.
- **The wrapped-emphasis clause** — verified against real renders: with the block instruction
  but no wrapping rule, 1 of 2 candidates put the block behind the first line and dropped the
  orphaned last word ("twice.") back to accent letters on navy, 2.35:1. The model treats the
  block as belonging to a *line*, not a *phrase*, unless told otherwise. Always generate at
  least two and run `scripts/contrast.py` on each.
