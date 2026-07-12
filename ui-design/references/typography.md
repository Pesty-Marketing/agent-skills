# Typography Reference
**Sources**: Master UI Design, Typography chapter + Practical UI, Chapter 5 (Typography)

---

## Set your boundaries: the Rule of Four
**Source**: Master UI Design, Typography chapter

Sloppy and inconsistent usage of font sizes, weights, and colors is a telltale sign of someone who does not have a reliable system. With the Rule of Four, develop your type system using no more than four type sizes. Each size has a distinct meaning.

Example from iOS 14:
- Titles and Actions: 17px
- Subtitles and Body Copy: 15px
- Secondary Actions: 13px
- Metadata: 11px

On nearly every single Apple-designed screen you can find some combination of these sizes. When using more than four sizes causes problems, reconsider your type size choices.

**Extending the Rule of Four**: when you need more variety than four sizes provide, extend using:
- **Color**: distinguish a Title from a Subtitle using full black (#000) versus a softer color (#687684) at the same size and weight.
- **Weight**: subtle font-weight changes indicate actionable elements (Instagram example: profile names use weight change, while @mentions and #hashtags use color because they are user-generated).
- **Positioning**: simply changing the position of text can affect its meaning.
- **Decorating**: add underline or background color while staying within the same four sizes.

---

## Responsive typography
**Source**: Master UI Design, Typography chapter

A 60px header on desktop looks appropriate, but 60px on mobile may look huge. Be cautious about how you apply your type system. Take into account what you are designing and maintain flexibility.

---

## Use a type scale to set font sizes
**Source**: Practical UI, Chapter 5

A type scale is a simple and logical way to create a set of balanced font sizes. Start with a base font size for body text, then multiply by a consistent scale to create larger sizes.

Popular type scales (smallest to largest):
- 1.067 Minor Second
- 1.125 Major Second
- 1.200 Minor Third
- 1.250 Major Third
- 1.333 Perfect Fourth
- 1.414 Augmented Fourth
- 1.500 Perfect Fifth
- 1.618 Golden Ratio

Example using Major Third (1.250) scale starting at 18px body text:
- Heading 1: 44px Bold
- Heading 2: 36px Bold
- Heading 3: 28px Bold
- Heading 4: 22px Bold
- Body: 18px Regular
- Small: 15px Regular

Small type scales (e.g., Major Second) suit complex applications, tools, and dashboards. Large type scales (e.g., Perfect Fifth) suit simpler interfaces like marketing websites. On mobile, switch to a smaller type scale to prevent text wrapping. Round decimal values to the nearest whole number.

---

## Use a single sans serif typeface
**Source**: Practical UI, Chapter 5

It is safest to use a single sans serif typeface for most interface designs, for three reasons:

1. **Legibility**: sans serifs are generally the most legible. The main purpose of interface text is to clearly communicate information so people can achieve a task.
2. **Neutrality**: sans serif typefaces do not convey a strong mood or personality, fitting most brand personalities. The content becomes the focal point.
3. **Simplicity**: sans serifs are simpler and have less character and detail. Complicated typefaces can be distracting and increase cognitive load.

Tips for choosing a sans serif typeface:
- Choose a popular typeface tried and tested by many.
- Look for typefaces with a variety of weights (light, regular, medium, semibold, bold).
- Look for taller lowercase letters and greater letter spacing (higher x-height for legibility at small sizes).
- If supporting multiple languages, ensure the typeface does too.
- Look for typefaces with OpenType features (better language support, Mac and Windows compatibility).
- When in doubt, use the default system typeface (tried and tested, loads quickly).

---

## Evoke emotion using a second typeface for headings
**Source**: Practical UI, Chapter 5

If you want to add personality, try introducing a second typeface for headings only. Since it is only used for headings, legibility at small sizes is not a concern.

General guidelines for typeface moods:
- Sans serif: neutral, minimal, or modern.
- Serif: traditional, established, or classic.
- Rounded sans serif: fun, soft, or playful.
- Casual script: personal or handmade.
- Formal script: formal, feminine, or elegant.
- Light sans serif: chic, modern, or luxurious.

---

## Use regular and bold font weights only
**Source**: Practical UI, Chapter 5

Using many different font weights adds noise and clutter. Keep the design system simple by using regular and bold only (or semi-bold instead of bold if bold is too heavy).

- Use bold weight for headings to emphasize them.
- Use regular weight for other smaller text.
- Reserve very thin or thick weights for headings and larger text, as they can be difficult to read at smaller sizes.

---

## Make long body text bigger
**Source**: Practical UI, Chapter 5

Most people read text from around an arm's length away. For most typefaces, make long body text at least 18px to improve readability. Many websites have text that is too small, especially older ones.

---

## Use at least 1.5 line height for long body text
**Source**: Practical UI, Chapter 5 + Master UI Design, Typography chapter

For accessibility and readability, especially for long body text, ensure line height is at least 1.5 (150%). Keeping line height between 1.5 and 2 generally works well.

The white space between lines helps prevent people from rereading the same line. It also looks and feels more comfortable to read.

Tips:
- Longer lines require a taller line height.
- Darker and heavier typefaces require a taller line height.
- Typefaces that look larger require a taller line height.

Master UI Design specifics:
- Long paragraphs: multiply line height by 1.5 (or 2 for larger font sizes).
- Big headlines: line height of 1 to 1.2 is fine.
- Secondary headlines (between paragraph and large headline): multiply line height by 1.3.
- Spacing between paragraphs: equal to the font size of the content.
- Small headlines: should be closer to paragraph text, 8px to 12px spacing, for reading flow.

---

## Decrease line height as font size increases
**Source**: Practical UI, Chapter 5

While 1.5 line height works well for body text, it is unnecessary on larger text. The larger the font size, the smaller the line height should be for comfortable spacing.

Example: heading at 24px with 1.6 line height versus 1.3 line height. The 1.3 line height creates a consistent gap between lines.

---

## Ensure ideal line length
**Source**: Practical UI, Chapter 5 + Master UI Design, Typography chapter

For readability, ensure text is 40 to 80 characters per line (including spaces). Lines that are too long make it harder to gauge where the line starts and ends. Lines that are too short stress the eyes from having to travel back too often.

Master UI Design: "The best usability principle for readability on mobile is no more than nine words per line, or 50 to 60 characters."

Do not use the full width of the page for text. Keep line length within the recommended character range.

---

## Left align text
**Source**: Practical UI, Chapter 5

English is read from left to right, downwards in an F-shaped pattern. Keep text left-aligned for optimal readability.

- For long body text, avoid centre-aligned or justified text. It is more difficult to read, especially for those with cognitive disabilities.
- Centre alignment can work for headings and short text, but makes longer body text harder to read because the starting point of each line changes.
- Do not justify long body text. The variations in letter and word spacing make it harder to distinguish text and follow lines. Justified text creates distracting "rivers" of white space and is especially hard for those with dyslexia.
- Avoid combinations of different text alignments within the same content block.

---

## Decrease letter spacing for large text
**Source**: Practical UI, Chapter 5

Many typefaces were designed to be read at small sizes in long body text ("text type" typefaces) and have wide letter spacing. At large heading sizes, this wide letter spacing looks awkward.

Decrease letter spacing for large headings. The amount depends on the typeface and size, but generally decrease more as text gets bigger. You probably will not need to decrease letter spacing for "display type" typefaces, as they were designed for large sizes and already have closer letter spacing.

---

## Pairing fonts
**Source**: Master UI Design, Typography chapter

Before working on font pairing, ensure content is well written. No font will save bad copy.

- **Create contrast**: the visual difference between paired fonts needs to be obvious enough that customers immediately understand the importance of each element. Using just one family with different weights provides high contrast while maintaining visual harmony.
- **Too much contrast is bad**: it looks unbalanced in large blocks of text. Works only for logos or minimalist usage.
- **Pick a personality**: use brand guidelines to determine personality. Pair your main font with a more neutral one to establish visual hierarchy.
- If a font does not have bold, do not bold it via CSS or by adding a stroke. The font was designed a certain way.

Font pairing tools from the source: Font Joy, Archetype, Fontpair.

---

## Alignment: baseline vs. center
**Source**: Master UI Design, Typography chapter

A widespread mistake when using more than one font size is to align everything to be vertically centered. When font sizes are close together, centered alignment creates an awkward offset in baselines.

The better approach: align a mixture of font sizes to their baseline (the line that letters sit on). This creates a simpler and cleaner look.

---

## Cases
**Source**: Master UI Design, Typography chapter

- **Lowercase**: rarely a good idea unless there is a solid branding reason.
- **UPPERCASE**: a way to provide variety. Keep in mind that uppercase letters appear to be a font size larger than sentence-cased letters. Use for smaller titles on lists. Do not use for long text.
- **Title Case**: great for titles. Can experiment with Title Case on buttons or actions as a subtle differentiator.
- **Sentence case**: best for complete thoughts expressed as sentences.

---

## Ensure text on photos is legible
**Source**: Practical UI, Chapter 5

Placing text directly on photos is a very common mistake. The contrast ratio must meet WCAG 2.1 level AA:
- Small text (18px and under): at least 4.5:1 contrast ratio.
- Large text (above 18px bold, or above 24px regular): at least 3:1.

Four options to ensure legibility:
1. **Linear gradient overlay**: darkest color variation at 90% opacity at the bottom, fading to 0% opacity halfway up. Add a text shadow for extra contrast.
2. **Semi-transparent overlay**: solid darkest color variation at 50% opacity with a text shadow.
3. **Blur the background image**: combined with a semi-transparent overlay.
4. **Solid text background**: white text on a block using your darkest color variation (popular for video captions).

---

## Avoid light grey and pure black text
**Source**: Practical UI, Chapter 5

Light grey text looks soft and minimal but is not accessible. Always aim for at least 4.5:1 contrast ratio.

Also avoid pure black text on white: black (0% brightness) versus white (100% brightness) creates a large brightness difference that causes eye strain. Use accessible dark grey instead.
