# Color Reference
**Sources**: Master UI Design, Colors chapter + Practical UI, Chapter 3 (Colour)

---

## Understanding color models
**Source**: Master UI Design, Colors chapter

The HSB color model is the most practical for interface design. Key anchor points:
- Red: 0 degrees (also 360 degrees)
- Green: 120 degrees
- Blue: 240 degrees

**Saturation** defines a range from pure color (100%) to gray (0%). A fully saturated color is pure; fully desaturated is gray.

**Brightness** is a color's relative lightness or darkness, from black (no brightness) to white (full brightness).

To create light shades: move the color picker toward the top-left corner, decreasing saturation and increasing brightness.

Dark shades do not need to be dull. Instead of adding black, increase saturation and decrease brightness. This gives a richer, more vibrant dark shade.

---

## True grays have no saturation; interface grays do
**Source**: Master UI Design, Colors chapter

Most interface projects need 4 to 5 different shades of grey. True gray has 0% saturation. But interface grays often have subtle saturation, which is what makes them feel cool or warm.

---

## Ensure sufficient contrast (WCAG 2.1)
**Source**: Practical UI, Chapter 3

Contrast is a measure of the difference in perceived brightness between two colours, expressed as a ratio from 1:1 to 21:1.

**WCAG 2.1 level AA requirements:**
- **3:1** minimum for large text (above 18px bold, or above 24px regular) and UI elements (form fields, radio buttons, checkboxes). Decorative elements do not need to meet this ratio.
- **4.5:1** minimum for small text (18px or less).

> Master UI Design: "The minimum level of accessibility is 4.5:1 contrast ratio (or AA) for all of your most crucial elements."

The Accessible Perceptual Contrast Algorithm (APCA), part of the WCAG 3 draft, is more accurate than WCAG 2. It measures contrast as numbers (not ratios): 90 preferred for body text, 75 minimum for body text (18px regular+), 60 minimum for 24px regular or 16px bold, 45 minimum for large text and UI elements, 30 for placeholder and disabled button text, 15 for non-text elements. For commercial projects requiring compliance, stick with WCAG 2 until WCAG 3 is released.

---

## Accessible is not ugly
**Source**: Master UI Design, Colors chapter

Achieving the necessary contrast ratio using white text over a colored background can be very difficult, and also creates hierarchical issues. The solution: flip the contrast. Use darker text on top of a lighter color background.

---

## Do not rely on color alone to convey meaning
**Source**: Practical UI, Chapter 3

Many types of color blindness exist, mainly affecting men. Most commonly, people have difficulty distinguishing between red and green.

You cannot rely on color alone to convey meaning or distinguish visual elements. Additional visual cues are required.

Example 1: if a form error is indicated only by turning the border red, the color-blind cannot tell it from a normal field. Fix: add an icon, thicker border, and background shade.

Example 2: a text link colored blue but not underlined: if color is removed, the link looks like plain text. Fix: underline the link.

---

## Use system colors to indicate status
**Source**: Practical UI, Chapter 3

Three system colors cover errors, warnings, and success states. Traffic light colors are used as they already have familiar meanings:
- **Red (error)**: negative message, system failure, urgent attention.
- **Amber (warning)**: caution, risky action.
- **Green (success)**: positive message or action completed as expected.

Ensure system colors are accessible: do not rely on them alone. Use additional visual cues such as icons so that color-blind users can also understand the message.

If using system colors for text: at least 4.5:1 contrast ratio. For interface components and icons only: at least 3:1.

---

## Use color to define a clear visual hierarchy
**Source**: Practical UI, Chapter 3

Not all information has the same level of importance. Use variations in color saturation, hue, and contrast to help define a clear visual hierarchy.

**Saturation**: use more saturated colors for more important elements. Use a saturated color for text links and buttons to help them stand out.

**Hue**: certain hues are more prominent than others and should be used for more important elements. Red stands out significantly, which is one reason it is used for urgent errors.

**Contrast**: give more important elements higher contrast to make them more prominent. Make headings darker than body text to help them stand out.

---

## Light vs. dark interfaces
**Source**: Practical UI, Chapter 3

**Light interfaces**: more common, mainly use dark text and elements on a light background. Generally the safest option as they are simple, legible, and familiar. Most brands use a light, clean aesthetic for universal appeal.

**Dark interfaces**: mainly use light text and elements on a dark background. Growing in popularity. Some brands use a dark aesthetic to create a dramatic, powerful, or luxurious feel. It is especially important to ensure dark interfaces have sufficient contrast.

Light and dark areas can be combined in a single interface to achieve a balanced design and to help with grouping and visual hierarchy.

**Avoid pure black**: it has high contrast against white. Black has 0% brightness and white has 100%, causing our eyes to work harder. Use dark grey instead.

---

## Use black and white for a timeless aesthetic
**Source**: Practical UI, Chapter 3

Black and white are the foundations most interfaces are built on. Designing in black and white first helps focus on spacing, size, layout, and contrast without the extra challenge of color.

Use mostly white backgrounds to create a light interface conveying a simple, classic, or minimal feel. Use mostly black backgrounds for a dramatic, powerful, or luxurious feel.

---

## Add a tinge of color to black and white
**Source**: Practical UI, Chapter 3

Some brands add a tinge of color to black and white to differentiate from others. This retains most of the benefits of a black-and-white interface while adjusting the mood with a pinch of color.

---

## Use 1 brand color
**Source**: Practical UI, Chapter 3

Many top brands use a single unique color alongside black and white to convey brand mood or personality. A single action color can be used purposefully to indicate interactive elements throughout the interface.

Color psychology is not universal: colors affect each of us differently based on personal experiences, preferences, and culture. Associations with specific colors are not universal.

---

## Apply the brand color to interactive elements
**Source**: Practical UI, Chapter 3

Consistently use the brand color to indicate interactive elements such as buttons and links. This teaches people what is interactive and what is not.

---

## Create a monochromatic color palette
**Source**: Practical UI, Chapter 3

A monochromatic palette is made up of variations of a single primary color. Each variation has a defined purpose:
- Primary: actions (buttons and links)
- Darkest: headings
- Dark: secondary text
- Medium: dark borders
- Light: light borders
- Lightest: backgrounds

Using a consistent set of predefined color options avoids spending hours searching for different shades and creates consistency across the interface.

---

## Use the HSB color system
**Source**: Practical UI, Chapter 3 + Master UI Design, Colors chapter

HSB (Hue, Saturation, Brightness) is the most practical color model for interface design. It maps closely to how we actually perceive color.

---

## Dark mode color rules
**Source**: Master UI Design, Colors chapter

- **Avoid pure white on pure black**: pure white makes our eyes absorb more light, causing fonts to bleed with the background and blur on lower-end displays.
- **Reduce saturation**: high saturation has a visual "shaking" effect on dark surfaces. Use low saturation or muted versions of primary colors.
- **Do not use shadows in dark mode**: shadows look odd on dark themes regardless of background shade. Use brightness of elevation instead to create a sense of depth.
- **Buttons in dark mode**: use a shade of the accent color (reduced brightness and saturation) for the primary button. Do not use white for a secondary button as it steals all attention from the primary action.

---

## Adjust photo color temperature to match the palette
**Source**: Practical UI, Chapter 3

Adjust the color temperature of photos to match the overall color palette. Warm-toned palettes suit warm photos; cool-toned palettes suit cool photos. Mismatched photo temperatures can make an interface feel inconsistent.

---

## Creating depth: light source and shadows
**Source**: Master UI Design, Colors chapter

The light source should affect all elements consistently. Imagine a sun shining over a city.

- **Raised elements**: introduce a top border or inner shadow. Add a small shadow below (a couple of pixels, sharp edge). People tend to look downward at screens, so showing a little of the top edge and hiding the bottom edge looks natural.
- **Inset elements**: give the bottom edge a slightly lighter color using a bottom border or inset shadow with a negative vertical offset. Add a small dark inset box-shadow with a slight positive vertical offset at the top.

Adding a slight blur to a shadow makes an element feel slightly raised. A larger shadow makes the element feel much closer to the user. Closer elements attract more focus.

**Flat design depth**: in flat design, lighter elements feel raised from the page. Overlapping elements are the single most effective way to create depth without shadows.

---

## Overlap elements to create depth
**Source**: Master UI Design, Colors chapter

The single most effective way of creating depth is having overlapping elements. This tricks the eye into perceiving multiple layers. You can also make an element taller than its parent so it overlaps on both sides.

---

## Practical gradient guidance
**Source**: Master UI Design, Colors chapter

Environmental gradients work better with a darker color at the top and a lighter color at the bottom (more closely resembles a blue sky). Gradients in interface design can be used as a splash of color rather than creating a realistic environment.
