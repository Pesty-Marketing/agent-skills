# Pesty Marketing — Design System

The brand design system for **Pesty Marketing**, the #1 digital marketing agency built
*exclusively* for the pest control industry. Pesty delivers SEO, PPC (paid search), and
conversion-focused WordPress/Elementor web design for pest control operators (PCOs) doing
$1M–$20M in revenue who want 15–30%+ YoY growth. The brand voice is **confident,
aggressive, and results-obsessed** — "dominate your market," "battle-tested," "the view is
best at the top."

This repository defines the brand's visual foundations (color, type, spacing, effects),
reusable React UI components, and a high-fidelity recreation of the marketing website.

## Sources referenced

These informed the system. The reader is not assumed to have access; they are recorded for provenance.

- **Logos provided** (uploads): `pesty-logo.svg` (full lockup, teal wordmark for light backgrounds) and `svgexport-4 (1).svg` (white wordmark for dark backgrounds). Both copied to `assets/brand/`.
- **Live website:** https://pestymarketing.com — homepage, services (SEO / PPC / Web Design), case studies (Native Pest, LaJaunie's, Reliant), about, podcast, blog. Built on WordPress + Elementor with Google Fonts. Used for voice, structure, and the marketing-site UI kit.
- No codebase or Figma file was provided.

## Brand at a glance

- **Pesty Red `#D90429`** — the primary, urgent, "aggressive" brand color. CTAs, the logo mark, accents, key metrics.
- **Deep Teal `#002330`** — dark surfaces, headings, footers. The serious, premium counterweight to the red.
- **White** — the base canvas; the site is bright and high-contrast.
- **Logo:** a red stylized "pest" mark (insect with antennae, mid-leap) + lowercase geometric "pesty" wordmark.

---

## CONTENT FUNDAMENTALS

**Voice: aggressive, plain-spoken, operator-to-operator.** Pesty talks like a growth partner
who has skin in the game, not a soft creative agency. Confidence borders on swagger but is
always backed by numbers.

- **Person:** Second person "you / your," with a confident "we." Founder content slips into
  first person "I" (podcast/blog by Andrew Peluso). Direct address: *"Your city's available!"*
- **Tone:** Bold, competitive, militaristic-but-friendly. Recurring metaphors of **dominance,
  battle, and celebration**: "dominate your market," "battle-tested designs tailored to
  conquer your market," "we secure your position at the top—where the view is best,"
  "beat your monthly sales targets and then take your team out to celebrate."
- **Specific, never vague.** Real numbers carry every claim: *"$100,000 of monthly ad spend
  saved," "329 new recurring customers at a $72.04 CAC," "$24.24 cost per qualified lead,"
  "100,000+ qualified leads generated," "grow PCT Top 100 companies by 30% YoY."* Lead with
  the metric, then the story.
- **Qualifying / exclusive.** The brand actively filters: *"We work best with PCOs who are
  serious about growth… you've already hit $1 million per year." "We only work with one client
  per city."* This scarcity is a core message, not a footnote.
- **Casing:** Sentence case for body and most headings. Service names lowercase the category
  ("Pest control SEO"). Title Case in nav. The wordmark "pesty" is always lowercase.
- **Punchy rhythm.** Short declarative sentences. Fragments for emphasis. Frequent
  imperatives and CTAs: "Search now," "Book my call," "Read the case study," "Check your
  market."
- **No emoji** in the marketing voice. The occasional ★ or check glyph appears as a visual
  bullet, never as personality. Industry shorthand is used freely: PCO, CAC, CPL, SEO, PPC, CRO.
- **Vibe:** A no-nonsense growth machine for ambitious blue-collar-adjacent service businesses.
  Premium and data-driven, but grounded and a little scrappy — never corporate-bland.

Examples to emulate:
> "The #1 pest control marketing partner."
> "Results that lead to domination and celebration."
> "Your website should be your hardest-working employee — never resting, always ready to convert visitors into customers."
> "In 15 minutes, we'll know if we can help you dominate your market."

---

## VISUAL FOUNDATIONS

**Overall feel:** Bright, high-contrast, confident. White canvas, deep-teal anchors, and
decisive shots of red. Generous whitespace, big bold headlines, and oversized result numbers.
Modern marketing-agency polish without trendy gimmicks.

- **Color usage.** White dominates. Pesty Red is used *decisively but sparingly* — primary
  CTAs, the logo mark, key stat figures, hover accents, and one full-bleed red CTA band.
  Deep teal anchors dark sections (the results/case-study band, footer). Neutrals are cool,
  faintly teal-tinted grays. Green (`#1F8A5B`) marks wins/positive metrics; amber for
  attention. Never wash a section in red — it's a spotlight, not a wall.
- **Typography.** Display/headlines in **Epilogue** (geometric, confident — matches the
  wordmark), weights 700–800, tight tracking (−0.015 to −0.03em) and tight leading (~1.05) at
  large sizes. Body/UI in **Montserrat** (humanist, legible), 400–500, line-height 1.5–1.65.
  **JetBrains Mono** for data, labels, and code. Eyebrows are uppercase Epilogue semibold with
  wide tracking, usually in red. Headlines often color one phrase in red for emphasis.
- **Backgrounds.** Mostly flat white or flat deep teal. Subtle, restrained accents only: a soft
  radial red tint in the hero corner; an organic red "blob" shape behind hero imagery. **No**
  heavy gradients, **no** purple/blue gradients, **no** noisy textures or repeating patterns.
- **Imagery.** Real photography (founder/team headshots, client context) and flat brand
  illustrations. Warm, human, real. Photos sit in rounded-corner frames, often overlapping a
  red blob or paired with a floating stat card. Where real assets aren't available this system
  uses `<image-slot>` placeholders for the user to drop their own.
- **Borders & dividers.** Hairline `1px` borders in `--border` (#DDE3E6) on cards and section
  splits; `1.5px` on interactive elements (inputs, outline buttons). On dark, borders are
  `rgba(255,255,255,0.14)`.
- **Corner radii.** Soft, not pill-everything: cards at **16px** (`--radius-lg`), large panels
  24px, inputs 12px. **Buttons, badges, tags, and avatars are full pills** (`--radius-pill`).
- **Shadows.** Soft and cool, tinted with the ink/teal hue (not neutral black). Layered
  `sm → xl`. The signature flourish is the **red CTA glow** (`--shadow-brand`) on primary-button
  hover. Cards rest on `--shadow-md` and lift to `--shadow-lg` on hover.
- **Elevation & cards.** Default card = white, `1px` border, `--shadow-md`, 16px radius.
  Interactive cards translate up 4px and deepen the shadow on hover. Dark "deep" cards (teal)
  use a border instead of a shadow and shift their border to red on hover.
- **Motion.** Quick and confident — **no bounce**. Durations 120/200/320ms with
  `--ease-standard` (cubic-bezier(0.2,0,0,1)). Hover = color shift + shadow grow; buttons also
  glow red. **Press** = subtle `translateY(1px)` (no scale-shrink). Reduced-motion respected by
  keeping end-states as base styles.
- **Hover states.** Links and nav shift to red. Primary buttons darken (`--brand-hover`) and add
  the red glow. Cards lift. Trust-cloud logos darken from gray to ink.
- **Transparency & blur.** Used in two places: the sticky nav (`backdrop-filter: blur(12px)` over
  88% white) and subtle white overlays on dark surfaces (`rgba(255,255,255,0.05–0.08)`).
  Not a pervasive glassmorphism motif.
- **Layout rules.** 1200px max content width, fluid side gutters (`--gutter`), fluid vertical
  section rhythm (`--section-y`). 4px spacing grid. Sticky translucent header. Sections
  alternate white / off-white / deep-teal / red-CTA for rhythm — at most one red and one teal
  section in view at a time.

---

## ICONOGRAPHY

- **System:** A curated subset of **Lucide** (MIT-licensed) icons, redrawn as inline SVG paths in
  `components/core/Icon.jsx` so the whole system shares one language: **24px grid, 2px rounded
  stroke, `currentColor`.** This matches Elementor's default icon feel (clean line icons) on the
  live site.
- **Available names:** `arrow-right`, `arrow-up-right`, `arrow-up`, `arrow-down`, `check`, `phone`,
  `search`, `menu`, `x`, `star`, `chevron-right`, `chevron-down`, `chevron-up`, `map-pin`,
  `trending-up`, `trending-down`, `shield-check`, `target`, `zap`, `home`, `bar-chart`, `users`,
  `filter`, `bell`, `more-horizontal`, `calendar`. `star` is the only filled glyph. (The dashboard
  set — `chevron-up`, `arrow-up/down`, `trending-down`, `home`, `bar-chart`, `users`, `filter`,
  `bell`, `more-horizontal`, `calendar` — powers sort indicators, sidebar nav, and deltas.)
- **Usage:** Icons are functional, not decorative-heavy. Common pairings: `arrow-right` on CTAs,
  `map-pin` in the city-search field, `phone` in nav/footer, `shield-check`/`trending-up`/`target`/
  `zap` on trust tags, service cards, and stats. Check marks (`check`) bullet feature/trust lists.
- **Need an icon outside the set?** Add the path from Lucide to `Icon.jsx` (don't hand-invent a
  glyph) and extend the `IconName` type. For larger needs, pull more from the Lucide CDN at the
  same stroke weight.
- **Emoji / unicode:** Not used as UI iconography. A `★` may appear as a typographic accent in a
  badge; otherwise rely on the Icon set.
- **Logo mark** (`assets/brand/pesty-mark.svg`) doubles as the favicon and compact avatar mark;
  always rendered in Pesty Red.

---

## DASHBOARDS & DATA-DENSE INTERFACES

The same light brand system, tuned for **information density** — internal tools, admin panels,
analytics dashboards, and client-facing reports. White canvas, deep-teal sidebar, Pesty Red for
accents and active state. Density is a *deliberate* choice (Kholmatova): tighter spacing, compact
controls, small headings — not the marketing site's generous whitespace. Tokens live in
`tokens/dashboard.css`; components live under `components/{data,nav,layout}/` plus the pills in
`components/feedback/`. A full, self-contained, renders-today example is
`ui_kits/dashboard/index.html` — copy it as a starting point.

**When to reach for these:** any screen whose job is to show a lot of structured data at once
(tables, KPI rows, filters, multi-view nav). For marketing pages, keep using the marketing-site kit.

**Density spec** (grounded in Dannaway's *Practical UI*, *Master UI Design*, Kholmatova's *Design Systems*):

- **Type.** Cell/body text stays **≥ 12px** (`--text-xs`). **11px** (`--text-2xs`) is reserved for
  UPPERCASE MONO only — table headers, status/delta pills. KPI figures are **28px** (`--text-kpi`).
  Use a small step between sizes; carry hierarchy with **weight and color**, not size alone.
- **Tables.** Row height **40 / 48 / 56px** (`condensed` / `regular` / `relaxed`); **≥16px**
  horizontal cell padding (→ 32px between columns). **Right-align numeric comparison columns** and
  set `tabular-nums` so digits line up. Header alignment matches its column. Separator style follows
  data size: **grid** (spreadsheet) · **horizontal** (default) · **zebra** (large sets) · **freeform**
  (small sets). Condense a second field into cell **subtext** (e.g. a city under a client name).
  Add sticky headers / search / sort for large sets; keep status pills to **2–3 states** per table.
- **KPIs.** Drop the label where the value is self-evident; otherwise a muted mono label over an
  extrabold ink (or red `accent`) value. Pair with a `DeltaPill` — flip `goodDirection="down"` for
  cost metrics (CPL, CAC) so a falling number reads green.
- **Layout.** Fixed **deep-teal sidebar** (nesting ≤ 2 levels) + sticky white topbar + flexing
  content region (the "implicit grid" — sidebar fixed, main area fills the rest). Content caps at
  **1320px** (`--container-dashboard`) or goes **full-bleed** for always-on analytics.
- **Depth on light.** Hairline `--border` (#DDE3E6) + subtle navy-tinted `--shadow-xs/sm`. No heavy
  shadows; cards don't lift in a dashboard the way marketing cards do.
- **Accessibility.** Visible `:focus-visible` rings on every control; status conveyed by **color +
  text/icon**, never color alone; all text meets **WCAG AA 4.5:1**; numeric columns use `tabular-nums`.

**Components:** `DataTable`, `KpiTile` + `KpiGrid` (`components/data/`); `StatusPill`, `DeltaPill`
(`components/feedback/`); `Tabs` (`components/nav/`); `Chip` (`components/forms/`); `SectionHeader`
(`components/surfaces/`); `DashboardShell` + `Sidebar` + `Topbar` (`components/layout/`).

---

## INDEX — what's in this system

**Root**
- `styles.css` — the single entry point consumers link. `@import`s only (fonts → tokens → base).
- `readme.md` — this file. `SKILL.md` — Agent-Skill wrapper for download/Claude Code use.

**`tokens/`** — CSS custom properties, each `@import`ed by `styles.css`:
- `fonts.css` (Google Fonts: Epilogue / Montserrat / JetBrains Mono), `colors.css`,
  `typography.css`, `spacing.css`, `effects.css` (radius/shadow/motion), `base.css` (resets +
  `.pesty-container`, `.eyebrow`).

**`assets/brand/`** — `pesty-logo.svg` (light bg), `pesty-logo-white.svg` (dark bg), `pesty-mark.svg` (mark only).

**`components/`** — reusable React primitives (namespace from `check_design_system`):
- `core/` — **Icon** (Lucide-based set)
- `buttons/` — **Button**, **IconButton**
- `feedback/` — **Badge**, **Tag** (checkmark trust pill), **Stat** (big result metric), **StatusPill**, **DeltaPill**
- `forms/` — **Input**, **Textarea**, **Select**, **Checkbox**, **Chip**
- `surfaces/` — **Card**, **Avatar**, **SectionHeader**
- `data/` — **DataTable**, **KpiTile**, **KpiGrid** _(dashboards)_
- `nav/` — **Tabs** _(dashboards)_
- `layout/` — **DashboardShell**, **Sidebar**, **Topbar** _(dashboards)_

Each component ships `.jsx` + `.d.ts` (props) + `.prompt.md` (usage). Foundation/marketing components
have a `*.card.html` showcase; the dashboard components are shown in `ui_kits/dashboard/index.html`
(the `.card.html` cards under `data/` and `nav/` render once the skill is next built upstream).

**`ui_kits/marketing-site/`** — high-fidelity recreation of pestymarketing.com. `index.html` is the
interactive home page (sticky nav + mobile menu, hero with live "check your city" lead form,
trust cloud, services, dark results/case-study band, red CTA band, footer). Composed from the DS
components: `SiteNav`, `Hero`, `CityCheck`, `TrustBar`, `Services`, `Results`, `Footer` (+ `kit.css`).
Photo areas use `<image-slot>` for the user to drop real imagery.

**`ui_kits/dashboard/`** — self-contained dense-dashboard example (`index.html`): deep-teal sidebar,
sticky topbar, KPI row, sortable/zebra data table, tabs + filter chips, and an isolated component
strip. Renders and deploys as-is (no bundle dependency); the migration exemplar for internal tools.

**`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.

**`templates/`** — copy-ready starting points (e.g. `landing-page/`) consuming projects can seed from.

---

## Fonts

Pesty's brand fonts are **Epilogue** (display/headlines), **Montserrat** (body/UI), and
**JetBrains Mono** (data/labels/code) — all loaded from Google Fonts (Pesty's site runs Elementor
+ Google Fonts). Confirmed by Pesty 2026-07-17, replacing the earlier Poppins/Figtree substitutes.
If you ever self-host, drop the files in and replace the `@import` in `tokens/fonts.css` with
`@font-face` rules.
