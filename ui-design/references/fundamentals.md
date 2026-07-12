# Fundamentals Reference
**Sources**: Practical UI, Chapter 1 (Fundamentals) + Chapter 2 (Less is More)

---

## Minimise usability risks
**Source**: Practical UI, Chapter 1

Design decisions should be based on risk: the risk that someone could have difficulty using the interface. Examples of common risks:

- Thin, light grey text can look sleek but some may find it difficult to read.
- Icons without labels can look clean, but there is a risk that some might not understand what the icons mean. This risk is greater for those with cognitive and vision impairments.
- Adding colour to heading text risks some users mistaking it for a link.

Aim to at least meet WCAG 2.1 level AA requirements. This is the medium level of conformance and a good place to start.

---

## Have a logical reason for every design detail
**Source**: Practical UI, Chapter 1

UI design is about how an interface works and why it works that way. Every detail should have a logical reason that improves usability. Designing using objective logic rather than subjective opinion makes it faster and easier to make design decisions and defend them.

> "That looks nice" or "I don't like it" are just subjective opinions, not logical or constructive feedback.

Example of logic behind a simple row of text blocks with icons:
- Icons and text are left-aligned to create a neat left edge (improves readability and reduces cognitive load).
- Secondary text line height is at least 1.5 to improve readability.
- Text links are coloured blue and underlined so the colour-blind can distinguish them from other text.
- Spacing inside each block is less than the spacing between blocks (shows grouping).

---

## Minimise interaction cost
**Source**: Practical UI, Chapter 1

Interaction cost is the sum of physical and mental effort required to achieve a task. Looking, scrolling, searching, reading, clicking, waiting, typing, thinking, and remembering all add to interaction cost.

Three of the most effective ways to minimise it:

1. **Keep related actions close**. Per Fitts's Law, the closer and larger a target, the faster it is to click. At least 48pt by 48pt is a safe target size.
2. **Reduce distractions**. Animated banners, pop-ups, and unnecessary visuals pull attention away from the task.
3. **Minimise choice**. Per Hick's Law, the time it takes to make a decision increases with the number and complexity of choices. Highlight a smaller set of recommended or popular items to speed decisions.

Worked example from the book: a product page where a dropdown quantity selector plus a repositioned Add-to-cart button costs 3 clicks plus a scroll plus mouse travel. Replacing the dropdown with a stepper component and moving the button next to the stepper reduces it to 2 clicks and a very small mouse movement.

---

## Minimise cognitive load
**Source**: Practical UI, Chapter 1

Cognitive load is the amount of brain power required to use an interface. Quick ways to reduce it:

- Remove unnecessary styles, information, and decisions to reduce distractions.
- Break up information into smaller groups to clearly show relationships and speed up decision making.
- Use conventional design patterns that people are familiar with.
- Maintain consistency by ensuring similar elements look and work in a similar way.
- Create a clear visual hierarchy to show the level of importance of information.

Example: breaking a large complex form into smaller simpler steps reduces cognitive load. People can get overwhelmed by large complex problems; breaking them down into smaller simpler ones makes them easier to solve.

---

## Create a design system
**Source**: Practical UI, Chapter 1

A design system is a collection of predefined options and guidelines to help efficiently make design decisions. It has three components:

**1. Predefined style options**

Colour options: create a small set of predefined colour options with a purpose for each. For example:
- Primary: actions like buttons and links
- Darkest/Dark: headings
- Medium: secondary text
- Light: borders
- Lightest: backgrounds

Typography options: define font sizes and weights once and reuse them throughout the interface. Example set using 1.250 Major Third scale:
- Heading 1: 44px Bold
- Heading 2: 36px Bold
- Heading 3: 28px Bold
- Heading 4: 22px Bold
- Body: 18px Regular
- Small: 15px Regular

Spacing options: a predefined set of spacing options to choose from speeds up design and results in a neater interface. Example set: XS 8pt, S 16pt, M 24pt, L 32pt, XL 48pt, XXL 80pt.

Other predefined options: 3 drop shadow sizes (small, medium, large) and 3 border radius options (8pt small, 16pt medium, 32pt large).

**2. Reusable modules (modular design)**

Start with the smallest components (buttons, avatars, form inputs). Combine small components into larger ones. Arrange components into reusable page templates. The goal is a component library or UI kit.

**3. Usage guidelines**

Many design systems forget to include guidance on how to use components and visual styles. Without clear usage guidelines, there is little chance that a team of designers will design a consistent product experience.

---

## Ensure an interface is accessible
**Source**: Practical UI, Chapter 1

As designers, it is our responsibility to ensure interfaces can be used and understood by the widest possible audience. This is a legal requirement in some countries.

Accommodate people with: blindness, low vision, colour blindness, motor impairment, and cognitive disabilities.

Two important assistive technologies:

**Screen readers**: software that describes an interface using speech or braille to someone who cannot see it. Computer users keyboard through elements; mobile users swipe or drag.

**Screen magnifiers**: software that enlarges part of an interface. More widely used than screen readers. Those using screen magnification have a limited view of an interface, seeing only a small part at a time.

> "An accessible interface benefits everyone, not just those with permanent disabilities."

Good accessibility is good for business: a significant number of people have some form of permanent disability, and all of us will experience temporary and situational disabilities (e.g., bright sunlight on a screen, arm injury) throughout our lives.

---

## Use common design patterns (Jakob's Law)
**Source**: Practical UI, Chapter 1

According to Jakob's Law, it is safest to stick with common or conventional design patterns that people are already familiar with. Design patterns are established solutions to recurring problems.

Building on people's existing mental models means they will not need to spend extra time and effort learning new ones. Using common design patterns is a quick and easy way to reduce usability issues, cognitive load, and interaction cost.

Example: accordion components are a common pattern for saving space when displaying information. They look like a list and include an icon indicating each item can be expanded.

Unconventional form field styles introduce unnecessary usability risk. It is safer to use conventional form field styles that people are used to.

If a product sits on a specific platform (iOS, Android), follow platform guidelines unless they test poorly or result in inaccessible interfaces.

---

## Use the 80/20 Rule to prioritise
**Source**: Practical UI, Chapter 1

Also called the Pareto Principle: roughly 80% of effects come from 20% of the causes.

For product design:
- Roughly 80% of users use 20% of features.
- Roughly 80% of customer complaints come from 20% of product issues.
- Roughly 80% of a customer's attention is spent on 20% of a web page.

Optimise the interface design to cater to the tasks most people will be doing, rather than spending time on edge cases that will rarely be used.

---

## Be consistent
**Source**: Practical UI, Chapter 1

Consistency in UI design means similar elements look and work in a similar way, both within your product and compared with other well-established products. This predictable functionality improves usability and reduces errors.

Create a design system to define guidelines for components, templates, visual styles, and language. Also maintain consistency with other products: link text is underlined, form checkboxes are small squares with a tick, input fields are rectangles with a label on top.

---

## Remove unnecessary information
**Source**: Practical UI, Chapter 2

Every element you add to your interface competes with existing elements. Unnecessary information is a distraction that increases cognitive load.

- Remove repeated elements to instantly simplify without losing information.
- Avoid unneeded words and introductory phrases.
- Reveal less important information gradually (progressive disclosure).

---

## Remove unnecessary styles
**Source**: Practical UI, Chapter 2

Unnecessary styles are those that do not convey information and are purely decorative. Avoid unnecessary lines, colours, backgrounds, and animations to create a simpler, more focused interface.

Common mistakes:
- List items with decorative colours that lack purpose (users assume colours have meaning).
- Headings coloured blue and underlined even though they are not links.
- Icons that look like buttons but are not interactive.

Style trends fade: the more trendy effects used, the worse an interface will age. Sticking with minimal styles that highlight quality content is better for longevity.

"Glassmorphic" and "Neuomorphic" visual styles make it very difficult to create a clear visual hierarchy or achieve sufficient contrast.

---

## Not all links need to be underlined
**Source**: Practical UI, Chapter 2

For accessibility and usability, text links should be coloured and underlined. However, some UI elements already look and feel interactive and do not need the conventional link treatment: navigation menus, cards, and tabs have other cues indicating interactivity.

---

## Use progressive disclosure
**Source**: Practical UI, Chapter 2

Progressive disclosure is the act of revealing information gradually as needed. Show people only what they need to complete the task at hand, rather than overwhelming them upfront.

Progressively disclosing information slightly increases interaction cost, but can significantly decrease cognitive load and speed up decision making.

> Note: use descriptive labels in progressive disclosure elements (not generic "Show more") to aid scanning and ensure actions make sense out of context.

Example: instead of an optional mobile number field, use a checkbox (opt-in) for "Receive updates via text message." The mobile number field only appears when the checkbox is selected.

---

## Do not confuse minimalism with simplicity
**Source**: Practical UI, Chapter 2

Minimal does not mean simple. A minimal interface has fewer elements and styles but is not necessarily simple to understand and use. Minimal interfaces can be vague or confusing as they lack crucial details needed for good usability. Removing or hiding too much can harm usability.

Issues in overly minimal interfaces:
- Interface elements are not labelled, so it is unclear what they are for.
- Selected states are very subtle, so it is unclear which item is selected.
- Actions are hidden and could be missed.
- Icon contrast is insufficient.

---

## Design for the smallest screen first
**Source**: Practical UI, Chapter 2

Start designing on the smallest screen size first. The restricted space forces prioritisation of important elements and removal of unnecessary ones. If you start on a large screen, there is a tendency to fill the screen with more information. More information can increase cognitive load and slow down decision making.

---

## Break up choices to speed up decision making (Hick's Law)
**Source**: Practical UI, Chapter 2

According to Hick's Law, the time it takes to make a decision increases with the number and complexity of choices. Four main ways to reduce choices:

1. **Remove choices**: make sure every option earns its place.
2. **Group or categorise choices**: it is simpler and faster to decide between a small number of categories than to choose from a large list.
3. **Break up choices into multiple steps**: long forms are broken into multiple steps; large navigation menus are broken into multiple levels.
4. **Recommend choices**: video streaming sites recommend popular videos; search boxes suggest common search terms.

Example: removing the first 2 fields from a subscription form results in a much simpler form that is faster and easier to complete, and there is a good chance more people would subscribe.
