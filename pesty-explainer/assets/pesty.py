"""pesty.py: the Pesty Marketing look for explainer videos, layered on the animated-explainer engine.

    import os, sys; sys.path.insert(0, os.environ["EXPLAINER_ASSETS"])
    from pesty import *

Everything from kurz.py is available (zones, place, characters, beats, QA, clear_stage). This module
re-skins it to the Pesty design system (pesty-design skill): white canvas, deep-teal ink, Pesty Red as
a spotlight, Epilogue headlines over Montserrat body, flat cards with hairline borders, quick motion
with no bounce, and the Pesty mark in the corner of every frame.

Pesty additions
  PestyScene         base class for every act (EYEBROW label above each header, mark top-right)
  stat()             oversized result number with a label: Pesty leads with real numbers
  StatCounter        animated stat that counts up (Epilogue)
  eyebrow()          small uppercase red label
  end_card()         closing frame: logo, one-line promise, CTA pill, URL
  logo(), mark()     brand assets as vector mobjects
  kinetic(), words_in()  kinetic-type statement (max 4 words a line) revealed word by word
  third()            rule-of-thirds anchor points for the focal element
  StepTracker        persistent numbered step row for an engine act, .activate(i) lights a step
  Motion tokens (from kurz): EASE enter/move/exit, SPRING smooth/snappy, STAGGER_GAP; sync a visual to a
  spoken word with self.wait_until(b, "word").
Colour roles (names kept compatible with kurz): red = the spotlight (key number, active step, the
answer, CTA); green = a win; amber = attention / the problem (fills only, never text); teal = deep-teal
structure (neutral containers, the default); blue = lighter slate teal for secondary things; muted = grey.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

AE_DIR = Path(os.environ.get("ANIMATED_EXPLAINER_DIR", str(Path(__file__).resolve().parents[2] / "animated-explainer")))
if not (AE_DIR / "assets/kurz.py").is_file():
    raise ImportError("pesty-explainer requires animated-explainer. Install both skills, or set ANIMATED_EXPLAINER_DIR to its installed directory.")
sys.path.insert(0, str(AE_DIR / "assets"))
import manimpango
missing_fonts = {"Epilogue", "Montserrat"} - set(manimpango.list_fonts())
if missing_fonts:
    raise ImportError("Missing Pesty video fonts: " + ", ".join(sorted(missing_fonts)) + ". Install them from Google Fonts before rendering.")
import kurz as _k  # noqa: E402
from kurz import *  # noqa: E402,F401,F403

ASSETS = Path(__file__).resolve().parent

# The eyebrow makes the Pesty header taller, so the content area starts a little lower than kurz's.
_k.CONTENT_TOP = CONTENT_TOP = FH / 2 - 1.5
_k.CONTENT_H = CONTENT_H = CONTENT_TOP - CONTENT_BOTTOM
_k.CONTENT_CENTER = CONTENT_CENTER = np.array([0, (CONTENT_TOP + CONTENT_BOTTOM) / 2, 0])
DISPLAY_FONT = "Epilogue"          # installed weights: Regular, Medium, Bold (no 800 on this machine)
_k.FONT = "Montserrat"

# --------------------------------------------------------------------------- tokens (pesty-design/tokens/colors.css)
_k.C.update({
    "bg_top": "#FFFFFF", "bg_bottom": "#FBFCFC",
    "surface": "#FFFFFF", "surface_hi": "#F6F8F9", "line": "#DDE3E6",
    "text": "#002330", "muted": "#6C7A82", "ink": "#002330",
    "paper": "#EDF0F2", "paper_line": "#C3CBD0",
    "red": "#D90429", "pink": "#D90429",            # Pesty Red: the spotlight
    "green": "#1F8A5B",                             # wins / positive metric
    "orange": "#E8A317", "yellow": "#E8A317",       # attention (fills only; text on it is ink)
    "teal": "#1E5160", "purple": "#356676",         # deep-teal structure
    "blue": "#4F8494",                              # slate teal, secondary
})
_k.C.update({"brand": _k.C["red"], "win": _k.C["green"], "amber": _k.C["orange"], "deep": "#002330", "slate": _k.C["blue"]})
C = _k.C
BORDER = "#DDE3E6"
SHADOW = "#002330"
# fills that need white text on top (everything else gets ink text)
_DARK_FILLS = {C["red"].upper(), C["green"].upper(), C["teal"].upper(), C["purple"].upper(), C["blue"].upper(), "#002330"}


def on(accent) -> str:
    """Text colour that reads on a solid fill of `accent`: white on red/green/teal, ink on amber or light."""
    return "#FFFFFF" if str(_k._col(accent)).upper() in _DARK_FILLS else C["ink"]


# --------------------------------------------------------------------------- type
def display(s: str, size: float = TYPE["h1"], color="text", max_width: float | None = None) -> Text:
    """Epilogue Bold: headlines, big statements, stat figures."""
    t = Text(s, font=DISPLAY_FONT, font_size=size, color=_k._col(color), weight=BOLD)
    if t.width > (max_width or CONTENT_W):
        t.scale_to_fit_width(max_width or CONTENT_W)
    return t


def h1(s, color="text", max_width=None):
    return display(s, TYPE["h1"], color, max_width)


def h2(s, color="text", max_width=None):
    return display(s, TYPE["h2"], color, max_width)


_k.h1, _k.h2 = h1, h2   # kurz's header()/titled helpers pick these up too


def eyebrow(s: str, color="red") -> Text:
    """Small uppercase label with wide tracking (the web system's eyebrow)."""
    t = MarkupText(f'<span letter_spacing="{int(19 * 0.08 * 1024)}">{s.upper()}</span>', font=DISPLAY_FONT,
                   font_size=19, color=_k._col(color), weight=BOLD)
    t.text = s.upper()  # MarkupText keeps markup in .text; QA messages read this
    return t


# --------------------------------------------------------------------------- containers (light-canvas versions)
def panel(width: float, height: float, accent: str | None = None, tinted: bool = False, radius: float = 0.3,
          fill: str | None = None) -> RoundedRectangle:
    """White card with a hairline border; accent swaps the border for an accent outline, tinted washes the fill."""
    f = _k._col(fill) if fill else (_k.tint(accent, 0.1) if (accent and tinted) else C["surface"])
    return RoundedRectangle(width=width, height=height, corner_radius=radius, fill_color=f, fill_opacity=1,
                            stroke_color=_k._col(accent) if accent else BORDER, stroke_width=4 if accent else 2.5)


_k.panel = panel  # card / titled_panel / step_chip in kurz build on this


def shadow(mob: Mobject, depth: float = 0.08) -> VGroup:
    """Soft ink-tinted drop shadow behind a card: VGroup(shadow, card). Use on hero cards, not everything."""
    layers = VGroup(*[RoundedRectangle(width=mob.width + 0.04 * i, height=mob.height + 0.04 * i, corner_radius=0.32,
                                       fill_color=SHADOW, fill_opacity=0.035, stroke_width=0)
                      .move_to(mob.get_center() + DOWN * depth * (1 + 0.3 * i)) for i in range(4)])
    return VGroup(layers, mob)


def pill(text: str, accent: str = "teal", filled: bool = True, size: float | None = None) -> VGroup:
    """Rounded tag. Filled = solid accent with readable text; outline = accent text on a light tint."""
    tc = on(accent) if filled else (C["ink"] if _k._col(accent) == C["orange"] else accent)
    t = label(text, tc, size=size)
    h = t.height + 0.32
    p = RoundedRectangle(width=t.width + 0.6, height=h, corner_radius=h / 2,
                         fill_color=_k._col(accent) if filled else _k.tint(accent, 0.1), fill_opacity=1,
                         stroke_color=_k._col(accent), stroke_width=0 if filled else 3)
    return VGroup(p, t.move_to(p))


def step_chip(n, text: str, accent: str = "red", width: float | None = None) -> VGroup:
    """Numbered step: solid accent disc + label in an outlined chip. VGroup(panel, disc_group, label)."""
    num = VGroup(Circle(radius=0.24, fill_color=_k._col(accent), fill_opacity=1, stroke_width=0), label(str(n), on(accent), size=26))
    num[1].move_to(num[0])
    t = label(text, "text", size=30)
    row = VGroup(num, t).arrange(RIGHT, buff=0.22)
    p = panel(max(width or 0, row.width + 0.6), row.height + 0.45, accent, radius=0.25).move_to(row)
    return VGroup(p, num, t)


def callout(text: str, accent: str = "red") -> VGroup:
    """Solid accent bar: the punchline of a scene."""
    t = label(text, on(accent), size=36)
    h = t.height + 0.4
    p = RoundedRectangle(width=t.width + 0.9, height=h, corner_radius=h / 2, fill_color=_k._col(accent),
                         fill_opacity=1, stroke_width=0)
    return VGroup(p, t.move_to(p))


def bubble(text: str, accent: str = "blue", tail: str = "left", max_width: float = 5.0, size: float = 26) -> VGroup:
    """Speech bubble with readable text on its fill, wrapped at max_width (never shrunk)."""
    t = Text(wrap(text, size, max_width), font=_k.FONT, font_size=size, color=on(accent), weight=BOLD, line_spacing=0.9)
    box = RoundedRectangle(width=t.width + 0.6, height=t.height + 0.4, corner_radius=0.22,
                           fill_color=_k._col(accent), fill_opacity=1, stroke_width=0).move_to(t)
    g = VGroup(box)
    if tail != "none":
        sx = -1 if tail == "left" else 1
        b = box.get_corner(DL if tail == "left" else DR) + np.array([-sx * 0.35, 0.02, 0])
        g.add(Polygon(b, b + np.array([-sx * 0.3, 0, 0]), b + np.array([sx * 0.05, -0.28, 0]),
                      fill_color=_k._col(accent), fill_opacity=1, stroke_width=0))
    g.add(t)
    return g


def stamp(text: str, accent: str = "red", angle: float = -0.15) -> VGroup:
    """Rotated outlined label slapped over something: 'WASTED', 'PAGE 2', 'NO CALLS'."""
    return _k.stamp(text, accent, angle)


# --------------------------------------------------------------------------- numbers
def stat(value: str, text: str, accent: str = "red", sub: str | None = None, size: float = 120) -> VGroup:
    """Oversized result figure over a short label (and optional muted sub-line): '329' / 'new recurring customers'.
    The single biggest thing in its frame. Only use numbers from sources.md."""
    parts = [display(value, size, accent), label(text, "text", size=30)]
    if sub:
        parts.append(caption(sub))
    return VGroup(*parts).arrange(DOWN, buff=0.16)


class StatCounter(VGroup):
    """Stat figure that counts up, in Epilogue. s = StatCounter(0, fmt='${:,.2f}', final=72.04);
    self.play(s.count_to(72.04)). VGroup(number, invisible_placeholder).

    `final` sizes the counter for the value it will reach: the group's width is the final width from the
    start, so card(counter) or a label placed next_to it never gets overrun as the digits grow. The number
    stays centred on the placeholder and follows any scale/place/move applied to the group."""

    def __init__(self, value: float = 0, fmt: str = "{:,.0f}", size: float = 120, color: str = "red",
                 final: float | None = None, **kw):
        super().__init__(**kw)
        self.tracker = ValueTracker(value)
        self.fmt, self.size, self.color_ = fmt, size, color
        ph = display(fmt.format(value if final is None else final), size, color).set_opacity(0)
        self._ph_h0 = ph.height
        num = display(fmt.format(value), size, color).move_to(ph)
        self.add(num, ph)
        self.add_updater(lambda m: m._refresh())

    def _refresh(self):
        ph = self.submobjects[1]
        new = display(self.fmt.format(self.tracker.get_value()), self.size, self.color_)
        new.scale(ph.height / self._ph_h0).move_to(ph)
        self.submobjects[0].become(new)

    def count_to(self, value: float, run_time: float = 1.0) -> Animation:
        return self.tracker.animate(run_time=run_time, rate_func=rate_functions.ease_out_cubic).set_value(value)


class StepTracker(VGroup):
    """A row of numbered step chips that stays on screen through a multi-beat engine act, with one step lit red.
    Fits the content width and sits just under the header. Keep it through clears with
    self.clear_stage(keep=[tracker]); lay the beat's content out below tracker.get_bottom().

        tracker = StepTracker(["Budget", "History", "Bidding"])
        self.play(stagger([rise_in(c) for c in tracker]))
        self.play(tracker.activate(0))        # lights step 1, dims whichever step was lit
    """

    def __init__(self, labels: list[str], size: float = 28, **kw):
        super().__init__(**kw)
        self.labels, self.size, self.active = labels, size, None
        chips = [self._chip(i, False) for i in range(len(labels))]
        w = max(c.width for c in chips)
        chips = [self._chip(i, False, w) for i in range(len(labels))]
        self.add(*chips)
        self.arrange(RIGHT, buff=0.3)
        if self.width > CONTENT_W:
            self.scale_to_fit_width(CONTENT_W)
        self.move_to([0, CONTENT_TOP - self.height / 2, 0])
        self._w = w

    def _chip(self, i: int, lit: bool, width: float | None = None) -> VGroup:
        accent = "red" if lit else "blue"
        num = VGroup(Circle(radius=0.22, fill_color=_k._col(accent), fill_opacity=1, stroke_width=0),
                     label(str(i + 1), on(accent), size=self.size - 4))
        num[1].move_to(num[0])
        t = label(self.labels[i], "text" if lit else "muted", size=self.size)
        row = VGroup(num, t).arrange(RIGHT, buff=0.18)
        p = panel(max(width or 0, row.width + 0.5), row.height + 0.38, "red" if lit else None,
                  tinted=lit, radius=0.22).move_to(row)
        return VGroup(p, num, t)

    def activate(self, i: int | None, run_time: float = 0.4) -> Animation:
        """Light step i (None to dim all). Returns the animation."""
        anims = []
        for j, chip in enumerate(self.submobjects):
            lit = j == i
            if lit or j == self.active:
                target = self._chip(j, lit, self._w)
                target.scale_to_fit_width(chip.width).move_to(chip)
                anims.append(Transform(chip, target))
        self.active = i
        return AnimationGroup(*anims, run_time=run_time) if anims else Wait(0.01)


# --------------------------------------------------------------------------- characters
class Bot(_k.Bot):
    """kurz Bot with a deep-teal screen and white face, so it reads on the white canvas."""

    def __init__(self, color: str = "blue", expression: str = "neutral", height: float = 2.4, **kw):
        super().__init__(color, expression, height, **kw)
        for m in self.submobjects:
            if m.get_fill_color().to_hex().upper() == C["bg_top"].upper() and m is not self.pupils:
                m.set_fill(C["deep"])
        self.eyes.set_fill("#FFFFFF")

    def _mouth_local(self, expr):
        return super()._mouth_local(expr).set_stroke("#FFFFFF").set_fill("#FFFFFF", opacity=1 if expr == "surprised" else 0)

    def _brows_local(self, expr):
        g = super()._brows_local(expr)
        return g.set_stroke("#FFFFFF", opacity=0 if expr in ("neutral", "happy", "surprised") else 1)

    def _pupils_local(self):
        return super()._pupils_local().set_fill(C["deep"])


# --------------------------------------------------------------------------- brand assets
def mark(height: float = 0.45, white: bool = False) -> SVGMobject:
    """The red Pesty bug mark (white version for use on a red or teal fill)."""
    return SVGMobject(str(ASSETS / "brand" / ("pesty-mark-white.svg" if white else "pesty-mark.svg"))).scale_to_fit_height(height)


def logo(width: float = 3.6, white: bool = False) -> SVGMobject:
    """Full lockup: red mark + deep-teal 'pesty' wordmark."""
    return SVGMobject(str(ASSETS / "brand" / ("pesty-logo-white.svg" if white else "pesty-logo.svg"))).scale_to_fit_width(width)


def end_card(promise: str, cta: str | None = "Book your strategy call", url: str = "pestymarketing.com") -> VGroup:
    """Closing frame: logo, one-line promise (Epilogue), red CTA pill (cta=None for none), URL.
    VGroup(logo, promise, cta_pill_or_empty, url), centred in the content area."""
    g = VGroup(logo(4.2), display(promise, 54, max_width=CONTENT_W * 0.85),
               pill(cta, "red", size=32) if cta else VGroup(), caption(url))
    VGroup(*[m for m in g if len(m.get_family()) > 1 or m.has_points()]).arrange(DOWN, buff=0.45)
    g[3].next_to(g[2] if cta else g[1], DOWN, buff=0.22 if cta else 0.35)
    return g.move_to(CONTENT_CENTER + UP * 0.35)


# --------------------------------------------------------------------------- motion: quick, confident, no bounce
# Easing: EASE["enter"] (expo-out) for things arriving, EASE["move"] for repositioning something already on
# screen, EASE["exit"] for things leaving. SPRING["smooth"] / ["snappy"] for physical moves; never
# SPRING["bouncy"] (Pesty doesn't bounce). Linear only for fades and colour changes.
def pop_in(mob: Mobject, run_time: float = 0.45, **kw) -> Animation:
    """Entrance for objects and characters: scale up from the centre, decelerating hard, no overshoot."""
    return GrowFromCenter(mob, run_time=run_time, rate_func=EASE["enter"], **kw)


def pop_out(mob: Mobject, run_time: float = 0.3) -> Animation:
    return ShrinkToCenter(mob, run_time=run_time, rate_func=EASE["exit"])


def rise_in(mob: Mobject, run_time: float = 0.5, distance: float = 0.25) -> Animation:
    """Fade in while sliding up a little: the default entrance for text and cards."""
    return FadeIn(mob, shift=UP * distance, run_time=run_time, rate_func=EASE["enter"])


def stagger(anims: list, gap: float = STAGGER_GAP, run_time: float | None = None, lag: float | None = None) -> Animation:
    """Start anims `gap` seconds apart (default 0.1 s, about 3 frames at 30 fps): never pop a group in all at
    once. With run_time, each anim is shortened so the whole group fits it while keeping the gap."""
    anims = list(anims)
    if not anims:
        return Wait(0.01)
    if lag is not None:   # kurz-style relative lag, kept for compatibility
        return LaggedStart(*anims, lag_ratio=lag, **({"run_time": run_time} if run_time else {}))
    n = len(anims)
    if run_time is not None:
        gap = min(gap, run_time / (2 * n))
        each = run_time - (n - 1) * gap
        for a in anims:
            a.run_time = each
    each = anims[0].run_time
    return LaggedStart(*anims, lag_ratio=min(1.0, gap / each))


_k.pop_in, _k.pop_out, _k.rise_in, _k.stagger = pop_in, pop_out, rise_in, stagger


def kinetic(text: str, size: float = TYPE["h1"], color="text", words_per_line: int = 4, red: str | None = None,
            line_gap: float = 0.12, max_width: float | None = None) -> VGroup:
    """Kinetic-type statement in Epilogue, broken at most `words_per_line` words per line (default 4).
    Returns VGroup(lines) where each line is VGroup(words), so words can animate one by one (words_in).
    `red`: one word or phrase to colour red (the spotlight), matched case-insensitively."""
    ws = text.split()
    n_lines = -(-len(ws) // words_per_line)
    per = -(-len(ws) // n_lines)            # balance the lines: 5 words -> 3 + 2, not 4 + 1
    rows = [ws[i:i + per] for i in range(0, len(ws), per)]
    hot = [w.lower().strip(".,!?") for w in (red or "").split()]
    lines = VGroup()
    for row in rows:
        t = display(" ".join(row), size, color, max_width=1e6)   # shrink the block as a whole below, not line by line
        chars, i, words = list(t.submobjects), 0, VGroup()
        if len(chars) != sum(len(w) for w in row):   # ligatures etc.: animate the line as one unit
            lines.add(VGroup(t))
            continue
        for w in row:
            n = len(w)
            word = VGroup(*chars[i:i + n])
            i += n
            if w.lower().strip(".,!?") in hot:
                word.set_color(_k._col("red"))
            words.add(word)
        lines.add(words)
    lines.arrange(DOWN, buff=line_gap, aligned_edge=LEFT)
    limit = max_width or CONTENT_W
    if lines.width > limit:          # never run past the safe zone; pick a smaller size if this shrinks a lot
        lines.scale_to_fit_width(limit)
    return lines


def words_in(k: VGroup, run_time: float | None = None, gap: float = STAGGER_GAP, distance: float = 0.3) -> Animation:
    """Reveal a kinetic() statement word by word: each word slides up into place and fades in."""
    words = [w for line in k for w in line]
    return stagger([FadeIn(w, shift=UP * distance, run_time=0.45, rate_func=EASE["enter"]) for w in words],
                   gap=gap, run_time=run_time)


def third(col: int, row: int) -> np.ndarray:
    """A rule-of-thirds intersection inside the content area: col 1|2 (left|right), row 1|2 (upper|lower).
    Put the frame's focal element (the stat, the hero card, the character's face) on one of these."""
    x = CONTENT_LEFT + CONTENT_W * col / 3
    y = CONTENT_TOP - CONTENT_H * row / 3
    return np.array([x, y, 0])


# --------------------------------------------------------------------------- background + header
def _wash_image(glow: str | None, px_per_unit: float = 108, pad: float = 1.2) -> np.ndarray:
    """RGB array a little larger than the frame: white with soft radial washes, finely dithered so the
    gradients never band (the dither doubles as a barely-there paper texture)."""
    W, H = FW + 2 * pad, FH + 2 * pad
    xs = np.linspace(-W / 2, W / 2, int(W * px_per_unit))
    ys = np.linspace(H / 2, -H / 2, int(H * px_per_unit))
    X, Y = np.meshgrid(xs, ys)
    img = np.ones(X.shape + (3,)) * 255.0

    def add(colour, cx, cy, radius, strength):
        d = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2) / radius
        k = strength * np.clip(1 - d, 0, 1) ** 2
        rgb = np.array(ManimColor(_k._col(colour)).to_rgb()) * 255
        img[:] = img * (1 - k[..., None]) + rgb * k[..., None]

    add("teal", -5.6, 3.3, 8.0, 0.10)
    if glow:
        add(glow, 6.3, -3.9, 7.0, 0.075)
    img += np.random.default_rng(7).uniform(-1.2, 1.2, X.shape)[..., None]
    return np.clip(img, 0, 255).astype(np.uint8)


def background(glow: str | None = "red", drift: bool = True) -> Group:
    """Near-white canvas, never flat: a soft deep-teal radial wash upper-left and a faint red one lower-right
    (the web hero's radial tint), drifting very slowly so the frame never sits dead still. Both washes are
    light enough that ink and red text keep full contrast."""
    im = ImageMobject(_wash_image(glow)).set_resampling_algorithm(RESAMPLING_ALGORITHMS["bilinear"])
    im.height = FH + 2.4
    if drift:
        state = {"t": 0.0}

        def upd(m, dt):
            state["t"] += dt
            a = 2 * np.pi * state["t"] / 28
            m.move_to(np.array([0.5 * np.cos(a), 0.3 * np.sin(a), 0]))
        im.add_updater(upd)
    g = Group(im)
    g.set_z_index(-100)
    return g


def header(text: str, accent: str = "red", label_text: str | None = None) -> VGroup:
    """Section header: Epilogue title (ink), short accent underline, optional red eyebrow above.
    VGroup(title, bar[, eyebrow])."""
    t = h2(text, max_width=CONTENT_W * 0.8)
    t.move_to([CONTENT_LEFT + t.width / 2, HEADER_Y - 0.3, 0])  # lower than kurz: room for the eyebrow
    bar = RoundedRectangle(width=0.6, height=0.07, corner_radius=0.035, fill_color=_k._col(accent), fill_opacity=1,
                           stroke_width=0).next_to(t, DOWN, buff=0.12, aligned_edge=LEFT)
    g = VGroup(t, bar)
    if label_text:
        g.add(eyebrow(label_text).next_to(t, UP, buff=0.1, aligned_edge=LEFT))
    return g


class PestyScene(ExplainerScene):
    """Base class for every act. Set EYEBROW to the video's topic label (shown above every header).

    class Hook(PestyScene):
        EYEBROW = "Local SEO"
        def construct(self):
            with self.beat("hook-1") as b:
                self.set_header("The phone stopped ringing", run_time=b.t(0.15))
    """

    EYEBROW: str | None = None
    GLOW = "red"

    def setup(self):
        super().setup()
        self.remove(self.bg)
        self.camera.background_color = C["bg_top"]
        self.bg = background(self.GLOW)
        m = mark().move_to([CONTENT_RIGHT - 0.25, HEADER_Y - 0.3, 0]).set_z_index(-90)
        self.bg.add(m)   # part of the background, so clear_stage never removes it
        self.add(self.bg)

    def set_header(self, text: str, accent: str = "red", run_time: float = 0.5):
        """Show or replace the section header (top-left), with the EYEBROW label above it."""
        new = header(text, accent, self.EYEBROW)
        anims = [FadeIn(new[0], shift=RIGHT * 0.2), GrowFromEdge(new[1], LEFT)]
        if len(new) > 2:
            anims.append(FadeIn(new[2]) if self._header is None or len(self._header) < 3 else Wait(0))
        if self._header is not None:
            anims.insert(0, FadeOut(VGroup(*self._header[:2]), shift=LEFT * 0.2))
        self.play(*anims, run_time=run_time)
        self._header_stale = None
        self.remove(*new, *(self._header or []))
        if self._header is not None and len(self._header) > 2 and len(new) > 2:
            new.submobjects[2] = self._header[2]   # keep the existing eyebrow instead of re-fading it
        self.add(new)
        self._header = new

    def end_card(self, promise: str, cta: str | None = "Book your strategy call", url: str = "pestymarketing.com",
                 run_time: float = 0.8) -> VGroup:
        """Clear everything (header included) and bring in the closing card."""
        self.clear_stage(run_time=run_time * 0.4, keep_header=False)
        card_ = end_card(promise, cta, url)
        anims = [FadeIn(card_[0], shift=UP * 0.2), rise_in(card_[1]), FadeIn(card_[3])]
        if len(card_[2]):
            anims.append(pop_in(card_[2]))
        self.play(*anims, run_time=run_time * 0.6)
        return card_
