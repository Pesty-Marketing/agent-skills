Code / snippet panel for API docs and references — deep-teal surface, JetBrains Mono, optional uppercase label and one-click copy. Colour syntax with the token spans `c` (comment), `k` (keyword), `s` (string). The panel scrolls horizontally on overflow.

```jsx
<CodeBlock
  label="Example request"
  copyText={`curl -H "X-API-Key: <key>" "https://api.example.com/companies?state=TX"`}
>
  <span className="c"># interactive docs at /docs</span>{'\n'}
  curl -H <span className="s">"X-API-Key: &lt;your-key&gt;"</span> \{'\n'}
  {'  '}<span className="s">"https://api.example.com/companies?state=TX"</span>
</CodeBlock>
```

Omit `copyText` for a static (non-copyable) panel — e.g. an example JSON response.
