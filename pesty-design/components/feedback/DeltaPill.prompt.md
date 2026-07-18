Trend-delta chip with a directional arrow and semantic color. Pairs with `KpiTile` or sits in a table cell. Color follows the sign; flip `goodDirection` for cost metrics.

```jsx
<DeltaPill value="+12%" />                          {/* up = green */}
<DeltaPill value="-5%" />                           {/* down = red */}
<DeltaPill value="-8%" goodDirection="down" />       {/* CPL fell → green */}
<DeltaPill value={0} />                              {/* flat = neutral */}
<DeltaPill value="+3.1 pts" direction="up" showIcon={false} />
```

Numeric `value`s get a `+`/`-` prefix automatically; strings are shown as-is (with `tabular-nums`).
