# Pesty Design Tokens

Source of truth: `~/Projects/Pesty/tokens.css`. Copy the `:root` block below into every new project's `<style>`.

## Dark Theme (Default — dashboards, internal tools)

```css
:root {
    /* Background & Surfaces */
    --bg: #001c28;
    --surface: rgba(255, 255, 255, 0.035);
    --surface-hover: rgba(255, 255, 255, 0.06);
    --surface-raised: rgba(255, 255, 255, 0.055);
    --surface-raised-hover: rgba(255, 255, 255, 0.08);

    /* Borders */
    --border: rgba(255, 255, 255, 0.07);
    --border-subtle: rgba(255, 255, 255, 0.04);

    /* Text Hierarchy */
    --text: #c8d3dc;
    --text-secondary: #9ab3c2;
    --text-tertiary: #5e8899;
    --white: #eef2f6;

    /* Semantic Colors */
    --accent: #e04560;
    --green: #34d399;
    --blue: #60a5fa;
    --amber: #f59e0b;
    --red: #e04560;
    --purple: #a78bfa;

    /* Semantic Dim (12% opacity backgrounds) */
    --accent-dim: rgba(224, 69, 96, 0.12);
    --green-dim: rgba(52, 211, 153, 0.12);
    --blue-dim: rgba(96, 165, 250, 0.12);
    --amber-dim: rgba(245, 158, 11, 0.12);
    --red-dim: rgba(224, 69, 96, 0.12);
    --purple-dim: rgba(167, 139, 250, 0.12);

    /* Typography */
    --font-display: 'Epilogue', sans-serif;
    --font-body: 'Montserrat', sans-serif;
    --font-mono: 'Space Mono', monospace;

    --text-xs: 11px;   /* labels, metadata, badge text */
    --text-sm: 13px;   /* body text, section headers */
    --text-md: 15px;   /* page headings, card titles */
    --text-lg: 28px;   /* KPI display values */

    /* Spacing (8pt grid) */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-6: 24px;
    --space-8: 32px;
    --space-12: 48px;
    --space-16: 64px;
    --space-20: 80px;

    /* Border Radius */
    --radius-sm: 4px;       /* bars, progress */
    --radius-md: 8px;       /* cards, buttons, inputs */
    --radius-lg: 12px;      /* modals, dialogs */
    --radius-full: 9999px;  /* pills, badges */

    /* Transitions */
    --transition-fast: 110ms ease;   /* table row hover */
    --transition-std: 150ms ease;    /* standard hover */
    --transition-slow: 200ms ease;   /* layout shifts */

    /* Layout */
    --container-width: 960px;
    --container-padding: 24px;

    /* Shadows (navy-tinted) */
    --shadow-card: 0 1px 3px rgba(0, 35, 48, 0.06), 0 4px 12px rgba(0, 35, 48, 0.04);
    --shadow-elevated: 0 4px 16px rgba(0, 35, 48, 0.12), 0 8px 32px rgba(0, 35, 48, 0.08);
}
```

## Light Theme Override (client reports — paste AFTER the dark block)

```css
:root {
    --bg: #f5f5f5;
    --surface: #ffffff;
    --surface-hover: #f9f9f9;
    --surface-raised: #ffffff;
    --surface-raised-hover: #f0f0f0;
    --border: #e0e0e0;
    --border-subtle: #f0f0f0;
    --text: #1a1a1a;
    --text-secondary: #4B5563;
    --text-tertiary: #9CA3AF;
    --white: #111827;
    --shadow-card: 0 1px 3px rgba(0, 35, 48, 0.06), 0 4px 12px rgba(0, 35, 48, 0.04);
    --shadow-elevated: 0 4px 16px rgba(0, 35, 48, 0.12), 0 8px 32px rgba(0, 35, 48, 0.08);
}
```

Semantic colors (`--green`, `--amber`, `--accent`, etc.) stay the same in both themes.

## Type Scale Rules

- 11px — small labels, metadata, badge/pill text, table headers
- 13px — body text, section headers, form labels
- 15px — page headings, card titles
- 28–32px — KPI display values, hero numbers

Uppercase labels always get `letter-spacing: 0.5px`.
Numeric columns always get `font-variant-numeric: tabular-nums`.
Minimum font size: **11px**. Never go below.
