# UI Design Scoring Rubric

Use this rubric for audit mode. Each check is derived from a specific rule in the source books. Score each check as pass (full points), partial (half points), or fail (0 points).

**Score bands:**
- 90 to 100: Excellent
- 75 to 89: Good
- 60 to 74: Needs work
- Below 60: Major rework

---

## Category 1: Fundamentals (20 points)

**1.1 Logical reason behind every detail** (4 points)
Every visible design element has a logical reason that improves usability (not purely decorative unless aesthetics are clearly intentional). Source: Practical UI, Ch. 1.

**1.2 WCAG 2.1 AA accessibility** (4 points)
All essential text meets at least 4.5:1 contrast ratio. All UI components (form fields, buttons, tabs) meet at least 3:1. Source: Practical UI, Ch. 1 + Ch. 3.

**1.3 No colour as the only indicator** (4 points)
Meaning is never communicated by colour alone. Error states use icons plus borders plus colour. Links are underlined in addition to being coloured. Source: Practical UI, Ch. 3.

**1.4 Common design patterns used** (4 points)
Jakob's Law: interface follows established conventions (conventional form fields, standard navigation patterns, familiar button styles). Source: Practical UI, Ch. 1.

**1.5 Target sizes sufficient** (4 points)
All interactive elements are at least 48pt by 48pt. At least 8pt separating buttons. Source: Practical UI, Ch. 1 + Ch. 8.

---

## Category 2: Typography (15 points)

**2.1 Consistent type scale** (3 points)
Font sizes follow a defined scale (Rule of Four from Master UI, or a mathematical scale from Practical UI). No more than 4 to 6 distinct sizes. Source: Master UI, Typography + Practical UI, Ch. 5.

**2.2 Minimum 18px body text** (3 points)
Long body text is at least 18px. Source: Practical UI, Ch. 5.

**2.3 Line height for body text** (3 points)
Long body text has a line height of at least 1.5. Headings have a smaller line height (1 to 1.3 range). Source: Practical UI, Ch. 5 + Master UI, Typography.

**2.4 Line length** (3 points)
Body text lines are 40 to 80 characters per line (including spaces). Text is not stretched to full-page width. Source: Practical UI, Ch. 5.

**2.5 Text alignment** (3 points)
Long body text is left-aligned. Not centre-aligned, right-aligned, or justified. Headings and short text may use centre alignment. Source: Practical UI, Ch. 5.

---

## Category 3: Color (15 points)

**3.1 Predefined color palette** (3 points)
A limited set of predefined colors is used. Actions consistently use the action/primary color throughout the interface. Source: Practical UI, Ch. 3.

**3.2 Visual hierarchy via color** (3 points)
More important elements have higher saturation and contrast. Headings are darker than body text. Source: Practical UI, Ch. 3.

**3.3 System colors for status** (3 points)
Red, amber/warning, and green are used for error, warning, and success states respectively, with additional icons (not color alone). Source: Practical UI, Ch. 3.

**3.4 Text color not pure black or light grey** (3 points)
Body text uses accessible dark grey (not pure #000000 or inaccessible light grey). Source: Practical UI, Ch. 5.

**3.5 No pure white on pure black (dark mode)** (3 points)
If dark mode is present, text is dimmed slightly to prevent bleeding/blurring. High-saturation colors are muted. Source: Master UI, Colors.

---

## Category 4: Layout and Hierarchy (20 points)

**4.1 Clear visual hierarchy** (4 points)
Primary content is most prominent. Secondary and tertiary content is visually de-emphasized via weight, color, or size. Not everything the same prominence. Source: Master UI, Hierarchy + Practical UI, Ch. 4.

**4.2 Consistent spacing system** (4 points)
Spacing follows a consistent predefined scale rather than arbitrary values. Related elements are closer; unrelated elements are further apart. Source: Practical UI, Ch. 4.

**4.3 Generous white space** (4 points)
Interface does not feel cramped. Elements have breathing room. The Squint Test: you can easily distinguish between groups of elements. Source: Practical UI, Ch. 4.

**4.4 Alignment** (4 points)
Elements align to a consistent grid or left edge. Mixed alignments on the same content block are avoided. Icons and text use baseline or left alignment. Source: Practical UI, Ch. 4 + Master UI, Typography.

**4.5 Grouping by proximity** (4 points)
Related elements are grouped together. Labels are positioned close to their fields (not separated by large gaps). Related actions are near the content they act on. Source: Practical UI, Ch. 4.

---

## Category 5: Components (15 points)

**5.1 Button hierarchy** (3 points)
At most one primary button per screen or per action group. Secondary and tertiary buttons are clearly less prominent. Hierarchy does not depend on color alone. Source: Practical UI, Ch. 8.

**5.2 Button text describes the action** (3 points)
Button labels use verb-noun format ("Save post," "Discard message"). No "OK," "Yes," "No," "Submit," or other generic labels. Source: Practical UI, Ch. 8 + Master UI, Buttons.

**5.3 Forms: single column, labels on top** (3 points)
Form fields are stacked in a single column. Labels are stacked on top of inputs, not to the left. Source: Practical UI, Ch. 7.

**5.4 Placeholder text not used as label** (3 points)
Every form field has a persistent visible label. Placeholder text, if present, is a supplement not a replacement for the label. Source: Practical UI, Ch. 7 + Master UI, Forms.

**5.5 Appropriate input controls** (3 points)
Dropdowns are not used for 10 or fewer options when radio buttons would work better. Steppers are used for small numeric changes instead of dropdowns. Autocomplete is offered for long lists. Source: Practical UI, Ch. 7 + Master UI, Selection Controls.

---

## Category 6: Copywriting (15 points)

**6.1 Conciseness** (3 points)
No unneeded filler words, introductory phrases ("would you like to," "in order to"), or sentences over 20 words. Source: Practical UI, Ch. 6.

**6.2 Sentence case** (3 points)
Interface text uses sentence case, not title case. Proper nouns are capitalised; other words are not. Source: Practical UI, Ch. 6.

**6.3 Front-loaded text** (3 points)
Headings, list items, and links put the key information first, not at the end. Source: Practical UI, Ch. 6.

**6.4 Descriptive links and buttons** (3 points)
No "learn more," "click here," or "read more" link text. Links describe their destination. Screen reader users can understand all links out of context. Source: Practical UI, Ch. 6.

**6.5 Consistent vocabulary** (3 points)
The same words are used consistently for the same elements throughout the interface (not "Log in" in one place and "Sign in" in another). Source: Practical UI, Ch. 6.

---

## Test Inputs

Use at least 2 of these per audit session:

- Audit a form (contact form, signup form, checkout form)
- Audit a dashboard or data table
- Audit a landing page hero section
- Audit a navigation + header
- Audit a card grid
- Audit a dialog box or modal
