# Asana formatting and API rules

Read this before writing any description or comment. Asana accepts only a small set of markup. Anything else fails or shows up as raw tags.

## Task descriptions (`html_notes`)

The body must be well-formed XML inside a single `<body>…</body>` root, using only these elements:

`<body>` `<h1>` `<h2>` `<strong>` `<em>` `<u>` `<s>` `<code>` `<pre>` `<blockquote>` `<ol>` `<ul>` `<li>` `<a>` `<hr/>` `<img>` `<table>` `<tr>` `<td>`

These are rejected or broken:

- `<p>`, `<br/>`, `<h3>` and smaller headings, `<div>`, `<span>`, `<thead>`, `<th>`.
- Attributes on anything except `<a>` (which takes `href` and `data-asana-gid`) and `<td>` (which takes `width` and `data-cell-widths`).
- An unescaped `&`. Write it as `&amp;`.

The failure message is just `XML is invalid` and doesn't say which element caused it. Check in this order: `<br/>`, `<p>`, `<h3>`, unescaped `&`, then stray attributes.

**Spacing without `<p>`:** put each section under an `<h2>` heading, which Asana spaces automatically, and leave a blank line (`\n\n`) between blocks in the source. A single newline between sections makes a cramped wall of text.

**Tables:** use `<table>` with `<tr>` rows and `<td>` cells. Make the first row the header, with each label in `<strong>`.

**Linking another task:** `<a href="https://app.asana.com/0/0/<task_gid>/f" data-asana-gid="<task_gid>">Task name</a>` shows as a live task link.

**Mentioning a person:** `<a data-asana-gid="<user_gid>"/>`. Mentions notify people, so they need the user's approval like any other write.

## Comments

The REST endpoint `POST /tasks/<gid>/stories` with `html_text` renders the same elements as descriptions.

Some Asana connectors and MCP tools store comment `html_text` as **literal text**, so the comment shows raw `<body><strong>…` tags. You can tell when the response returns your tags escaped (`&lt;body&gt;`). Comments usually can't be edited or deleted through these tools, so if you aren't sure how your tool behaves, use the plain `text` field. In plain text, structure the comment with:

- a one-line bottom line first,
- blank lines between sections,
- `-` or numbered bullets,
- short labels such as `Done:` and `Next:` at the start of a line.

## API behaviour

- **Update with `PUT /tasks/<gid>`.** `PATCH` returns a misleading 404 ("No matching route").
- **Setting a section on create is ignored.** A task created with `memberships: [{section}]` lands in the project's first section. Move it afterwards with `POST /sections/<section_gid>/addTask`.
- **Bracketed text can be stripped from titles.** Editing `html_notes` can quietly remove `[...]` segments from the task name. Read the name back after any description edit.
- **Cross-listing is automatic.** Asana automations may add a new task to workspace-wide projects. That's expected and doesn't need fixing.
- **Clearing a due date:** set `due_on: null`, which also clears `due_at`.
- **Subtask fields:** a parent task's `opt_fields` don't expand to its subtasks. Fetch each subtask separately when you need its fields or comments.
