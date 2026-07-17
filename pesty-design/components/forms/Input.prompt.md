Form controls — `Input`, `Textarea`, `Select`, `Checkbox` — sharing one field system (label, hint/error, red focus ring).

```jsx
<Input label="Business email" type="email" placeholder="you@company.com" icon="search" />
<Input label="City" placeholder="Where do you operate?" error="Enter a city to continue" />
<Select label="Monthly revenue"><option>$1M – $5M</option><option>$5M – $20M</option></Select>
<Textarea label="Tell us about your goals" rows={4} />
<Checkbox label="Send me the pest control marketing newsletter" defaultChecked />
```

All share the `.pesty-field` label/hint structure. Pass `error` to flip to the danger style. Inputs accept a leading `icon`.
