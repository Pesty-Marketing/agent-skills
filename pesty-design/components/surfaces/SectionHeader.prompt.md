Red-left-border section header that breaks a dense view into scannable blocks. Title + optional subtitle, with an optional right-aligned actions slot.

```jsx
<SectionHeader title="Client portfolio" subtitle="128 active accounts" />

<SectionHeader
  title="Pipeline"
  subtitle="This quarter"
  actions={<><Chip selected>Open</Chip><Button size="sm" variant="outline">Export</Button></>}
/>
```
