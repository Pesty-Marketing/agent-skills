# Components: Forms and Buttons Reference
**Sources**: Master UI Design (Forms and Fields, Buttons, Selection Controls chapters) + Practical UI, Chapters 7 (Forms) and 8 (Buttons)

---

## FORMS

### Stack forms in a single column layout
**Source**: Practical UI, Chapter 7

A single column form layout is the safest, most efficient, and simplest layout for the following reasons:
- More efficient: decreases interaction cost by maintaining a consistent downward momentum.
- Decreases cognitive load: people do not need to think about which field to fill out next; they move down in a straight line.
- Fewer missed fields: screen magnifier users have a limited view and are prone to missing fields in a second column.

Short related fields can be placed side by side to reduce form height (example: expiry date and CVC on payment forms), as long as they stay within the bounds of the single column.

---

### Stack labels on top of inputs
**Source**: Practical UI, Chapter 7

Avoid placing labels to the left of form fields. Left-aligned labels create an inconsistent gap between label and input and require your eyes to focus on the label, then move to the input in a zig-zag pattern.

Right-aligned labels reduce interaction cost but create a jagged left edge, making labels harder to scan.

Stacking labels closely on top of inputs is neat and tidy, maintains consistent downward momentum, and decreases interaction cost. Your eyes can see both the label and input in a single focus.

Also stack checkboxes and radio buttons vertically: it clearly separates options so the wrong one is not mistakenly selected.

---

### Label rules
**Source**: Master UI Design, Forms and Fields chapter + Practical UI, Chapter 7

Every text field must have a label. When writing label text, keep labels short and descriptive (no more than a couple of words). Make the label visible to the user.

Do not use "my" on form labels: "my email address" refers to the interface's email address, not the user's. Using "your" is clearer but unnecessary in most cases. Avoid both "my" and "your" if possible.

Avoid unnecessary instructional verbs in labels and hints. "Enter email here" or "Type your email" is unnecessary; the input field already implies this.

Label positioning comparison (Master UI Design):
- **Left-aligned labels**: good when data is unfamiliar. Easy to scale. Biggest drawback: unnecessary distance between label and input.
- **Right-aligned labels**: almost twice the completion rate versus left-aligned. Labels and inputs closely positioned, limiting eye movements. Drawback: hard to scan at a glance.
- **Top-aligned labels**: fastest completion rate. Best choice in most cases. Works well on mobile. Biggest advantage: allows people to capture label and text with one single eye movement. Disadvantage: requires more vertical space.

---

### Minimise the number of form fields
**Source**: Practical UI, Chapter 7

Only ask for information essential to providing your product or service. More form fields can result in:
- Higher chance of abandonment.
- More work and higher chance of mistakes for users.
- More development time.

---

### Mark optional fields
**Source**: Practical UI, Chapter 7

Add the word "optional" to optional field labels. Guidelines:
- Mark required fields with an asterisk (*) or the word "required."
- Mark optional fields with the word "optional."
- Avoid colouring asterisks red, as red commonly indicates an error.

It is safest to mark both required and optional fields, especially for those with cognitive disabilities. This is an accessibility requirement for screen reader users.

Exception: do not mark required fields in short familiar forms like single-field newsletter subscriptions or login forms.

---

### Use opt-ins instead of optional fields
**Source**: Practical UI, Chapter 7

Including optional fields adds complexity. Instead, ask people to opt-in to provide non-essential information.

Example: instead of an optional mobile number field, use a checkbox for "Receive updates via text message." The mobile number field only appears if they check it.

---

### Match field width to the intended input
**Source**: Practical UI, Chapter 7 + Master UI Design, Forms and Fields chapter

The width of a form field sets expectations for the amount of information expected. Using a wide field to collect a small piece of information increases cognitive load and causes confusion.

Do not set all fields to the same width. Set field width to accommodate the most common or longest expected input.

Master UI Design: "Using identical input length for all text fields in your forms will make them visually pleasing but harder to complete."

---

### Stick with conventional form field styles
**Source**: Practical UI, Chapter 7

Per Jakob's Law, it is safest to use conventional design patterns. Unconventional styles make it unclear where people should put their answers (example: labels inside fields where answers go makes fields look pre-filled).

If modifying form fields, keep iconic conventional elements (the border rectangle for inputs, the circle for radio buttons). Without the iconic radio button circle, it is unclear whether multiple options can be selected or whether items link somewhere.

---

### Display hints above form fields
**Source**: Practical UI, Chapter 7

Additional hint or helper text should be placed above the field, not below. Reasons:
- Helps people avoid errors and maintain downward momentum.
- Hints below fields can be covered by autofill menus and on-screen keyboards.

If a password needs to be at least 6 characters long, tell people before they fill out the field, not after.

---

### Do not use placeholder text instead of a label
**Source**: Practical UI, Chapter 7 + Master UI Design, Forms and Fields chapter

Using placeholder text instead of a label is problematic:
- Placeholder text disappears once a person starts filling in the field, causing some to forget what the field was for.
- Some might miss or skip fields with placeholder text, as it can look pre-filled.
- Placeholder text contrast is almost always inaccessible as it is very light by design.

Master UI Design: "Disappearing placeholder text strains users' short-term memory. Without labels, users cannot check all information they provided before submitting a form."

Exception: placeholder text for single form fields like search boxes is fine, as long as contrast ratio is at least 4.5:1 and the field has an accessible label for screen readers.

---

### Try to use radio buttons instead of dropdowns
**Source**: Practical UI, Chapter 7 + Master UI Design, Selection Controls chapter

If there are around 10 options or fewer, consider displaying them as radio buttons instead of hiding them in a dropdown.

Dropdowns are problematic: high interaction cost (multiple precise interactions), can be mistaken for filled fields and accidentally skipped, options are hidden initially.

Radio buttons require one quick interaction and are always visible and easy to compare.

Master UI Design: if the number of options is more than 6 to 7, use a dropdown as users cannot keep all options in mind. The same applies to predictable, similar, or incremental options (zoom: 10%, 20%, 30%).

---

### Use an autocomplete instead of a long dropdown
**Source**: Practical UI, Chapter 7

Rather than force people to scroll through a long dropdown, use an autocomplete search field that displays suggestions as someone types (like the Google search bar).

Tips:
- Suitable for fields where people know what they are looking for (country of birth, specific product).
- For less familiar fields, break the dropdown into multiple separate fields (example: "industry" then "occupation").
- Keep suggestions to around 10 or fewer to avoid choice paralysis.
- Highlight the differences between suggestions rather than the typed characters.

---

### Use steppers for numeric fields instead of dropdowns
**Source**: Practical UI, Chapter 7

A stepper component makes it easier and faster for people to make small numeric changes. It allows increase or decrease with a single button press or by typing.

Example: selecting 2 adults, 1 child, 1 infant with dropdowns costs 6 clicks plus 3 scrolls. With steppers, only 4 clicks.

Stepper design tips:
- Buttons must be at least 48pt by 48pt.
- Place buttons horizontally rather than vertically (more space between buttons).
- Use "+/-" buttons rather than up/down arrows or chevrons (differentiates from dropdowns or accordions).
- Steppers are not suitable for large numeric changes.

---

### Use a checkbox or toggle switch for 2 options
**Source**: Practical UI, Chapter 7

For simple on/off options where the default is off, use a checkbox or toggle switch. They have a lower interaction cost than dropdowns and are more compact than 2 radio buttons.

---

### Use positive phrasing for checkboxes
**Source**: Practical UI, Chapter 7

Avoid situations where users need to tick a box for something not to happen. Master UI Design: "Avoid situations when users need to tick the box in order for something not to happen."

---

### Break up long forms into multiple steps
**Source**: Practical UI, Chapter 7 + Master UI Design, Forms and Fields chapter

Breaking a large, complex form into smaller simpler steps reduces cognitive load and allows people to focus on one small thing at a time.

Master UI Design principle: "By disclosing information progressively, we reveal only the essentials and help users manage the complexity only when they need to." Also: "Conditional logic allows automatically showing or hiding fields and skip pages in a form, based on visitor answers."

---

### Group related fields under headings
**Source**: Practical UI, Chapter 7 + Master UI Design, Forms and Fields chapter

One of the easiest ways to simplify complex forms is to group related fields. Gestalt principles that help items feel related: Proximity, Similarity, Continuity, Closure, and Connectedness. Grouping dozens of unstructured fields into a few manageable sets significantly increases form usability.

---

### Ensure form field borders are high contrast
**Source**: Practical UI, Chapter 7

Form field borders need a colour contrast ratio of at least 3:1 to be visible to people with vision impairment.

---

### Write clear error messages
**Source**: Practical UI, Chapter 7 + Master UI Design, Forms and Fields chapter

The error or invalid status is one of the most important states. Its visual prominence determines how quickly and likely a user is to spot an error.

Master UI Design: "A cross icon and red highlight are common ways designers highlight an input field with invalid or missing information."

Practical UI: "A good inline validation should display messages close to the input. Should not show error messages, but a solution how to fix the problem."

Do not allow premature validation when all fields have not been filled. Consider showing positive validation as a bonus.

---

### Ensure form field labels are close to their fields
**Source**: Practical UI, Chapter 7

Labels stacked on top of inputs allow eyes to see both label and input in a single focus. The larger and more inconsistent the gap, the higher the interaction cost.

---

### Validate on submit rather than inline
**Source**: Practical UI, Chapter 7

Enable buttons and display error messages on submit rather than disabling the submit button until all fields are completed.

> "Instead of disabling the submit button, enable it and display error messages on submit."

This is a simple, accessible solution that avoids people getting stuck.

---

### Field states
**Source**: Master UI Design, Forms and Fields chapter

Design for every possible state: Inactive, Disabled, Hover, Focused, Validated, Error. Set field states using border color, icons for errors/success, or different text weights. Provide feedback to help customers get unstuck.

---

### Selection controls
**Source**: Master UI Design, Selection Controls chapter

- **Checkboxes**: used when there are one or many independent options and users may select any number of choices.
- **Radio buttons**: used when there is a list of two or more mutually exclusive options and the user must select only one.
- **Choice chips**: compact alternative to radio buttons. At least two options. Represent a single selection.
- **Multi-select chips**: compact alternative to checkboxes. Used for filtering on mobile.

Per Fitts's Law, checkboxes and radio buttons are generally tiny and tricky to click or tap, especially on mobile. Include both buttons and labels in the generous clickable/tappable area.

Toggle switch rules (Master UI Design):
- A toggle switch is a digital on/off switch. Any effect triggered should immediately take effect. If not, replace the toggle with a single checkbox.
- Do not create hierarchical structures with toggles: it is more visually distracting and can create a false impression that all child options are on/off.
- Avoid unusual styling: any deviation from platform standards adds cognitive load (example: circular checkboxes easily confused with radio buttons).

---

## BUTTONS

### A button should look like a button
**Source**: Master UI Design, Buttons chapter

A button should look like a button: in general, a rectangular background distinguished from other elements with bold text inside it. A single-action word alone does not look like a button. Include a background color, give it enough breathing room, and add a drop shadow to look more clickable.

---

### Define 3 button weights
**Source**: Practical UI, Chapter 8

In most cases, 3 button weights are needed to indicate the importance of actions: primary, secondary, and tertiary.

**Primary button**: rectangle with rounded corners, solid fill of the primary action colour, and white text. Most prominent button for the most important action.

**Secondary button**: unfilled rectangle with a border and rounded corners. Use the action colour for text and border. Avoid a solid fill of another colour (could conflict with the primary button, especially for the colour-blind). Avoid a light grey fill or outline (could be mistaken for a disabled button).

**Tertiary button**: clear button with underlined text that looks like a text link. Use the action colour for consistency. Underline the text so colour-blind users can tell it is interactive.

---

### Button accessibility requirements
**Source**: Practical UI, Chapter 8

- Buttons must have a clear visual hierarchy that does not depend on colour alone.
- Button shape contrast ratio must be at least 3:1 so vision-impaired users can identify it as interactive.
- Button text contrast ratio must be at least 4.5:1 (WCAG 2.1 level AA).
- If buttons have identical styles, the contrast ratio between them must be at least 3:1.
- Use at least 48pt by 48pt target area.
- Maintain at least 16pt space between buttons to prevent mistaken selections.

Common design mistakes from the book:
- Secondary button with light grey fill could be mistaken for a disabled button.
- Two buttons with similar visual weight break the hierarchy and require colour alone to differentiate.
- A tertiary button with colour as the only indicator of interactivity is not accessible to the colour-blind.
- Inconsistent button shapes (when buttons function the same, they should look the same).

---

### Use a single primary button for the most important action
**Source**: Practical UI, Chapter 8 + Master UI Design, Buttons chapter

The primary button highlights the most important action and helps people understand what to do next.

- If there is not a single most important action, use secondary or tertiary buttons.
- Avoid multiple primary buttons on a screen: they compete for attention and cause confusion.

> "If everything is important, nothing is important."

---

### Use secondary buttons for less important actions
**Source**: Practical UI, Chapter 8

Secondary buttons are the alternative to the primary action. Use them for less important actions or for multiple actions with equal importance.

Example: "Report this email as junk?" with "Report" and "Don't report" buttons of equal importance. Do not make one more prominent as it creates bias.

---

### Use tertiary buttons for the least important actions
**Source**: Practical UI, Chapter 8

Tertiary buttons are good for displaying multiple actions or destructive actions that you want to make less prominent.

Using tertiary buttons for multiple destructive actions (like "remove" from a list) reduces their prominence, corrects visual hierarchy, and makes the most important action (like "send invite") clearly the most prominent.

---

### Try to avoid disabled buttons
**Source**: Practical UI, Chapter 8

Disabled buttons can cause people to get stuck (no feedback on why unavailable), have low contrast making them hard to see, and are not keyboard accessible.

Alternatives:
1. **Enable buttons and validate on submit**: display error messages when the user submits, rather than disabling the button.
2. **Remove unavailable actions**: let people know why those actions are unavailable.
3. **Put a lock icon on unavailable actions**: indicates the action is locked. Works especially well for premium features.

If disabled buttons must be used: include a message near the disabled button explaining why it is unavailable, add a tooltip, and ensure the button is keyboard accessible.

---

### Left align buttons
**Source**: Practical UI, Chapter 8

In most cases, order buttons left to right, most important to least important:
- English is read left to right; people naturally look to the left edge as they move down.
- Right-aligned buttons can be missed on larger screens and by screen magnifier users.
- Placing the most important button first decreases interaction cost for most users.

On mobile: stack buttons top to bottom, from most important to least. Make buttons full-width for one-handed use.

Exception: single field forms (search, email subscription) can place the button on the right of the field to save space.

For multi-step forms: keep the primary button left-aligned and use a tertiary "Back" button at the top left. This reduces the risk of accidentally pressing back and losing data.

---

### Ensure button text describes the action
**Source**: Practical UI, Chapter 8 + Master UI Design, Buttons chapter

Button text should clearly describe the action. A simple rule: verb (action) followed by a noun (thing). Examples: "Save post," "Discard message," "Edit article."

Avoid "Yes," "No," "OK," "Cancel," or labels that are too generic like "Submit." (Master UI Design: "Think of the button as the finishing sentence of a question. Would you like to (Add to basket)?")

Some people look at buttons first as they are very prominent. Descriptive text allows them to take action without reading supporting text. Screen reader users often jump straight to buttons, so text must make sense out of context.

---

### Ensure buttons have a sufficient target size
**Source**: Practical UI, Chapter 8 + Master UI Design, Buttons chapter

Make buttons at least 48pt by 48pt. This aligns with an 8pt grid and is slightly larger than the WCAG recommendation of 44pt by 44pt.

Master UI Design: "For most platforms, consider making touch targets at least 48 x 48 dp. A touch target of this size results in a physical size of about 9mm, regardless of screen size."

Separate buttons by at least 8pt to prevent mistakenly actioning the wrong one.

For small interactive elements, extend the target area beyond the visual bounds of the element.

---

### Color enforces action hierarchy
**Source**: Master UI Design, Buttons chapter

- High contrast for positive action.
- Medium contrast for negative action.
- Low contrast for neutral actions.

Any neutral or negative actions placed next to a primary button should have lower color contrast to de-emphasize them, respecting the visual hierarchy.

---

### Padding
**Source**: Master UI Design, Buttons chapter

Padding is the whitespace around content inside the component. For accessible buttons, the padding on the left/right should be at least double the padding from top to bottom.

---

### Destructive buttons
**Source**: Master UI Design, Buttons chapter + Practical UI, Chapter 8

Do not make destructive actions the same color as your main call to action. Use red or a warning color as a visual cue for warning.

Think twice before adding a Reset or Cancel button. How often would somebody need to reset all entered data? Destructive buttons placed where people do not expect them can be clicked accidentally.

---

### Show progress
**Source**: Master UI Design, Buttons chapter

Buttons are not one-state objects. Always provide feedback on the task the user is about to perform or has just performed. Color changes to buttons show users their action has been accepted. Subtle animations communicate the button's intention.

---

### Put them in the right place
**Source**: Master UI Design, Buttons chapter

The best place to put a button is right next to or below whatever will prompt the user to click it (the last field of a form or a shopping cart icon). The right side generally indicates progression: "Next" or "Submit" goes on the right; "Back" or "Cancel" goes on the left.

---

### Balance icon and text pairs
**Source**: Practical UI, Chapter 8

When pairing icons with text, ensure they have the same visual prominence. Use the same weight (thickness) for icons and text to group them together and balance them visually.
