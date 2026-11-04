# Scene library

`video.html` loads `motion/motion.css`, one theme (`motion/themes/<theme>.css`), `timeline.js` and `motion/motion.js`. Start from the template that `new.py` wrote.

## Page skeleton

```html
<body class="preset-story">            <!-- preset-loop | preset-walkthrough | preset-story; add "dark" for deep backgrounds -->
<div class="logo"></div>                <!-- theme supplies the image -->
<section class="scene" data-scene="hook"> … </section>   <!-- one per storyboard scene, same id -->
<div class="band">…</div>               <!-- optional persistent elements: outside any .scene -->
<div class="captions"></div>            <!-- filled from narration when captions are on for this size -->
<div class="progress"></div>
<script src="timeline.js"></script><script src="motion/motion.js"></script>
</body>
```

Scenes fill the safe area and center their content vertically. Add class `top` to align a scene to the top instead.

## Timing grammar

Put these attributes on any element:

| attribute | meaning |
|---|---|
| `data-in="0.4"` | Starts 0.4 s after its scene starts. Outside a scene, the time is absolute. |
| `data-in="@revenue"` | Starts when the narrator says "revenue" in this scene. Use `@revenue+0.2` or `@revenue-0.3` to shift it (a small lead-in lets a count-up land on the word), and `@18.1#2` for the 2nd time it's said. Words are matched with case and punctuation ignored, and `$` is dropped ("$18.1" matches `@18.1`). |
| `data-anim` | `up` (default), `down`, `left`, `right`, `fade`, `pop`, `zoom`, `slam` (big-to-size with blur, for the number or word that matters), `blur`, `flip`, `grow-x`, `grow-y`, `type` (left-to-right reveal), `wipe`, `draw` (an SVG path drawing itself on), `strike` (on `.strike`), `mark` (highlighter sweep, on `.mark`), `words` (each word rises in, staggered by `data-stagger`, default 0.07 s), `speak` (each word appears as the narrator says it), or `none`. Directional and pop entrances land with a small spring overshoot. |
| `data-pulse="@word; @other"` | A quick scale punch for emphasis at each time. Use it to give a held stat a second beat. |
| `data-trans` (on a `.scene`) | How the scene enters and leaves: `push` (default for story/walkthrough: slides in from the right, out to the left), `zoom`, `fade` (default for loops) or `cut`. Mix two or three across a video. |
| `data-drift="off"` (on a `.scene`) | Turns off ambient motion. By default every non-loop scene creeps forward ~3% over its length and every `.photo img` / `img[data-kb]` drifts (Ken Burns), so no frame is ever frozen. |
| `data-dur="0.6"` | Animation length in seconds. Each animation has its own default. |
| `data-out="3.5"` | Fades the element out at that time (same grammar as `data-in`). |
| `data-count="18.1" data-from="12.5" data-prefix="$" data-suffix="M" data-decimals="1"` | A number counting up, starting at `data-in`, lasting `data-dur` (1.4 s by default). |
| `data-small-ok` | Exempts deliberate small glyphs from the text-size gate. Use it rarely. |

**Pace.** Viewers leave when the frame stops changing. Aim for a new beat every 1.5–2.5 s: a word-timed reveal, a pulse, a camera move, or a cut. Prefer more short scenes (one idea, 3–6 s) over few long ones; a sentence with four items is a scene of four word-timed tiles, not a static list. Alternate white scenes with `.scene.ink` (deep full-bleed) and the occasional `.scene.flood` (accent full-bleed) for rhythm. Headlines that the narrator reads use `data-anim="speak"`; the `pace` gate fails any scene that holds still longer than `max_still` (3 s for story/walkthrough, 6 s for loops).

Land each big reveal on its spoken word, not on a guessed time. The timing gate fails if a word is never said in that scene, or if an element starts after its scene is nearly over.

## Components

**Text:** `.eyebrow` (mono label), `.hero` (largest), `h1`, `h2`, `.lead` (muted paragraph), `em` (accent color), `.muted`, `.mono`, `.nowrap`.

**Layout:**
- `.row`: side by side in landscape, stacked in portrait. Use `.row.keep` to stay side by side in portrait too, and put `.grow` on the child that should fill the space.
- `.center`
- `.only-landscape` and `.only-portrait`
- `.card`: a surface panel.

**Stat:**
```html
<div class="stat"><div class="num" data-count="18.1" data-from="12.5" data-prefix="$" data-suffix="M" data-in="@18.1"></div>
  <div class="label" data-in="@18.1+0.4">revenue in 2025</div></div>
```

**Before / after:**
```html
<div class="ba"><div class="side" data-in="0.3"><div class="k">2023</div><div class="v">$12.5M</div></div>
  <div class="arrow" data-in="0.8" data-anim="fade">&rarr;</div>
  <div class="side after" data-in="@18.1"><div class="k">2025</div><div class="v">$18.1M</div></div></div>
```

**Tiles** (quick beats, one per spoken item): `<div class="tiles"><div class="tile" data-in="@location" data-anim="pop"><b>01</b><span>Location pages</span></div>…</div>` (`--tcols` sets columns; stacks in portrait).

**Stamp** (a rotated label slammed onto a stat): `<div class="stamp" data-in="@pause" data-anim="slam">Paused</div>`.

**Highlighter:** `<span class="mark" data-in="@services" data-anim="mark">services and markets</span>`.

**List:** use `<ul class="list">` with `<li data-in=…>` items, or `.list.checks` for checkmarks.

**Term rows** (a big word plus a small note): `<div class="terms"><div class="term" data-in=…><b>6 placements</b><span>in month 1, not 5</span></div>…</div>`. Use `--term-w` to set the width of the word column.

**Quote:** `<blockquote class="quote" data-in=…>Text <span class="who">Name, Company</span></blockquote>`

**Chat bubble:** `<div class="bubble" data-anim="pop">Best pest control in Dallas?</div>`

**Bar chart:**
```html
<div class="bars" style="--bars-h:520px">
  <div class="bar" style="--v:.69"><i data-in="0.3" data-anim="grow-y"></i><b data-in="0.6" data-anim="fade">$12.5M</b><span>2023</span></div>
  <div class="bar hi" style="--v:1"><i data-in="@18.1" data-anim="grow-y"></i><b data-in="@18.1+0.3" data-anim="fade">$18.1M</b><span>2025</span></div>
</div>
```
`--v` is each bar's height as a fraction of the tallest. Make it proportional to the real numbers, never exaggerated.

**Line or shape drawn on:** `<svg …><path d="…" fill="none" stroke="var(--accent)" stroke-width="8" data-in="0.5" data-anim="draw"/></svg>`

**Cell grid** (for example, 20 AI answers): `<div class="cells" style="--cols:10;--cell:68px"><div class="y" data-in=… data-anim="pop">&#10003;</div><div class="n">&#10007;</div>…</div>`. Generate long runs of cells in a small `<script>` before `motion.js`, or write them out by hand.

**Screenshot with camera, cursor, highlight and callout:**
```html
<div class="shot browser" style="height:720px">
  <div class="bar"><i></i><i></i><i></i><span>aivisibility.pestymarketing.com</span></div>
  <div class="view">
    <div class="cam" data-cam="t=0 s=1 x=50 y=0; t=@enter s=1.9 x=30 y=42; t=@results s=1.3 x=50 y=70">
      <img src="shots/form.png">
      <div class="hl" style="left:12%;top:38%;width:36%;height:8%" data-in="@enter" data-anim="zoom"></div>
      <div class="cursor" data-path="t=0.8 x=80 y=80; t=@enter x=30 y=42 click"></div>
    </div>
  </div>
  <div class="callout" style="right:40px;bottom:40px" data-in="@results" data-anim="pop">20 answers in 60 seconds</div>
</div>
```
- `data-cam` steps: `t` (time, same grammar as `data-in`), `s` (zoom), and `x` / `y` (the point of the image, in %, to center). The camera eases between steps and never shows past the image edges.
- `.hl`, `.cursor` and click ripples sit inside `.cam`, positioned in % of the image, so they move with the zoom.
- `.callout` sits outside `.cam` and stays fixed on screen.
- Drop `browser` and the `.bar` for a frameless screen.
- For a recorded clip, put `<video src="clips/x.webm" muted data-in="1.0" data-anim="fade">` inside `.cam` in place of the `<img>`. The clip is seeked frame by frame along with everything else.

**QR:**
```html
<img class="qr" style="--qr:430px" src="qr.png" data-qr="https://exact.url/" data-in=… data-anim="pop">
```
`data-qr` must be the exact URL the code holds. The gate decodes the code and compares it.

**Calendar tile:** `<div class="cal"><i>OCT</i><b>22</b></div>`

**Band** (persistent bottom CTA, for loops):
```html
<div class="band"><div class="what"><b>Free AI Visibility Test</b><span>Right here at this booth</span></div><img class="qr" …></div>
```
Also set `body{--bottom-reserve:270px}` so scenes stay clear of the band.

**End card:** `<div class="end-card"><div class="end-logo"></div><h1>…</h1><div class="cta">Book a call</div><div class="url">pestymarketing.com</div></div>`

**Step badge:** `<div class="step"><b>2</b>Pick your cities</div>`

**Decoration:** `<div class="glow"></div>` adds a soft accent glow in the top-right corner.

## Adding a component

1. Put scene-specific CSS in a `<style>` block in `video.html`.
2. When the same thing turns up in a second video, move it into `$MV/assets/motion/motion.css`, add a section here, and run `new.py --refresh` on the projects that use it.
3. Animate with `data-anim` where you can. CSS `animation:` rules and Web Animations from your own `<script>` (placed before `motion.js`) are also paused and seeked, because the renderer takes over every animation on the page. A `setTimeout`, `requestAnimationFrame` loop or GIF is never seeked, so it will stutter or freeze in the render.
4. Use theme variables, never raw hex: `--bg`, `--fg`, `--muted`, `--muted-2`, `--line`, `--surface`, `--accent`, `--accent-text`, `--good`, `--bad`, `--ink`, `--font-display`, `--font-body`, `--font-mono`.

## Themes

A theme is one CSS file in `motion/themes/`. It holds:
- the font `@import`
- `--motion-fonts`, the font list the render checks
- colors for `body` and `body.dark`
- the `.logo` / `.end-logo` image rules

To make a client theme, copy `neutral.css`, then put the client's logo in `motion/brand/` and point the logo rules at it.
