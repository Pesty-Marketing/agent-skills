# Components: Navigation, Cards, and Tables Reference
**Source**: Master UI Design, Navigation + Cards + Tables chapters
(Practical UI has no parallel chapters for these topics.)

---

## NAVIGATION

### Make navigation evident and intuitive
**Source**: Master UI Design, Navigation chapter

Having good navigation dramatically increases the usability of a product. Sub-par navigation can cause users to abandon the product entirely.

People do not want to think twice about where links go. From a usability perspective, having intuitive navigation is crucial. If you are using cards to navigate certain areas, make sure they have a clear label showing where they lead.

---

### Hand and finger positioning
**Source**: Master UI Design, Navigation chapter

People's fingers are not the same size, but every single one of your customers should be able to use your app. Nobody wants to waste time tapping an icon repeatedly without getting anywhere. Minimum elements inside a hamburger menu should be 44px.

---

### Content needs to be legible
**Source**: Master UI Design, Navigation chapter

Mobile screens are not desktops. Make sure text is legible enough and always test on a real device.

---

### Avoid clutter
**Source**: Master UI Design, Navigation chapter

Falling into the clutter trap is much easier on small screens. Forsake anything not crucial for the experience and trim anything extra. For mobile products to work, they need to be intuitive and straightforward.

---

### Hamburger menu
**Source**: Master UI Design, Navigation chapter

The hamburger menu is a method of hiding elaborate navigation so users can enjoy more screen space. Minimum elements inside the drawer should be 44px. Distinguishing the drawer that expands is crucial for usability. If the drawer is the same color as the app's background, darken the interface underneath the drawer.

---

### Cards as navigation
**Source**: Master UI Design, Navigation chapter

Using cards as navigational elements makes the interface feel more native and tappable. Cards are highly customizable and are a proven way to aggregate individual pieces of information in one place, especially with personalized content.

---

### Tab bar navigation
**Source**: Master UI Design, Navigation chapter

Two options for tab bars:

**Icons only**: benefits only in taking less space (space is precious on mobile). Creates a modern aesthetic but people may get lost before they understand what each icon means.

**Icons with labels**: makes tabs much clearer than icons only. Slightly increases the tab bar height, which is a worthwhile sacrifice for great usability.

All actions should take equal space in their respective area. The active tab should be colored differently from inactive ones.

For text-based tabs, separating with just color alone is not enough. Having an underline or coloring the full tab is the best scenario to improve usability.

**Desktop tab spacing**: if top/bottom padding is 8px, left/right padding should be 3x that (24px). This leads to a safe area of 6x (48px) between one tab and the next.

If you ever need more than three tabs on mobile, cut one slightly at the edge of the screen to suggest scrollability. Keep font size consistent; never use a smaller size for longer tab labels.

---

### Sidebars
**Source**: Master UI Design, Navigation chapter

Sidebars in dashboard designs are quite handy. You can nest many elements in a small space. Do not nest more than two levels down for better readability.

---

### Floating actions
**Source**: Master UI Design, Navigation chapter

Floating actions (FAB) save space for quick actions and can be available anywhere in the product. In most cases it is a circular button in the bottom right corner that expands, leads to another screen, or opens a bottom sheet dialog.

---

### Contextual navigation
**Source**: Master UI Design, Navigation chapter

Contextual navigation is all the links inside content: hashtags, categories, usernames, which lead to a detailed page. If needed in a long block of text, be mindful of how people will interact.

---

### Scaling mobile tab bars
**Source**: Master UI Design, Navigation chapter

If you need more than three tabs on mobile, ensure that one is slightly cut at the edge of the screen to suggest that you can scroll. Keep font size consistent and never use a smaller size for longer tabs.

---

## CARDS

### What cards are for
**Source**: Master UI Design, Cards chapter

Cards are one of the most popular ways of showing content: products, information, people, or actions. They break down content into digestible bits. By giving a container for content, cards indicate that the content is real and relatable to the user.

---

### Displaying cards: layout options
**Source**: Master UI Design, Cards chapter

- **Horizontal carousel**: side-scrolling. If using this, make sure a little of the last card is visible to suggest more content exists.
- **Vertical stack**: great for related content as a catalog. Ideal for data-heavy pages.
- **Stacked (sort-based)**: use for stacked sorting. Ensure enough contrast between the first card and stacked cards behind it. Do not use opacity to convey hierarchy in this method.
- **Grid**: best used when you have complete images on the card that you need to interact with.
- **Masonry grid**: dynamic, does not require the same height. Provides a fun look while keeping items in a column.

---

### Use images accordingly
**Source**: Master UI Design, Cards chapter

Having the right image inside a card looks more appealing and conveys information more effectively. Images catch people's attention first; they read text after. Choosing the visual carefully is essential.

---

### Be cautious with fonts
**Source**: Master UI Design, Cards chapter

If you pick font weights that are too close together, it affects how information is perceived. The first card in an example with the same font size for heading, sub-heading, and body text: nothing catches attention while reading. Make sure to create a good hierarchy without always using bigger font sizes; tweaking weight alone can be enough.

---

### Remove unnecessary elements
**Source**: Master UI Design, Cards chapter

Cleaning the card helps people take actions faster. Every card should contain only the bare necessary information and give a clearer overview.

> "The card should include only the critical information and correlate access to additional details rather than displaying the full details."

Do not overwhelm cards with content. When you add too much, the card becomes very long vertically or too wide horizontally and loses readability.

---

### Avoid embedding links inside cards
**Source**: Master UI Design, Cards chapter

When the whole card is clickable, this greatly increases usability on both touchscreen and desktop. Using additional inline links in the text will confuse most users about what action to take.

---

### Border radius
**Source**: Master UI Design, Cards chapter

Rounding the corners makes it easier and more effective to follow the lines, as it suits the movement of the head and eyes better.

---

### Make cards easy to separate (drop shadows)
**Source**: Master UI Design, Cards chapter

To show depth and reveal that a card is clickable or expandable, use a drop shadow or border. Avoid using pure black as the shadow color as it can ruin an already good-looking design and make it look sloppy.

---

## TABLES

### High readability is the ultimate goal
**Source**: Master UI Design, Tables chapter

When designing a data table, keep the ultimate objective in mind: readability. A great data table is free from all clutter and unnecessary information.

---

### Fonts in tables
**Source**: Master UI Design, Tables chapter

Avoid text smaller than 12 points. Avoid curvy or non-traditional typefaces.

---

### Colors in tables
**Source**: Master UI Design, Tables chapter

Always ensure enough contrast between text and background. Check color codes for borders, backgrounds, and text to ensure those with color blindness can read the table. Use light shades; avoid dark and bright colors; pay attention to contrast.

---

### Row heights
**Source**: Master UI Design, Tables chapter

- Condensed table: row height of about 40px.
- Regular table: row height of about 48px.
- Relaxed table: row height of about 56px.

Adjust font size accordingly, getting slightly larger as row height grows.

---

### Column padding
**Source**: Master UI Design, Tables chapter

Minimum of 16px padding to the left and right of each column, creating 32px of spacing between columns. Adjust proportionally to the height of rows and the amount of data.

---

### Alignment
**Source**: Master UI Design, Tables chapter

- **Numeric data unrelated to size** (phone number, date): align left or center.
- **Size-related numbers**: right-align so readers can quickly compare values. Example: 100,000 in a table will be visually bigger than 9,000 when right-aligned.
- Header alignment must match the data below it.

---

### Row separator styles
**Source**: Master UI Design, Tables chapter

Four options:

**Grid separators**: horizontal and vertical lines in a grid row style. Creates more separation. However, these lines can create visual noise, especially if the table is sparse. Best for dense data tables benefiting from a spreadsheet-style presentation.

**Horizontal separators**: only horizontal lines. Reduces visual noise compared to full grid. Good for all sizes of data sets.

**Zebra stripes**: alternating light row background colours. Ideal for large data sets, allowing readers to follow data across a row. Stripes should not make one set of rows appear highlighted.

**Free form**: removes all dividers for cleanest look. Only use with small data sets, as the lack of dividers can otherwise cause confusion.

---

### Display data efficiently: use subtext
**Source**: Master UI Design, Tables chapter

If presenting a large table with multiple data points per user (e.g., username and email), display the username in the main row and email as subtext below it in the same column, rather than creating two separate columns.

Subtext is expressed using smaller font, lighter-colored font, and/or italic font to clarify it is a different type of data.

---

### Sticky headers
**Source**: Master UI Design, Tables chapter

For large data sets, anchor the header row to the top of the screen as users scroll. This maintains context and reduces friction. Especially useful with small screen sizes.

---

### Search
**Source**: Master UI Design, Tables chapter

For large data sets, giving users a search option is almost always a must. Consider the use case and provide search if finding a particular row would be helpful.

---

### Sorting, filtering, and tabs
**Source**: Master UI Design, Tables chapter

Filters enable users to hide certain types of data to more easily digest what they consider most relevant. Offer filters based on user use cases.

Pagination (labeled as "Tabs" in source): when designing pagination, make it obvious which page the reader is on and make it easy to navigate to and from any page.

---

### Icons and badges
**Source**: Master UI Design, Tables chapter

**Icons**: include an icon to denote a link only if you have a few links in the table. If most rows in a column feature a link, use the column descriptor to communicate that links are present. Save icons for where you need to differentiate data.

**Badges**: for information with 2 to 3 potential states (Active, Pending, Closed), badges and colour coding can implement this information efficiently. Use badges sparingly: multiple different badges create visual clutter.
