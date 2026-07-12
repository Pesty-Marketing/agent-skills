# Layout and Spacing Reference
**Sources**: Master UI Design, Hierarchy chapter + Practical UI, Chapter 4 (Layout and Spacing)

---

## Group related elements
**Source**: Practical UI, Chapter 4

Breaking up information into smaller groups of related elements helps to structure and organise an interface, making it faster and easier for people to understand and remember.

Four methods for grouping:

**1. Use containers (principle of common region)**
Items within the same boundary or container are perceived as a group. Create containers using borders, shadows, and background colours. This is the strongest visual cue for grouping.

Do not use containers for every group: it creates unnecessary clutter. Look for opportunities to use spacing or other methods instead.

**2. Use proximity (principle of proximity)**
Elements near each other are perceived as related. Place related elements close together. Separate unrelated elements by placing more space between them. Using spacing to create groups (rather than containers) can help declutter and simplify an interface.

Start by applying small spacing to the innermost rectangles and gradually increase spacing as you move outwards.

Practical example: use extra small (8pt) spacing for innermost card text, medium (24pt) for card padding and section content, large (32pt) for gaps between columns, extra extra large (80pt) for vertical padding between website sections.

**3. Use similarity (principle of similarity)**
When things look similar, your mind groups them together. Make related elements look similar by giving them similar visual characteristics: size, shape, and colour.

Within a group, highlight certain elements by making them look slightly different. Example: a middle pricing option can stand out with a different border colour, filled button, and "most popular" badge.

Ensure similar-looking elements function similarly. If elements look similar, people will expect them to work the same way. Conversely, elements with different functionality should look different.

**4. Use continuity (principle of continuity)**
Elements arranged in a continuous line are perceived as related. Our eyes naturally follow elements aligned in continuous straight or curved lines. Lists use continuity to group related elements. Disrupting continuity indicates the end of a group.

---

## Create a clear visual hierarchy
**Source**: Practical UI, Chapter 4 + Master UI Design, Hierarchy chapter

Having a clear visual hierarchy refers to how essential elements in an interface appear relative to each other. This is the most important tool to make an interface feel well-designed.

When everything competes for attention, it feels sloppy, noisy, and chaotic.

Visual hierarchy is created by making more important elements look more prominent using size, weight, colour, contrast, and spacing.

**Bigger is not always better** (Master UI Design): relying only on font size leads to primary content being too large and secondary too small. Use font-weight or colour to do the same job. A softer color for supporting text makes the text more readable than simply reducing the font size.

**Three tiers of action** (Master UI Design):
1. Primary actions: obvious. Solid, high-contrast background colors.
2. Secondary actions: clear but not prominent. Outline styles or lower-contrast background colors.
3. Tertiary actions: discoverable but unobtrusive. Styling like links.

**Weight and contrast** (Master UI Design): bold text covers more surface area and feels emphasized. Solid icons feel heavy and selected. To de-emphasize an icon, lower contrast by giving it a softer color or switching to an outlined version.

**Labels** (Master UI Design):
- Often you do not need labels if the data is obvious from context.
- Combine the label and value into one unit ("12 hours ago") to give meaning without sacrificing clarity.
- When you do need labels, using a darker color for the label and slightly lighter for the value is often enough.

---

## Test visual hierarchy using The Squint Test
**Source**: Practical UI, Chapter 4

Squint or blur the interface. If you cannot easily distinguish between elements, increase spacing to clearly separate them.

Also: step back from your screen or zoom out to make the design smaller to test hierarchy.

---

## Use depth to create a visual hierarchy
**Source**: Practical UI, Chapter 4

Use shadows to raise or lower interface elements to different levels of elevation. Elements with higher elevation appear closer to the user and are more prominent.

Use different levels of elevation to communicate the relative importance of interface elements. More important things should be elevated higher.

Shadow tips:
- Use a small and sharp shadow to slightly raise an element off the page.
- Use a larger and softer shadow to elevate an element higher.
- Make sure the light comes from the top to mimic real-world objects.
- Rather than using pure black for shadow colour, use the darkest variation of the primary colour.

Create predefined shadow options (small, medium, large) in the design system.

---

## Understand the box model
**Source**: Practical UI, Chapter 4

Interfaces are made up of many small rectangles within larger ones. Understanding this helps with spacing decisions:
- Apply small spacing to the innermost rectangles.
- Gradually increase spacing as you move outwards to larger rectangles.
- Use spacing options consistently for improved order and rhythm.

---

## Design at 1x using points (pt)
**Source**: Practical UI, Chapter 4

Design in points (pt), not pixels (px). Points are resolution-independent and translate correctly across screen densities. The predefined spacing scale uses pt values (8pt, 16pt, 24pt, 32pt, 48pt, 80pt).

---

## Create a set of predefined spacing options
**Source**: Practical UI, Chapter 4

Creating a limited set of predefined spacing options significantly speeds up the design process and results in a neater, simpler interface.

Example set: XS 8pt, S 16pt, M 24pt, L 32pt, XL 48pt, XXL 80pt.

Using consistent spacing options results in a neater, simpler interface design that is faster to build.

---

## Space elements based on how closely related they are
**Source**: Practical UI, Chapter 4

More closely related elements should be closer together. Unrelated elements should be separated by more space.

Example usage rules:
- Medium (24pt) internal padding for components like cards.
- Large (32pt) gaps between columns.
- Extra extra large (80pt) vertical padding for website sections.

---

## Be generous with white space
**Source**: Practical UI, Chapter 4

White space refers to the empty space between and around design elements: padding, margins, or even space between lines. White space is not necessarily white; it can be a colour, pattern, or image.

Tight spacing makes it more difficult for people to see groupings and visual hierarchy. More white space makes the interface look simpler, cleaner, and more sophisticated.

When defining space between elements, try to be generous. Instead of using the extra small (8pt) option, consider using the next one up.

> White space is not just leftover space. It is an important design element that improves usability and aesthetics.

---

## Align the main layout to a 12 column grid
**Source**: Practical UI, Chapter 4

The more interface elements you align, the more ordered and structured the interface appears. A 12 column grid is a quick and simple way to improve alignment.

A 12 column grid has three components: margin, column, and gutter. Gutters separate the columns.

Create different page layouts by aligning the main containers to one or more columns. Smaller elements inside the main containers do not need to align to the 12 columns; use predefined spacing options for those.

Example: on a large screen, 3 content cards might span 4 columns each across 12 columns. On a small mobile screen, the cards stack on top of each other.

Gutter size: use your predefined spacing options. Example: large (32pt) gutters on large screens, small (16pt) on mobile.

---

## Grids are overrated (Master UI Design)
**Source**: Master UI Design, Hierarchy chapter

Using a traditional 12-column grid locks you in a controlled environment. Problems arise when you resize: a sidebar grows proportionally taking up space that could be used better by the main content. Consider giving the sidebar a fixed width and letting the main content area flex to fill the remaining space.

**Soft grid vs. implicit grid**: the implicit grid uses systematic negative space between every single element, providing more deliberate control. Traditional grids use fixed sizes; dynamic content needs percentage-based widths. Grids should be flexible containers: 100% wide at small sizes with constraints as they get bigger.

---

## Align text to improve readability
**Source**: Practical UI, Chapter 4

Left-align text for optimal readability. Icons and text should be left-aligned to create a neat left edge, improve readability, and decrease cognitive load.

---

## Try to avoid using multiple alignments
**Source**: Practical UI, Chapter 4

Avoid combinations of different text alignments. It is harder for eyes to follow and can look messy.

---

## Keep related actions close
**Source**: Practical UI, Chapter 4

Per Fitts's Law, the closer and larger a target, the faster it is to click. Keep actions close to the element they relate to.

---

## Make sure important content is visible
**Source**: Practical UI, Chapter 4

Place the most important content where people look first. This is especially important for screen magnifier users who see only a small part of the screen at a time.

---

## Ensure your interface is unbreakable
**Source**: Practical UI, Chapter 4

Design for edge cases: long text, empty states, error states. An interface that breaks with real content is not production-ready.

---

## Whitespace: start with too much
**Source**: Master UI Design, Hierarchy chapter

Whitespace is almost always added to a design when something looks cramped. Instead, start with too much whitespace. When focused on individual elements, they end up appearing closer together when looking at the complete interface. If you need half the screen, use that. Having some extra breathing space will not hurt.

---

## Breaking layouts: columns and mobile-first
**Source**: Master UI Design, Hierarchy chapter

If you get stuck designing your interface, make the canvas smaller. It is easier to design with more constraints.

If you want to split content to fill more width, split it into two columns instead of making a single column wider. Breaking supported text into a new column also makes it easier to fill the form.

---

## Use the Rule of Thirds for photos
**Source**: Practical UI, Chapter 4

For composing photos within an interface, apply the Rule of Thirds: divide the image area into a 3x3 grid and position key subjects along the grid lines or at their intersections.
