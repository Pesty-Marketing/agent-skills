Horizontal step / flow strip — ordered stages joined by arrows, for showing a process. Wraps onto multiple lines on narrow viewports.

```jsx
<Pipeline steps={[
  'Scrape state registry',
  'Normalize schema',
  'Enrich website',
  'Upsert to Supabase',
  'Serve via API',
]} />
```

Steps can also be `{ label }` objects if you need richer content per step.
