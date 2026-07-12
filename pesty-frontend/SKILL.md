---
name: pesty-frontend
description: Build or modify Pesty Marketing frontend — dashboards, internal tools, and client reports. Enforces the established dark navy design system (Epilogue + Montserrat, #001c28 background, CSS variable tokens). Use for any HTML/CSS work inside ~/Projects/Pesty/. NOT for external client websites built in WordPress.
---

# Pesty Frontend Skill

## Mode Detection

Determine mode before writing any code:

- **Dashboard / internal tool** — dark navy default, full token set, Epilogue headings, accessible at `pestymarketing.com/internal/`
- **Client report** — light theme override, Arial for print-compat, max-width 860px, accessible at `pestymarketing.com/clients/`
- **Single-page tool / one-pager** — dark navy default; confirm if ambiguous

---

## Mandatory Rules (ALL modes)

Read `references/design-tokens.md` first. Then:

1. **Start every new file** by copying the `:root` block from `references/design-tokens.md` into `<style>`. Never hardcode color or spacing values.
2. **Google Fonts** — always include this exact link in `<head>`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
   ```
3. **Pill scale** — 11px for status badges / delta / labels; 28px for KPI data values. Never swap these.
4. **Logo** — always `<img src="logo.png">` inside a flex anchor:
   ```html
   <a style="display:flex;align-items:center"><img src="logo.png" style="display:block;height:28px;width:auto"></a>
   ```
   Never inline SVG. Never use a color logo variant.
5. **3+ actions in a row** — use text pill links, not icon-only buttons.
6. **CSS-only animations** — no JS animation libraries unless the user asks explicitly.
7. **Single-file HTML** — unless the project already has a multi-file structure.
8. **Spacing** — 8pt grid only: 4/8/12/16/24/32/48/64/80px. No arbitrary values.
9. **Transitions** — name specific properties, never `transition: all`. Standard: `150ms ease`.
10. **Shadows** — navy-tinted base: `rgba(0, 35, 48, ...)`. Never pure black `rgba(0,0,0,...)`.

---

## Dashboard / Internal Tool Mode

Standard rules apply. Additionally:

- Background: `var(--bg)` (#001c28 dark navy) — never light background for internal tools
- Body font: Montserrat 13px, `--text` color, `-webkit-font-smoothing: antialiased`
- Page titles: Epilogue 800, `--white` color, `letter-spacing: -0.5px`
- Section headers: Montserrat 13px 600, `--text-secondary`, uppercase, `letter-spacing: 0.5px`, red left-border accent (`border-left: 3px solid var(--accent)`)
- Container: `max-width: 960px` standard; up to 1200px for data-dense dashboards
- Topbar: flex, `align-items: center`, `justify-content: space-between`, `border-bottom: 1px solid var(--border-subtle)`

Read `references/patterns.md` for complete topbar, card, table, and pill boilerplate.

---

## Client Report Mode

- Use light theme token override from `references/design-tokens.md`
- Font: Arial (no Google Fonts load — print/PDF safe)
- Max-width: 860px, white surface cards, standard semantic colors for status
- Logos: base64-embedded in `<img src="data:image/png;base64,...">` for full portability
- No CSS animations
- Self-contained: no external dependencies beyond inline CSS

---

## Anti-Patterns — Never Do

| Never | Instead |
|---|---|
| Inter, Roboto, system-ui as body font | Montserrat |
| Light background on internal dashboard | Dark navy `#001c28` |
| Purple gradients | `var(--accent)` red or `var(--blue)` accents |
| Inline SVG logo | `<img src="logo.png">` |
| Hero-scale (64px) text for status pills | 11px pill text, 28px for KPI values only |
| `translateY` hover lifts | Background/border color change only |
| `transition: all` | Name specific properties |
| Pure black shadows `rgba(0,0,0,...)` | `rgba(0, 35, 48, ...)` navy-tinted |
| Hardcoded hex colors in styles | `var(--token-name)` |
| Font sizes below 11px | Use `--text-secondary` or lighter weight instead |
| Bottom-border section separators | `border-left: 3px solid var(--accent)` |
| Mixed border radii | 8px cards, 9999px pills, 4px bars |
| `text-align: center` on topbar flex | Explicit `align-items: center` on flex containers |
