Filter / toggle chip for narrowing dense views. `selected` toggles the red fill; `removable` adds an ✕. It's a real button — keyboard-operable with a focus ring.

```jsx
<Chip selected={f === 'all'} onClick={() => setF('all')}>All</Chip>
<Chip selected={f === 'seo'} icon="filter" onClick={() => setF('seo')}>SEO</Chip>
<Chip removable onRemove={() => clearFilter('atlanta')}>Atlanta, GA</Chip>
```
