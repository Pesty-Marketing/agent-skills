---
name: ui-design
description: Apply Master UI Design + Practical UI frameworks to build or audit interface designs (components, layouts, typography, color, forms, buttons, navigation, copywriting). Invoke when user says "use ui-design," "audit this UI," "review the design," or asks for help building/improving an interface, component, or screen. General-purpose (not Pesty-specific; use the pesty-frontend skill for that).
---

# UI Design Skill

## Mode Detection

Determine mode before doing anything else:

- **Write mode**: User wants to CREATE or BUILD an interface, component, or screen.
- **Audit mode**: User wants to EVALUATE existing design against these frameworks.

---

## WRITE MODE

### Step 1: Establish requirements

Before designing anything, answer these questions:

1. What is the interface trying to help the user accomplish?
2. Who is the user? (Consider: poor eyesight, low computer literacy, reduced dexterity, cognitive impairments.)
3. What screen sizes will this be used on? Start with the smallest.
4. Are there brand colors or an existing design system?

### Step 2: Start small, build up

Per Practical UI's modular design principle: start with the smallest components (buttons, inputs, avatars) and combine them into larger ones.

Read the relevant reference files for the components you are building:

- **Fundamentals**: `references/fundamentals.md`. Covers interaction cost, cognitive load, WCAG, design systems.
- **Color**: `references/color.md`. Covers palette, contrast ratios, system colors, dark mode.
- **Typography**: `references/typography.md`. Covers type scale, line height, body size, alignment.
- **Layout and spacing**: `references/layout-spacing.md`. Covers spacing scale, grouping, white space, grids.
- **Forms and buttons**: `references/components-forms-buttons.md`. Covers labels, validation, button hierarchy, target sizes.
- **Navigation, cards, tables**: `references/components-navigation-cards-tables.md`. Covers navigation patterns, card layouts, table row styles.
- **Copywriting**: `references/copywriting.md`. Covers conciseness, sentence case, front-loading, descriptive links.

### Step 3: Apply key non-negotiables

These rules apply to every interface, every time:

1. **WCAG 2.1 AA at minimum**: 4.5:1 for text, 3:1 for UI components.
2. **Never use color as the only indicator of meaning**: add icons, borders, or underlines.
3. **All interactive elements: at least 48pt by 48pt**.
4. **Single column form layout with labels on top**.
5. **One primary button per action group**.
6. **Sentence case for all interface text**.
7. **Minimum 18px body text. Line height at least 1.5.**
8. **Left-align body text. Do not center or justify long text.**

---

## AUDIT MODE

Read `references/scoring.md` for the numeric rubric (100 points, 6 categories).

For each failure: state what is broken, cite which rule it violates and where in the reference files it is defined, and suggest the exact fix.

### Audit checklist summary

**Fundamentals (20 pts)**
- Every detail has a logical reason.
- WCAG 2.1 AA contrast met everywhere.
- Color is never the only indicator.
- Common design patterns followed.
- 48pt by 48pt minimum target sizes.

**Typography (15 pts)**
- Consistent type scale (no more than 4 to 6 sizes).
- Body text at least 18px.
- Line height at least 1.5 for body text.
- Line length 40 to 80 characters.
- Long body text left-aligned.

**Color (15 pts)**
- Predefined palette with consistent action color.
- Visual hierarchy communicated via saturation and contrast.
- System colors (red/amber/green) for status with icon backup.
- Text not pure black or inaccessible light grey.
- Dark mode: no pure white on pure black.

**Layout and hierarchy (20 pts)**
- Clear visual hierarchy (not everything equal prominence).
- Consistent spacing scale applied.
- Generous white space (passes The Squint Test).
- Elements aligned to a consistent edge or grid.
- Related elements grouped by proximity.

**Components (15 pts)**
- At most one primary button per group; hierarchy not color-dependent.
- Button text is verb-noun format.
- Form: single column, labels on top.
- No placeholder text replacing labels.
- Appropriate controls (radio buttons for up to 10 options, steppers for numbers).

**Copywriting (15 pts)**
- Concise (no filler words, sentences under 20 words).
- Sentence case throughout.
- Front-loaded text.
- Descriptive links and button labels.
- Consistent vocabulary across the interface.

---

## Troubleshooting

**User provides a screenshot only**: describe what you can observe. Note where you cannot verify contrast ratios without exact color codes and ask for them if the audit depends on it.

**User asks about a specific component**: read the most relevant reference file. Cite specific rules, not generic advice. If the rule has a number (48pt, 4.5:1, 18px, 1.5 line height), include it.

**User pushes back on a rule**: explain the rationale. Every rule in these reference files has a reason behind it (usability risk, cognitive load, accessibility, interaction cost). Share that reason, do not just repeat the rule.

**User wants to break a rule intentionally**: acknowledge the rule, acknowledge the tradeoff, and confirm the user understands what they are giving up (e.g., "using a dropdown here with 12 options increases interaction cost but saves vertical space; confirm that is the acceptable tradeoff").

---

## Key numbers to memorise

These are the most cited specific values across both books:

| Rule | Value | Source |
|---|---|---|
| Target size minimum | 48pt x 48pt | Practical UI Ch.1, Ch.8; Master UI Buttons |
| Button spacing minimum | 8pt | Practical UI Ch.8 |
| Button gap for safety | 16pt | Practical UI Ch.8 |
| Small text contrast (WCAG AA) | 4.5:1 | Practical UI Ch.3 |
| Large text / UI elements contrast | 3:1 | Practical UI Ch.3 |
| Min body text size | 18px | Practical UI Ch.5 |
| Min line height (body text) | 1.5 | Practical UI Ch.5; Master UI Typography |
| Heading line height | 1 to 1.3 | Master UI Typography |
| Ideal line length | 40 to 80 characters | Practical UI Ch.5 |
| Mobile max line length | 9 words / 50 to 60 chars | Master UI Typography |
| Paragraph line height multiplier | 1.5x font size | Master UI Typography |
| Type scale multiplier (Major Third) | 1.250 | Practical UI Ch.5 |
| Spacing scale | 8, 16, 24, 32, 48, 80pt | Practical UI Ch.4 |
| Min column padding in tables | 16px each side | Master UI Tables |
| Dropdown threshold | 6 to 7 options | Master UI Selection Controls |
| Radio button threshold | Up to 10 options | Practical UI Ch.7 |
| iOS standard title size | 17px | Master UI Typography |
| Hamburger menu element minimum | 44px | Master UI Navigation |
