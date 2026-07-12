# Pesty Component Patterns

Boilerplate for the most common Pesty dashboard components. Copy and adapt — don't reinvent.

---

## Topbar / Header

```html
<header class="header">
  <div class="header-left">
    <a style="display:flex;align-items:center">
      <img src="logo.png" style="display:block;height:28px;width:auto" alt="Pesty">
    </a>
    <span class="header-title">Dashboard Title</span>
  </div>
  <div class="header-meta">Week of May 17, 2026</div>
</header>
```

```css
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-subtle);
}
.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}
.header-title {
    font-size: 13px;
    color: var(--text-secondary);
}
.header-meta {
    font-size: 11px;
    color: var(--text-tertiary);
    text-align: right;
    letter-spacing: 0.3px;
}
```

---

## KPI Card

```html
<div class="kpi-card">
  <div class="kpi-label">Impressions</div>
  <div class="kpi-value">24,810</div>
  <span class="delta positive">+12%</span>
</div>
```

```css
.kpi-card {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 24px;
}
.kpi-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}
.kpi-value {
    font-family: 'Epilogue', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--white);
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
}
```

---

## Delta / Status Pill

```html
<span class="delta positive">+12%</span>
<span class="delta negative">-3%</span>
<span class="pill on-track">ON TRACK</span>
<span class="pill behind">BEHIND</span>
```

```css
.delta, .pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;     /* ALWAYS 11px — never hero scale */
    font-weight: 600;
    font-variant-numeric: tabular-nums;
}
.delta.positive { background: var(--green-dim); color: var(--green); }
.delta.negative { background: var(--red-dim); color: var(--accent); }
.pill.on-track  { background: var(--green-dim); color: var(--green); }
.pill.behind    { background: var(--amber-dim); color: var(--amber); }
```

---

## Section Header (red left-border style)

```html
<h2 class="section-header">Organic Search</h2>
```

```css
.section-header {
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-left: 12px;
    border-left: 3px solid var(--accent);
    margin: 0;
}
```

No bottom-border separators. Use `padding-top: 48px; border-top: 1px solid var(--border-subtle)` between major sections.

---

## Data Table

```html
<table class="data-table">
  <thead>
    <tr>
      <th>Page</th>
      <th>Clicks</th>
      <th>Impressions</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>/pest-control/</td><td>1,240</td><td>8,902</td></tr>
  </tbody>
</table>
```

```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-subtle);
}
.data-table td {
    font-size: 13px;
    color: var(--text);
    padding: 10px 12px;
    font-variant-numeric: tabular-nums;
    border-bottom: 1px solid var(--border-subtle);
    transition: background-color 110ms ease;
}
.data-table tr:hover td { background: rgba(255, 255, 255, 0.03); }
```

---

## Card Grid

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}
```

---

## Navigation Tabs (page-level view switching)

```html
<nav class="tab-nav">
  <a href="#" class="active">Overview</a>
  <a href="#">By Client</a>
  <a href="#">By Week</a>
</nav>
```

```css
.tab-nav {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 24px;
}
.tab-nav a {
    color: var(--text-tertiary);
    text-decoration: none;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 16px 10px;
    border-bottom: 2px solid transparent;
    transition: color 150ms ease, border-color 150ms ease;
}
.tab-nav a:hover { color: var(--text); }
.tab-nav a.active { color: var(--white); border-bottom-color: var(--white); }
```

---

## Toggle Chips (in-page filtering)

```html
<div class="chip-row">
  <button class="chip active">Last 30 Days</button>
  <button class="chip">Last 90 Days</button>
  <button class="chip">YTD</button>
</div>
```

```css
.chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background-color 150ms ease, border-color 150ms ease;
    font-family: 'Montserrat', sans-serif;
}
.chip:hover { background: rgba(255, 255, 255, 0.08); }
.chip.active {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--border);
    color: var(--text);
}
```

---

## Base HTML Shell

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Title · Pesty</title>
  <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      /* paste dark theme tokens here */
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    :focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
    .container { max-width: var(--container-width); margin: 0 auto; padding: 32px var(--container-padding) 80px; }
  </style>
</head>
<body>
  <header class="header">...</header>
  <main class="container">...</main>
</body>
</html>
```

---

## Accessibility Checklist

- [ ] All interactive elements have `:focus-visible` styles
- [ ] Minimum 11px font size everywhere
- [ ] `tabular-nums` on all numeric columns
- [ ] Color not the only indicator of meaning (pair with text or icon)
