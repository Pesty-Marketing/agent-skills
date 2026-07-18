Responsive key→value definition list for spec / metadata blocks (API params, "under the hood" facts, record fields). Auto-fits into columns; values accept JSX.

```jsx
<SpecList items={[
  { key: 'Base URL', value: <code>https://api.example.com</code> },
  { key: 'Auth', value: <><code>X-API-Key</code> header on all routes except <code>/health</code></> },
  { key: 'Storage', value: 'Supabase · pest_control_companies' },
  { key: 'Hosting', value: 'Fly.io (iad, scale-to-zero)' },
]} />
```

Tune `min` (default 260) to control how many columns fit before wrapping.
