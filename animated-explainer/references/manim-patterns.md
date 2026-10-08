# Manim patterns for explainer scenes

Manim Community v0.21, Cairo renderer, no LaTeX. The design system is `assets/kurz.py`; its docstrings give exact signatures.

## Scene skeleton

```python
import os, sys; sys.path.insert(0, os.environ["EXPLAINER_ASSETS"])
from kurz import *

class Hook(ExplainerScene):
    def construct(self):
        maya = Person(shirt="blue", hair="long", hair_color=1)
        place(maya, "left_third")
        name = caption("Maya", "text").next_to(maya, DOWN, buff=0.15)

        with self.beat("hook-1") as b:           # narration for hook-1 starts here
            self.play(pop_in(maya), rise_in(name), run_time=b.t(0.3))
            msgs = VGroup(*[card(label(t, size=24), "line") for t in ("Q3 deck?", "Lunch?", "URGENT", "Re: Re: Re:")])
            msgs.arrange(DOWN, buff=0.18); place(msgs, "right_half")
            self.play(stagger([rise_in(m) for m in msgs]), maya.express("worried"), run_time=b.t(0.5))
        # leaving the block waits out the rest of the sentence (+0.25 s), logs timing, checks layout

        with self.beat("hook-2") as b:
            self.set_header("Too much noise", "pink", run_time=b.t(0.2))
            ...
```

- One class per act, named exactly as the storyboard `scene` field. Objects persist across beats until removed.
- **Keeping something across an idea change** (a step row that stays while the detail below changes): `clear_stage()` removes everything but the header, so instead `FadeOut` only the parts that go (`self.play(FadeOut(detail))`) and keep the rest. Never `FadeOut(VGroup(*self.mobjects))`; use `clear_stage()`.
- Custom elements should sit at or below `CONTENT_TOP`; anything above it collides with the header and its underline.
- `b.duration` is the narration length; `b.t(f)` = f × duration. Keep a beat's run_times summing to ≤ 0.85; the render logs a QA warning above 0.9 because the finished frame needs time on screen.
- Narration plays only via `self.beat()`, so never call `add_sound` yourself.
- **Every helper spends beat time.** Defaults: `set_header` 0.5 s, `clear_stage` 0.5 s (total, including a `header=` swap), `express` 0.35, `blink` 0.25, `hop` 0.45, `pop_in` 0.55, `Indicate` 1.0. Pass `run_time=b.t(x)` to helpers too so the 0.85 budget stays honest.
- **Idea change:** `self.clear_stage(header=("Step 2: Augment", "orange"), run_time=b.t(0.2))` clears and swaps the header together. A plain `clear_stage()` keeps the old header, and the QA log will ask you to confirm it still fits.
- `CONTENT_CENTER` sits ~0.3 units below the frame centre (the header takes the top band). Position with `place()`/`zone()` rather than hand-typed coordinates so everything shares that centre. `place(mob, zone)` only shrinks; `place(mob, zone, grow=0.85)` also enlarges a small diagram to fill 85% of the zone.
- **Layouts built across beats:** the composition check looks at each beat's last frame, so a deliberately half-built frame (left side now, right side next beat) can trip "sits left". That's fine to accept if the next beat completes it.
- Long text: `bubble()` wraps at `max_width` automatically; for other text use `wrap(text, size, max_width)` to insert line breaks rather than letting `max_width` shrink it.

## Characters
- `Person(shirt=..., skin=0-4, hair="short|long|bun|curly|bald", hair_color=0-5, expression=..., height=...)`, `Bot(color=..., expression=..., height=...)`.
- `ch.express("happy")`, `ch.look(RIGHT)`, `ch.blink()`, `ch.nod()`, `ch.hop()` return animations. Face parts follow the character even when it moves in the same `play()`, as long as **express/look come after the movement** in the argument list: `self.play(ch.animate.shift(RIGHT*3), ch.express("happy"))`.
- Don't `set_color` a character; build a new one with the colour you need.

## Gotchas
- **Recolouring icons/documents:** pass the colour when creating (`icon("clock", "orange")`, `doc(accent="teal")`). `set_color`/`set_opacity` on a group floods every part, including ink details, and turns open strokes into filled blobs. To dim something, use `mob.animate.set_opacity(0.3)` only on simple shapes, or `FadeToColor` on a specific part, or fade a translucent `panel` over it.
- **Removing groups after per-member animations:** `LaggedStart`/`.animate` on members of a group registers each member in the scene, so `self.remove(group)` leaves them behind invisibly. Use `FadeOut(group)` then `self.clear_stage()` (which purges strays), or `self.remove(*group)`.
- **`VGroup.arrange()` re-centres the group on the origin.** Arrange first, then position (`place`, `next_to`, `move_to`), or pass `center=False` to keep existing alignment.
- **`ReplacementTransform` into a submobject of a container that isn't on stage yet** leaves the target invisible. Transform into a standalone copy, then swap in the real object with `self.remove(old); self.add(real)`.
- Private helpers (`_col` etc.) aren't exported by `from kurz import *`; use `C["teal"]` for colours.
- **Two `.animate` calls on the same object in one `play()`**: only the last applies. Chain them: `mob.animate.shift(UP).scale(1.2)`.
- **`Transform(a, b)` keeps `a`** (now shaped like b); keep referring to `a`. Use `ReplacementTransform` if you'll refer to `b` afterwards.
- **Updaters** (`float_idle`, `Counter`) keep running; `mob.clear_updaters()` before moving a floating object yourself.
- **Numbers:** `DecimalNumber`/`Integer`/`Tex`/`MathTex` need LaTeX, which isn't installed. Use `Counter(0, fmt="{:,.0f}%")` + `counter.count_to(87)` for animated numbers, `Text`/`label` for static ones, and unicode (×, ÷, →, ≈) for simple math.
- **Rich text:** `rich('Find the <span fgcolor="#2EE6C5">right pages</span>')`.
- **Random placement:** `np.random.default_rng(seed)` so re-renders match.
- **Z-order:** later-added draws on top; `set_z_index(n)` when something must sit above a later object.
- Frame is 14.22 × 8 units, origin centre. Content area constants: `CONTENT_LEFT/RIGHT/TOP/BOTTOM`, `CONTENT_CENTER`.

## Render workflow
- Iterate on one act at low quality: `$MANIM -ql scenes.py Engine`. Use `-s` for just the last frame.
- Final: `$MANIM -qh --disable_caching scenes.py Hook Concept Engine Takeaway` from the project dir with `EXPLAINER_DIR` set. Renders land at `media/videos/scenes/1080p30/<Scene>.mp4`.
- `KeyError: beat '…' not in timings.json` means the id doesn't match the storyboard or tts.py hasn't been run.

## Easing tokens and word sync
`EASE["enter"|"move"|"exit"]` (cubic-bezier curves) and `SPRING["smooth"|"snappy"|"bouncy"]` (mass/tension/friction physics) are rate_funcs: `self.play(card.animate(rate_func=EASE["move"]).shift(LEFT), run_time=0.5)`. Build your own with `cubic_bezier(x1, y1, x2, y2)` or `spring(mass, tension, friction)`. To land a visual on a spoken word, call `self.wait_until(b, "word")` inside the beat before the `play` (it waits until 0.1 s before the word; no-op if already past). `b.at("word", nth=2)` returns the time into the line.

## Keeping persistent elements through clears
`self.clear_stage(keep=[tracker, card])` fades everything else and keeps those (and the header unless `keep_header=False`). It handles the wrapper Groups that `self.play` registers around animated members, so pass the objects you built, not their parts. `-ql` renders a 480p15 preview into its own folder; `assemble.py` only uses 1080p renders and stops if a newer preview exists.
