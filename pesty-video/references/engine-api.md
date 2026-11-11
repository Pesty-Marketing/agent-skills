# Engine and kit API

`template.html` uses almost everything below; when in doubt, copy its patterns.

## The page

```html
<script src="…react 18.3.1…"></script> <script src="…react-dom 18.3.1…"></script>
<script src="…babel-standalone 7.26.4…"></script>
<script src="engine.js"></script> <script src="kit.js"></script>

<script id="ev-scenes" type="application/json">[…]</script>   <!-- the outline -->
<script id="ev-script" type="application/json">{…}</script>   <!-- the narration -->
<script id="ev-vo" type="application/json"></script>           <!-- written by align-vo.mjs -->
<script type="text/babel" data-presets="react"> … EV.render(Piece, { plan }); </script>
```

Keep the CDN URLs exactly as in the template (pinned versions). Fonts come from Google Fonts in `<head>`.

### `#ev-scenes`

```json
[{"name": "Intro", "chapter": "1 · Why it matters", "desc": "Title card…", "tone": "warm, clear"},
 {"name": "Logo", "dur": 3, "desc": "Silent logo sting at the very end"}]
```
- `name`: unique, no spaces; becomes `CUES.Intro` (the scene's start time).
- `chapter`: shown top-left from this scene on, and as a tick on the scrubber. Scenes without one inherit the previous chapter.
- `desc`: one plain sentence of what is on screen (for you and reviewers).
- `tone`: the ElevenLabs v3 tag used by `vo-script.mjs` (`[warm, clear]`).
- `dur`: only for scenes **without** narration (seconds). Narrated scenes get their length from the words (2.6 words/s plus lead-in and tail), then from the real audio once aligned. With a voice-over, silent scenes may only come at the very end.

### `#ev-script`

```json
{"Intro": [["i1", "Every Monday, each client gets a short report."], ["i2", "Here's how to send it."]]}
```
Each chunk is one caption and one timing anchor. Ids are short and unique (`i1`, `c2`, `s1b`…). `V.i1` is when chunk `i1` starts and `VE.i1` is when it ends.

## `EV.render(Piece, opts)`

`opts`: `plan(p, V, CUES, tl)` (required for camera/overlays), `audio` (path; defaults to `#ev-vo.audio`), `bg` (stage colour or `T => colour`, default `#EDF0F2`), `callouts: false` hides all callouts, `fps` for export (default 30).

URL parameters: `?t=42` opens at 0:42, `?present` auto-hides the controls, `?captions=0` hides captions, `?export` is the bare 1:1 stage used by the exporter.
Keys: space/k play, ←/→ 5 s, shift+←/→ one frame, c captions, m mute, f full screen, Home restarts.

## `useVideo()`

Inside any component:

| Field | Meaning |
|---|---|
| `T` | the clock, in seconds. Draw everything from it |
| `V`, `VE` | chunk start / end times by id (unknown ids return `NaN` and show a red badge in preview) |
| `CUES` | scene start times by name |
| `P` | the finished plan: `P.get(name, T, fallback)`, `P.entry(name, T)` → `[at, value]` or `null`, `P.since(name, T)` |
| `scenes`, `items`, `duration` | timeline data (`items` = captions) |
| `rectOf(key)`, `union(keys, pad)` | stage-space rectangle of registered elements (camera applied) |
| `scene`, `sceneAt(t)` | the current scene object |
| `exporting`, `playing` | flags |

## The plan: `plan(p, V, CUES)`

Called once per timeline. Everything is a beat at a time.

```js
p.layer('app', { rect: { x: 48, y: 88, w: 1824, h: 868 }, frame: 'browser', url: 'app.example.com/reports', content: { w: 1440 } });
p.cam('app', V.c1 - 0.2, 'rpt.tiles', 1.3);   // zoom to an element (z 1 = rest)
p.cam('app', V.s1 - 0.3, null, 1);             // back to rest
p.spot(V.c1 + 0.1, V.c2, ['rpt.t0', 'rpt.t1']);  // dim everything except these
p.callout(V.c2 + 0.4, CUES.AddNote, 'rpt.t1', 'Down 24%: flag it', 'bottom');
p.click(V.w1 + 1.0, 'sb.reports');             // cursor glides there and clicks
p.hover(at, key);  p.tap(at, key);  p.cursor(a, b);
p.set('page', V.w1 + 1.15, 'reports');         // any state you read back with P.get
p.set('lower', V.w1 + 1.15, 'Clients → Reports');  // the lower-third text ('' hides it)
```

**`p.layer(id, cfg)`**: a camera layer. `cfg`:
- `rect`: the outer frame on the 1920×1080 stage. The default `{x:48, y:88, w:1824, h:868}` leaves the chapter band (top) and the caption band (bottom) free.
- `frame`: `'browser'` (52 px bar with traffic lights and `url`), `'window'` (rounded card), `'ipad'`, `'phone'`, or `'none'`.
- `content: { w, h? }`: the width the content is authored at (real UI pixels, e.g. 1440). The layer scales it to fit the frame width (`base = boxWidth / content.w`). Content taller than the frame can be panned.
- `mode`: `'inside'` (default: the frame stays put and the content zooms inside it) or `'whole'` (the device and its content zoom as one piece, inside the band y 72–960).
- `bg`, `radius`, `frameTone: 'dark'`, `view` (whole mode only).

**`p.cam(id, at, key, zoom = 1, dur = 1.0)`**: from `at`, glide over `dur` seconds to frame `key` at `zoom` × the rest scale. `key: null, zoom: 1` returns to rest (top-left of the content). `zoom` is reduced automatically when the element would not fit, and the view is clamped so it never shows past the content's edge. The camera rests until its first keyframe. Use `dur: 0.01` for a cut (for example when the page changes).

**`p.spot(a, b, keys, opts?)`**: dims the layer (or the stage) around the union of `keys` with a red ring, from `a` to `b`. Back-to-back spots (b of one equals a of the next) glide from one target to the next. `opts`: `pad` (10), `dim` (0.38), `color`, `radius`, `clip`.

**`p.callout(a, b, keys, text, side?, opts?)`**: a dark pill with a red leader line pointing at the element. `side`: `'right' | 'left' | 'top' | 'bottom'`; it falls back to whichever side fits on stage. `opts`: `dark` (white pill on dark scenes), `avoid` (a key whose area it must not cover), `accent`. Keep the text to 6 words or fewer: it is the takeaway, not the caption.

**`p.click(at, key)` / `p.hover(at, key)`**: the pointer arrives 0.8 s before `at`, presses and ripples. Clicks less than 6 s apart form one "run" with the pointer visible throughout; between runs it fades out. If the clicked element disappears or leaves the view, the pointer hides until the next glide. **`p.tap(at, key)`** shows a touch dot (tablet and phone). **`p.cursor(a, b)`** sets the visibility windows yourself instead.

**`p.set(name, at, value)`** + **`P.get(name, T, fallback)`**: the way to change UI state over time (page, open dialog, toggles, "sent"). Before its first `set`, `P.get` returns `fallback`. `P.entry(name, T)` gives `[at, value]`, which is handy for "animate from when it changed": `M.enter(T, P.entry('page', T)[0])`.

## Registering elements

Anything the plan aims at needs a key:
```jsx
<div ref={EV.reg('rpt.tiles')}>…</div>       // any element
<K.Button k="rpt.send" v="brand">Send</K.Button>  // kit components take k=
<Hotspot k="hs.save" x={1210} y={96} w={88} h={34} />  // a target over a screenshot
```
Positions are measured without transforms (layout offsets), relative to the camera layer or the stage, and re-measured after every frame. Keys are global, so use prefixes per screen (`sb.` sidebar, `rp.` reports page, `dlg.` dialog…).

## Components (`EV`)

- **`<Scene from to fade=0.45 out=0 bg render={(T, op) => …}/>`**: a full-stage section. It is drawn only while visible (and frozen otherwise). It fades in over `fade`, and a later Scene in the tree paints on top, so consecutive Scenes crossfade. `out` adds a fade-out after `to` (use it when nothing covers it).
- **`<Layer id op>{content}</Layer>`**: renders the camera layer configured by `p.layer(id)`. `op` is its opacity (show it only during its scenes).
- **`<Overlays/>`**: spotlight + callouts + taps + cursor. Place it after the layers.
- **`<Captions y=1014 variant='plain'|'pill' dark size=32/>`**: `dark` can be `T => bool`. Use `'pill'` when captions sit over busy content.
- **`<ChapterLabel x=48 y=30 dark/>`**: Pesty mark + current chapter.
- **`<LowerThird x y state='lower' dark/>`**: a pill showing `P.get('lower')`; for "where we are" (`Configuration → Emails`).
- **`<Hotspot k x y w h debug/>`**: an invisible target; `debug` outlines it while you place it.
- **`<Hold on T render/>`**: freezes an expensive subtree while `on` is false.

## Motion helpers (`EV`)

Use these and nothing else, so the whole video moves the same way.

| Helper | Returns | Use |
|---|---|---|
| `M.enter(T, at, dur=0.45, dy=14)` | style | fade + rise in |
| `M.pop(T, at, dur=0.5)` | style | scale-in with overshoot (badges, icons, numbers) |
| `M.glide(T, a, b, from, to, ease?)` | number | any value from → to (positions, widths, counters) |
| `M.fade(T, a, b, f=0.35)` | 0..1 | a visibility window with soft edges |
| `M.draw(T, a, b)` | 0..1 | progress for lines, bars, rings, underlines |
| `typed(T, at, text, cps=18)` / `typedEnd(at, text, cps)` | string / time | typing |
| `count(T, a, b, to, from=0)` | integer | counting up |
| `ramp(T, a, b)` | 0..1 linear | raw progress |
| `stagger(at, i, step=0.12)` | time | list items |
| `Easing.*` | fn | `easeOutCubic`, `easeInOutCubic`, `easeOutBack`, … |

## Kit (`KIT`, alias `K`)

- **Tokens**: `C` (ink, n0–n900, brand, red50/100/200/600/700, succ, warn, teal…), `F` (`head` Epilogue, `body` Montserrat, `mono`). `Logo({white, height})`, `Mark`, `Ic({n, s, w, color})` (icons: layout-dashboard, user(s), user-plus, mail, send, search, plus, check, x, chevron-*, arrow-*, file-text, folder, calendar, clock, settings, bell, phone, globe, map-pin, lock, eye, pencil, trash-2, filter, bar-chart, trending-up, star, flag, target, shield(-check), triangle-alert, info, circle-help, check-circle, x-circle, ban, list-checks, clipboard-check, database, server, plug, gauge, zap, book-open, image, copy, link, external-link, download, upload, refresh-cw, rotate-ccw, log-in, log-out, panel-left, tablet, smartphone, monitor, message-square(-text), activity, scan-search, circle-dollar-sign, home, more-horizontal, play).
- **App UI** (real-size, 14 px text; all take `k`): `Card`, `CardHeader({title, desc, action, border})`, `CardContent`, `Badge({v: default|secondary|red|destructive|outline|success|warning, icon})`, `Button({v: default|brand|outline|ghost|secondary, size: sm|default|lg, icon, iconRight, pressed})`, `Switch({on: bool|0..1})`, `Checkbox`, `Input({value, placeholder, caret, focus, icon})`, `Select`, `Field({label, hint})`, `Label`, `Hint`, `Sep`, `Muted`, `Tabs({items, active, kp})`, `Alert({v: default|warning|danger|success, icon, title})`, `Avatar({name})`, `Table({columns:[{label, w, right}], rows:[{k, cells, highlight}]})`.
- **`AppShell({nav, active, title, crumbs, actions, user, product, kp='sb', glow, width, height})`**: a dark Pesty sidebar + top bar. It registers `sb.<itemId>`, `sb.root` and `sb.top`. `glow: {itemIdOrGroup: 0..1}` highlights items during a tour.
- **Motion blocks** (1080p sizes; all take `T`):
  - `Backdrop({T, dark, dots, glow})`: the stage background (slow drifting glows + dot grid).
  - `Title({T, at, kicker, title, sub, dark, align, size=84, maxWidth})`: staggered entrance. Put `<K.Hl T at>words</K.Hl>` inside `title` for the red marker sweep.
  - `StepList({T, steps:[{title, desc, icon}], at: time|[times], active, dark, size, kp='step'})`.
  - `Flow({T, nodes:[{id, label, sub, icon, x, y, w, at, tone: light|ink|brand}], edges:[{from, to, at, label, hot}], width, height, dark})`: nodes pop in and arrows draw on; it registers `flow.<id>`.
  - `Checklist({T, title, items:[{text, at, check?}], dark, size, kp='chk'})`.
  - `RuleCards({T, rules:[{kind: do|dont|warn|info, title, text, icon?, at}], columns, dark})`.
  - `Metric({T, at, dur, value, from=0, decimals, prefix, suffix, label, size, color, k})`. While it counts it carries `data-noclaim`, so the claims gate only checks the settled value.
  - `StepTracker({T, steps:[{label, at}], dark})`: SOP progress pills (top right).
  - `Pill`, `KeyCap`, `Kicker`, `EndCard({T, at, title, lines, footer})` (on a dark Scene).

## Stage layout (1920×1080)

| Zone | Where |
|---|---|
| Chapter label | x 48, y 30 (top band 0–76) |
| Step tracker | top right, y 26 |
| App frame (default) | x 48, y 88, 1824 × 868 → bottom at 956 |
| Lower third | inside the frame, bottom left of the content (template: x 400, y 884) |
| Captions | centred on y 1014 (band 960–1080) |
| Callout safe area | y 76 to 948, x 40 to 1880 |
| Motion-graphic scenes | left margin 140, titles at y 150–300 |
