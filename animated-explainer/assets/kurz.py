"""kurz.py: design system + narration-timing helpers for animated explainers.

    import os, sys; sys.path.insert(0, os.environ["EXPLAINER_ASSETS"])
    from kurz import *

The look is a polished flat motion-design style: one deep navy background for the whole video,
a consistent header and layout grid, content sitting in panels and cards, a clear type scale,
a restrained palette where each accent colour has one meaning, and crafted characters.
See assets/reference.png for every component rendered.

Contents
  Tokens      C (colours), TYPE (type scale), layout constants, zone(), place()
  Text        h1 h2 body label caption, rich(), wrap()
  Containers  panel card titled_panel pill step_chip callout stamp bubble
  Diagrams    arrow connector flow highlight doc Counter
  Characters  Person, Bot  (express, look, blink, nod, hop)
  Icons       icon(name)  small glyphs; draw the concept's key objects yourself
  Motion      pop_in pop_out rise_in stagger float_idle; EASE SPRING cubic_bezier spring; ExplainerScene.wait_until(b, word)
  Scene       ExplainerScene (beats synced to narration, set_header, QA checks, clear_stage)
"""
from __future__ import annotations

import json
import os
from contextlib import contextmanager
from pathlib import Path

import numpy as np
from manim import *  # noqa: F401,F403

# =========================================================================== config
# -qh (or -qm/-qp/-qk) renders the deliverable at 1920x1080/30; -ql renders a fast 854x480/15 preview into its
# own media/videos/**/480p15 folder, so a preview can never be mistaken for (or assembled as) the final.
if config.pixel_height < 720:
    config.pixel_width, config.pixel_height, config.frame_rate = 854, 480, 15
else:
    config.pixel_width, config.pixel_height, config.frame_rate = 1920, 1080, 30
FONT = "Avenir Next"

# =========================================================================== tokens
C = {
    # surfaces
    "bg_top": "#0B1130", "bg_bottom": "#1A1F4D",
    "surface": "#171D4A", "surface_hi": "#222A66", "line": "#2E3780",
    # text
    "text": "#F2F5FF", "muted": "#8D96C9", "ink": "#08122E",
    "paper": "#EEF2FF", "paper_line": "#B9C3EE",
    # accents: give each one meaning for the whole video (e.g. teal = good/solution, pink = problem)
    "teal": "#2EE6C5", "orange": "#FF8A3D", "pink": "#FF4F81", "yellow": "#FFD23F",
    "blue": "#5B9BFF", "purple": "#A77BFF", "green": "#7BD84B", "red": "#FF5A5A",
}
ACCENTS = ("teal", "orange", "pink", "yellow", "blue", "purple", "green", "red")
SKIN = ("#F5C6A5", "#E8AE86", "#C98B62", "#9C6644", "#6B4430")
HAIR = ("#2B1B12", "#5A3A22", "#B5763A", "#E8C26A", "#1C1C28", "#8E8E9E")

# type scale (font sizes at 1080p)
TYPE = {"h1": 72, "h2": 44, "body": 34, "label": 28, "caption": 22}

FW, FH = config.frame_width, config.frame_height        # 14.22 x 8
MARGIN = 0.75                                            # outer margin on every side
HEADER_Y = FH / 2 - 0.62                                 # row of section headers
CONTENT_TOP = FH / 2 - 1.35                              # content area below the header
CONTENT_BOTTOM = -FH / 2 + 0.75                          # keep the bottom clear for captions
CONTENT_LEFT, CONTENT_RIGHT = -FW / 2 + MARGIN, FW / 2 - MARGIN
CONTENT_W = CONTENT_RIGHT - CONTENT_LEFT
CONTENT_H = CONTENT_TOP - CONTENT_BOTTOM
CONTENT_CENTER = np.array([0, (CONTENT_TOP + CONTENT_BOTTOM) / 2, 0])

_ZONES = {  # name: (x centre as fraction of content width from the left, width fraction)
    "full": (0.5, 1.0), "left_half": (0.25, 0.48), "right_half": (0.75, 0.48),
    "left_third": (1 / 6, 0.31), "center_third": (0.5, 0.31), "right_third": (5 / 6, 0.31),
    "left_two_thirds": (1 / 3, 0.64), "right_two_thirds": (2 / 3, 0.64),
}


def zone(name: str) -> tuple[np.ndarray, float, float]:
    """Layout grid. Returns (centre point, width, height) of a content zone below the header.
    Zones: full, left_half, right_half, left_third, center_third, right_third, left_two_thirds, right_two_thirds."""
    fx, fw = _ZONES[name]
    return np.array([CONTENT_LEFT + fx * CONTENT_W, CONTENT_CENTER[1], 0]), fw * CONTENT_W, CONTENT_H


def place(mob: Mobject, zone_name: str, fit: bool = True, pad: float = 0.1, grow: float | None = None) -> Mobject:
    """Centre a mobject in a zone, shrinking it to fit if needed.
    grow=0.8 also enlarges it until it fills 80% of the zone (width or height, whichever binds first)."""
    centre, w, h = zone(zone_name)
    if grow:
        mob.scale(min(grow * w / mob.width, grow * h / mob.height))
    elif fit and (mob.width > w - 2 * pad or mob.height > h - 2 * pad):
        mob.scale(min((w - 2 * pad) / mob.width, (h - 2 * pad) / mob.height))
    return mob.move_to(centre)


def _col(c) -> str:
    return C.get(c, c) if isinstance(c, str) else c


def tint(accent: str, amount: float = 0.2) -> ManimColor:
    """Accent mixed into the panel surface: a coloured-but-quiet fill."""
    return interpolate_color(ManimColor(C["surface"]), ManimColor(_col(accent)), amount)


def _project_dir() -> Path:
    return Path(os.environ.get("EXPLAINER_DIR", os.getcwd()))


# =========================================================================== text
def _text(s: str, size: float, color, weight, max_width: float | None) -> Text:
    t = Text(s, font=FONT, font_size=size, color=_col(color), weight=weight)
    limit = max_width or CONTENT_W
    if t.width > limit:
        t.scale_to_fit_width(limit)
    return t


def h1(s, color="text", max_width=None):
    return _text(s, TYPE["h1"], color, HEAVY, max_width)


def h2(s, color="text", max_width=None):
    return _text(s, TYPE["h2"], color, BOLD, max_width)


def body(s, color="text", max_width=None):
    return _text(s, TYPE["body"], color, MEDIUM, max_width)


def label(s, color="text", max_width=None, size=None):
    return _text(s, size or TYPE["label"], color, BOLD, max_width)


def caption(s, color="muted", max_width=None):
    return _text(s, TYPE["caption"], color, MEDIUM, max_width)


def wrap(s: str, size: float = TYPE["label"], max_width: float = 5.0, weight=BOLD) -> str:
    """Insert line breaks so text fits max_width at its real size (instead of shrinking it)."""
    words, lines, cur = s.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if cur and Text(trial, font=FONT, font_size=size, weight=weight).width > max_width:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def rich(markup: str, size: float = TYPE["body"], max_width: float | None = None) -> MarkupText:
    """Mixed styling in one line: rich('Find the <span fgcolor="#2EE6C5">right pages</span>')."""
    t = MarkupText(markup, font=FONT, font_size=size, color=C["text"], weight=BOLD)
    if t.width > (max_width or CONTENT_W):
        t.scale_to_fit_width(max_width or CONTENT_W)
    return t


# =========================================================================== containers
def panel(width: float, height: float, accent: str | None = None, tinted: bool = False, radius: float = 0.32,
          fill: str | None = None) -> RoundedRectangle:
    """The basic surface everything sits on. accent adds a coloured outline; tinted washes the fill with it."""
    f = _col(fill) if fill else (tint(accent, 0.22) if (accent and tinted) else C["surface"])
    return RoundedRectangle(width=width, height=height, corner_radius=radius, fill_color=f, fill_opacity=1,
                            stroke_color=_col(accent) if accent else f, stroke_width=4 if accent else 0)


def card(content: Mobject, accent: str | None = None, tinted: bool = False, pad: float = 0.35,
         min_width: float = 0, radius: float = 0.3) -> VGroup:
    """Panel sized around content. card[0] is the panel, card[1] the content."""
    p = panel(max(content.width + 2 * pad, min_width), content.height + 2 * pad, accent, tinted, radius).move_to(content)
    return VGroup(p, content)


def titled_panel(title: str, content: Mobject | None = None, accent: str = "teal", width: float | None = None,
                 height: float | None = None, tinted: bool = False) -> VGroup:
    """Panel with a small coloured title at its top. Returns VGroup(panel, title[, content])."""
    t = label(title, accent)
    cw = content.width if content is not None else 0
    ch = content.height if content is not None else 0
    need_h = ch + t.height + 0.9  # never let content run into the title
    p = panel(max(width or 0, cw + 0.6, t.width + 0.8), max(height or 0, need_h), accent, tinted)
    t.move_to(p.get_top() + DOWN * (0.25 + t.height / 2))
    g = VGroup(p, t)
    if content is not None:
        content.move_to(p.get_center() + DOWN * (t.height / 2 + 0.1))
        g.add(content)
    return g


def pill(text: str, accent: str = "teal", filled: bool = True, size: float | None = None) -> VGroup:
    """Rounded tag. Filled = ink text on accent; outline = accent text on a tinted surface."""
    t = label(text, "ink" if filled else accent, size=size)
    h = t.height + 0.32
    p = RoundedRectangle(width=t.width + 0.55, height=h, corner_radius=h / 2,
                         fill_color=_col(accent) if filled else tint(accent, 0.18), fill_opacity=1,
                         stroke_color=_col(accent), stroke_width=0 if filled else 3)
    return VGroup(p, t.move_to(p))


def step_chip(n, text: str, accent: str = "teal", width: float | None = None) -> VGroup:
    """Numbered step: accent number disc + label in an outlined chip. VGroup(panel, disc_group, label)."""
    num = VGroup(Circle(radius=0.24, fill_color=_col(accent), fill_opacity=1, stroke_width=0), label(str(n), "ink", size=26))
    num[1].move_to(num[0])
    t = label(text, "text", size=30)
    row = VGroup(num, t).arrange(RIGHT, buff=0.22)
    p = panel(max(width or 0, row.width + 0.6), row.height + 0.45, accent, radius=0.25).move_to(row)  # never narrower than its text
    return VGroup(p, num, t)


def callout(text: str, accent: str = "teal") -> VGroup:
    """Solid accent bar with ink text: the punchline of a scene ('Open book = RAG')."""
    t = label(text, "ink", size=36)
    h = t.height + 0.4
    p = RoundedRectangle(width=t.width + 0.9, height=h, corner_radius=h / 2, fill_color=_col(accent),
                         fill_opacity=1, stroke_width=0)
    return VGroup(p, t.move_to(p))


def stamp(text: str, accent: str = "pink", angle: float = -0.15) -> VGroup:
    """Rotated outlined label slapped over something: 'MADE UP', 'OUTDATED', '2019'."""
    t = label(text, accent, size=40)
    p = RoundedRectangle(width=t.width + 0.6, height=t.height + 0.35, corner_radius=0.12,
                         fill_color=tint(accent, 0.12), fill_opacity=1, stroke_color=_col(accent), stroke_width=6)
    t.is_overlay = True  # deliberately sits on top of other things; skipped by the overlap check
    return VGroup(p, t.move_to(p)).rotate(angle)


def bubble(text: str, accent: str = "blue", tail: str = "left", max_width: float = 5.0, size: float = 26) -> VGroup:
    """Speech bubble: accent fill, ink text, wrapped onto lines at max_width (never shrunk).
    tail 'left'/'right' sits at that bottom corner; 'none' for no tail."""
    t = Text(wrap(text, size, max_width), font=FONT, font_size=size, color=C["ink"], weight=BOLD, line_spacing=0.9)
    box = RoundedRectangle(width=t.width + 0.6, height=t.height + 0.4, corner_radius=0.22,
                           fill_color=_col(accent), fill_opacity=1, stroke_width=0).move_to(t)
    g = VGroup(box)
    if tail != "none":
        sx = -1 if tail == "left" else 1
        b = box.get_corner(DL if tail == "left" else DR) + np.array([-sx * 0.35, 0.02, 0])
        g.add(Polygon(b, b + np.array([-sx * 0.3, 0, 0]), b + np.array([sx * 0.05, -0.28, 0]),
                      fill_color=_col(accent), fill_opacity=1, stroke_width=0))
    g.add(t)
    return g


# =========================================================================== diagram pieces
def arrow(start, end, color: str = "muted", buff: float = 0.18, stroke: float = 5) -> Arrow:
    """Clean arrow between points or mobjects (for mobjects the facing edges are picked automatically)."""
    if isinstance(start, Mobject) and isinstance(end, Mobject):
        d = end.get_center() - start.get_center()
        if abs(d[0]) >= abs(d[1]):
            s, e = (start.get_right(), end.get_left()) if d[0] > 0 else (start.get_left(), end.get_right())
        else:
            s, e = (start.get_top(), end.get_bottom()) if d[1] > 0 else (start.get_bottom(), end.get_top())
    else:
        s = start.get_center() if isinstance(start, Mobject) else np.array(start, dtype=float)
        e = end.get_center() if isinstance(end, Mobject) else np.array(end, dtype=float)
    buff = min(buff, np.linalg.norm(e - s) * 0.12)  # close objects still get a visible arrow
    return Arrow(s, e, buff=buff, color=_col(color), stroke_width=stroke, tip_length=0.2,
                 max_tip_length_to_length_ratio=0.3, max_stroke_width_to_length_ratio=10)


def connector(start: Mobject, end: Mobject, color: str = "muted", dashed: bool = True) -> VMobject:
    """Thin (dashed) line between two things: 'this came from that'."""
    s, e = start.get_center(), end.get_center()
    if dashed:
        return DashedLine(s, e, color=_col(color), stroke_width=3, dash_length=0.1)
    return Line(s, e, color=_col(color), stroke_width=3)


def flow(items: list, buff: float = 0.7, color: str = "muted", direction=RIGHT) -> VGroup:
    """Arrange items in a row (or column) with arrows between. Returns VGroup(items_group, arrows_group)."""
    row = VGroup(*items).arrange(direction, buff=buff)
    arrows = VGroup(*[arrow(a, b, color) for a, b in zip(items, items[1:])])
    return VGroup(row, arrows)


def highlight(mob: Mobject, accent: str = "yellow", buff: float = 0.15) -> SurroundingRectangle:
    """Rounded outline to draw attention: self.play(Create(highlight(x)))."""
    return SurroundingRectangle(mob, color=_col(accent), buff=buff, corner_radius=0.2, stroke_width=5)


def doc(title: str | None = None, accent: str = "blue", lines: int = 4, width: float = 1.3) -> VGroup:
    """Paper document: light page, accent header strip, grey text lines, optional caption below."""
    h = width * 1.3
    page = RoundedRectangle(width=width, height=h, corner_radius=0.1, fill_color=C["paper"], fill_opacity=1, stroke_width=0)
    strip = RoundedRectangle(width=width * 0.62, height=h * 0.07, corner_radius=0.03, fill_color=_col(accent),
                             fill_opacity=1, stroke_width=0)
    rows = VGroup(*[RoundedRectangle(width=width * (0.72 if i % 3 != 2 else 0.48), height=h * 0.045, corner_radius=0.02,
                                     fill_color=C["paper_line"], fill_opacity=1, stroke_width=0) for i in range(lines)])
    content = VGroup(strip, rows.arrange(DOWN, buff=h * 0.085, aligned_edge=LEFT)).arrange(DOWN, buff=h * 0.1, aligned_edge=LEFT)
    content.move_to(page).align_to(page, UP).shift(DOWN * h * 0.12)
    content.align_to(page, LEFT).shift(RIGHT * width * 0.14)
    g = VGroup(page, content)
    if title:
        g.add(caption(title, "text").next_to(page, DOWN, buff=0.15))
    return g


class Counter(VGroup):
    """Animated number without LaTeX. c = Counter(0, fmt='{:,.0f} messages'); self.play(c.count_to(47))."""

    def __init__(self, value: float = 0, fmt: str = "{:,.0f}", size: float = TYPE["h1"], color: str = "text", **kw):
        super().__init__(**kw)
        self.tracker = ValueTracker(value)
        self.fmt, self.size, self.color_ = fmt, size, color
        self.add(_text(fmt.format(value), size, color, HEAVY, None))
        self.add_updater(lambda m: m._refresh())

    def _refresh(self):
        new = _text(self.fmt.format(self.tracker.get_value()), self.size, self.color_, HEAVY, None)
        self.submobjects[0].become(new.move_to(self.submobjects[0].get_center()))

    def count_to(self, value: float, run_time: float = 1.0) -> Animation:
        return self.tracker.animate(run_time=run_time, rate_func=rate_functions.ease_out_cubic).set_value(value)


# =========================================================================== characters
class _Character(VGroup):
    """Shared machinery. Face parts are drawn in local coordinates and re-placed every frame, so
    express()/look()/blink() stay attached even while the character moves in the same play()."""

    EXPRESSIONS = ("neutral", "happy", "sad", "worried", "surprised", "angry", "thinking")
    LOOK_RANGE = 0.05

    def _init_anchor(self):
        self._o = Dot(ORIGIN, radius=0.001).set_opacity(0)
        self._u = Dot(RIGHT, radius=0.001).set_opacity(0)
        self.add(self._o, self._u)

    def _unit(self) -> float:
        return float(np.linalg.norm(self._u.get_center() - self._o.get_center()))

    def _to_world(self, m: Mobject) -> Mobject:
        return m.scale(self._unit(), about_point=ORIGIN).shift(self._o.get_center())

    def _to_local(self, m: Mobject) -> Mobject:
        return m.shift(-self._o.get_center()).scale(1 / self._unit(), about_point=ORIGIN)

    def _morph(self, part: Mobject, target_local: Mobject, run_time: float) -> Animation:
        state = {}

        def upd(m, a):
            if self._unit() < 1e-6:  # character still at zero size (e.g. mid pop_in); nothing to draw yet
                return
            if "s" not in state:  # capture when the animation starts, not when it is created
                s, e = self._to_local(m.copy()), target_local.copy()
                s.align_data(e)
                state["s"], state["e"] = s, e
            tmp = state["s"].copy()
            tmp.interpolate(state["s"], state["e"], a)
            m.become(self._to_world(tmp))

        return UpdateFromAlphaFunc(part, upd, run_time=run_time, rate_func=rate_functions.ease_in_out_sine)

    def express(self, expr: str, run_time: float = 0.35) -> Animation:
        """Change expression. When the same play() also moves the character, list express() after the move."""
        self.expression = expr
        return AnimationGroup(self._morph(self.mouth, self._mouth_local(expr), run_time),
                              self._morph(self.brows, self._brows_local(expr), run_time))

    def look(self, direction=ORIGIN, run_time: float = 0.3) -> Animation:
        """Shift pupils toward a direction (LEFT, UR, ...); ORIGIN looks straight ahead."""
        d = np.array(direction, dtype=float)
        n = np.linalg.norm(d)
        return self._morph(self.pupils, self._pupils_local().shift(d / n * self.LOOK_RANGE if n else ORIGIN), run_time)

    def blink(self, run_time: float = 0.25) -> Animation:
        state = {}

        def upd(m, a):
            if self._unit() < 1e-6:
                return
            if "base" not in state:
                state["base"] = self._to_local(m.copy())
            tmp = state["base"].copy()
            for sub in tmp:
                sub.stretch(1 - 0.9 * there_and_back(a), 1)
            m.become(self._to_world(tmp))

        return UpdateFromAlphaFunc(self.eyes, upd, run_time=run_time)

    def hop(self, height: float = 0.35, run_time: float = 0.45) -> Animation:
        return self.animate(rate_func=there_and_back, run_time=run_time).shift(UP * height)

    def nod(self, run_time: float = 0.5) -> Animation:
        return self.animate(rate_func=there_and_back, run_time=run_time).shift(DOWN * 0.1 * self._unit())


class Person(_Character):
    """A friendly human shown from the chest up (avatar style).

    p = Person(shirt="teal", skin=1, hair="short", hair_color=0, expression="worried", height=2.6)
    hair: short | long | bun | curly | bald.   skin / hair_color: index into SKIN / HAIR, or a hex colour.
    """

    LOOK_RANGE = 0.035

    def __init__(self, shirt: str = "teal", skin=1, hair: str = "short", hair_color=0,
                 expression: str = "neutral", height: float = 2.6, **kw):
        super().__init__(**kw)
        skin_c = SKIN[skin] if isinstance(skin, int) else skin
        hair_c = HAIR[hair_color] if isinstance(hair_color, int) else hair_color
        shirt_c = _col(shirt)
        dark = interpolate_color(ManimColor(shirt_c), BLACK, 0.25)

        def solid(m, c):
            return m.set_fill(c, opacity=1).set_stroke(width=0)

        torso = solid(RoundedRectangle(width=1.9, height=1.25, corner_radius=0.55), shirt_c).move_to(DOWN * 1.05)
        collar = solid(Polygon(LEFT * 0.26 + DOWN * 0.45, RIGHT * 0.26 + DOWN * 0.45, DOWN * 0.72), dark)
        neck = solid(RoundedRectangle(width=0.4, height=0.4, corner_radius=0.1), skin_c).move_to(DOWN * 0.4)
        head = solid(Circle(radius=0.62), skin_c).move_to(UP * 0.3)
        ears = VGroup(*[solid(Circle(radius=0.13), skin_c).move_to(UP * 0.25 + RIGHT * sx * 0.6) for sx in (-1, 1)])
        back_hair, front_hair = self._hair(hair, hair_c)
        cheeks = VGroup(*[Circle(radius=0.1, fill_color=C["pink"], fill_opacity=0.25, stroke_width=0)
                          .move_to(UP * 0.13 + RIGHT * sx * 0.37) for sx in (-1, 1)])
        self.eyes = VGroup(*[solid(Ellipse(width=0.13, height=0.17), C["ink"]).move_to(UP * 0.36 + RIGHT * sx * 0.22) for sx in (-1, 1)])
        self.pupils = self._pupils_local()
        self.mouth = self._mouth_local(expression)
        self.brows = self._brows_local(expression)
        self.add(back_hair, torso, collar, neck, ears, head, cheeks, front_hair, self.eyes, self.pupils, self.brows, self.mouth)
        self._init_anchor()
        self.expression = expression
        self.scale_to_fit_height(height)

    @staticmethod
    def _hair(style: str, c) -> tuple[VGroup, VGroup]:
        def cap():
            return Intersection(Circle(radius=0.67).move_to(UP * 0.36), Rectangle(width=1.6, height=0.7).move_to(UP * 0.86),
                                fill_color=c, fill_opacity=1, stroke_width=0)
        back, front = VGroup(), VGroup()
        if style == "short":
            front.add(cap())
        elif style == "long":
            back.add(RoundedRectangle(width=1.5, height=1.5, corner_radius=0.55, fill_color=c, fill_opacity=1, stroke_width=0).move_to(UP * 0.1))
            front.add(cap())
        elif style == "bun":
            back.add(Circle(radius=0.3, fill_color=c, fill_opacity=1, stroke_width=0).move_to(UP * 1.06))
            front.add(cap())
        elif style == "curly":
            front.add(VGroup(*[Circle(radius=0.19, fill_color=c, fill_opacity=1, stroke_width=0)
                               .move_to(UP * 0.36 + 0.63 * np.array([np.cos(a), np.sin(a), 0])) for a in np.linspace(0.2, PI - 0.2, 8)]), cap())
        return back, front

    def _mouth_local(self, expr: str) -> VMobject:
        shapes = {
            "neutral": Line(LEFT * 0.1, RIGHT * 0.1),
            "happy": ArcBetweenPoints(LEFT * 0.16, RIGHT * 0.16, angle=PI * 0.75),
            "sad": ArcBetweenPoints(LEFT * 0.13, RIGHT * 0.13, angle=-PI * 0.7),
            "worried": ArcBetweenPoints(LEFT * 0.11, RIGHT * 0.11, angle=-PI * 0.45),
            "surprised": Ellipse(width=0.13, height=0.17),
            "angry": ArcBetweenPoints(LEFT * 0.12, RIGHT * 0.12, angle=-PI * 0.3),
            "thinking": Line(LEFT * 0.09, RIGHT * 0.07).rotate(-0.25),
        }
        m = shapes.get(expr, shapes["neutral"]).copy().set_stroke(C["ink"], width=5)
        m.set_fill(C["ink"], opacity=1 if expr == "surprised" else 0)
        return m.move_to(DOWN * 0.03)

    def _brows_local(self, expr: str) -> VGroup:
        tilt = {"worried": 0.35, "sad": 0.3, "angry": -0.4, "thinking": 0.2}.get(expr, 0.0)
        lift = {"surprised": 0.07, "worried": 0.03, "happy": 0.02}.get(expr, 0.0)
        return VGroup(*[Line(LEFT * 0.09, RIGHT * 0.09).rotate(-sx * tilt).move_to(UP * (0.56 + lift) + RIGHT * sx * 0.22)
                        for sx in (-1, 1)]).set_stroke(C["ink"], width=5)

    def _pupils_local(self) -> VGroup:
        return VGroup(*[Circle(radius=0.025, fill_color=WHITE, fill_opacity=0.9, stroke_width=0)
                        .move_to(UP * 0.39 + RIGHT * (sx * 0.22 + 0.025)) for sx in (-1, 1)])


class Bot(_Character):
    """A friendly AI / robot: coloured head with a dark screen face, antenna, small body.

    b = Bot(color="teal", expression="happy", height=2.4)
    """

    LOOK_RANGE = 0.06

    def __init__(self, color: str = "teal", expression: str = "neutral", height: float = 2.4, **kw):
        super().__init__(**kw)
        c = _col(color)
        dark = interpolate_color(ManimColor(c), BLACK, 0.3)

        def solid(m, col):
            return m.set_fill(col, opacity=1).set_stroke(width=0)

        body_ = solid(RoundedRectangle(width=1.0, height=0.6, corner_radius=0.18), c).move_to(DOWN * 1.02)
        neck = solid(Rectangle(width=0.3, height=0.2), dark).move_to(DOWN * 0.66)
        head = solid(RoundedRectangle(width=1.6, height=1.15, corner_radius=0.32), c)
        screen = solid(RoundedRectangle(width=1.24, height=0.78, corner_radius=0.22), C["bg_top"])
        stalk = Line(UP * 0.575, UP * 0.88, stroke_color=dark, stroke_width=6)
        ball = solid(Circle(radius=0.09), C["yellow"]).move_to(UP * 0.94)
        ears = VGroup(*[solid(RoundedRectangle(width=0.14, height=0.4, corner_radius=0.06), dark).move_to(RIGHT * sx * 0.85) for sx in (-1, 1)])
        self.eyes = VGroup(*[solid(RoundedRectangle(width=0.2, height=0.24, corner_radius=0.09), C["text"])
                             .move_to(UP * 0.08 + RIGHT * sx * 0.27) for sx in (-1, 1)])
        self.pupils = self._pupils_local()
        self.mouth = self._mouth_local(expression)
        self.brows = self._brows_local(expression)
        self.add(stalk, ball, ears, neck, body_, head, screen, self.eyes, self.pupils, self.brows, self.mouth)
        self._init_anchor()
        self.expression = expression
        self.scale_to_fit_height(height)

    def _mouth_local(self, expr: str) -> VMobject:
        shapes = {
            "neutral": Line(LEFT * 0.12, RIGHT * 0.12),
            "happy": ArcBetweenPoints(LEFT * 0.17, RIGHT * 0.17, angle=PI * 0.7),
            "sad": ArcBetweenPoints(LEFT * 0.14, RIGHT * 0.14, angle=-PI * 0.7),
            "worried": ArcBetweenPoints(LEFT * 0.12, RIGHT * 0.12, angle=-PI * 0.45),
            "surprised": Ellipse(width=0.14, height=0.16),
            "angry": ArcBetweenPoints(LEFT * 0.13, RIGHT * 0.13, angle=-PI * 0.3),
            "thinking": Line(LEFT * 0.1, RIGHT * 0.08).rotate(-0.25),
        }
        m = shapes.get(expr, shapes["neutral"]).copy().set_stroke(C["text"], width=5)
        m.set_fill(C["text"], opacity=1 if expr == "surprised" else 0)
        return m.move_to(DOWN * 0.2)

    def _brows_local(self, expr: str) -> VGroup:
        tilt = {"worried": 0.35, "sad": 0.3, "angry": -0.4, "thinking": 0.25}.get(expr, 0.0)
        g = VGroup(*[Line(LEFT * 0.1, RIGHT * 0.1).rotate(-sx * tilt).move_to(UP * 0.29 + RIGHT * sx * 0.27)
                     for sx in (-1, 1)]).set_stroke(C["text"], width=4)
        if expr in ("neutral", "happy", "surprised"):
            g.set_stroke(opacity=0)
        return g

    def _pupils_local(self) -> VGroup:
        return VGroup(*[Circle(radius=0.05, fill_color=C["bg_top"], fill_opacity=1, stroke_width=0)
                        .move_to(UP * 0.06 + RIGHT * sx * 0.27) for sx in (-1, 1)])


# =========================================================================== icons (small glyphs)
def icon(name: str, color: str = "yellow", size: float = 1.0) -> VGroup:
    """Small flat glyph for supporting details. Draw the concept's key objects yourself.
    Names: search bulb gear chat check cross clock target person star warning lock chart signal noise
    funnel book database folder mail calendar.  Pass the colour here rather than recolouring afterwards."""
    col = _col(color)
    ink = C["ink"]

    def fill(m, c=col, o=1.0):
        return m.set_fill(c, opacity=o).set_stroke(width=0)

    if name == "search":
        g = VGroup(Circle(radius=0.3).set_stroke(col, 11).shift(UL * 0.1), Line(ORIGIN, DR * 0.32).set_stroke(col, 13).shift(DR * 0.25))
    elif name == "bulb":
        g = VGroup(VGroup(*[Line(UP * 0.55, UP * 0.68).rotate(a, about_point=UP * 0.12) for a in np.linspace(-1, 1, 5)]).set_stroke(col, 5),
                   fill(Circle(radius=0.36)).shift(UP * 0.12),
                   fill(RoundedRectangle(width=0.3, height=0.22, corner_radius=0.05), C["muted"]).shift(DOWN * 0.34))
    elif name == "gear":
        g = VGroup(VGroup(*[fill(RoundedRectangle(width=0.2, height=0.2, corner_radius=0.04)).shift(UP * 0.4).rotate(a, about_point=ORIGIN)
                            for a in np.arange(0, TAU, TAU / 8)]),
                   fill(Circle(radius=0.36)), Circle(radius=0.13).set_fill(C["surface"], 1).set_stroke(width=0))
    elif name == "chat":
        g = VGroup(fill(RoundedRectangle(width=1.0, height=0.68, corner_radius=0.2)),
                   fill(Polygon(LEFT * 0.3 + DOWN * 0.3, LEFT * 0.08 + DOWN * 0.3, LEFT * 0.38 + DOWN * 0.52)),
                   VGroup(*[Dot(RIGHT * x, radius=0.06, color=ink) for x in (-0.22, 0, 0.22)]))
    elif name == "check":
        g = VGroup(fill(Circle(radius=0.5), col if color != "yellow" else C.get("win", C["teal"])),
                   VMobject().set_points_as_corners([LEFT * 0.22, DOWN * 0.17 + LEFT * 0.03, UR * 0.24]).set_stroke(ink, 10))
    elif name == "cross":
        g = VGroup(fill(Circle(radius=0.5), col if color != "yellow" else C["pink"]), Line(UL * 0.19, DR * 0.19).set_stroke(ink, 10), Line(UR * 0.19, DL * 0.19).set_stroke(ink, 10))
    elif name == "clock":
        g = VGroup(fill(Circle(radius=0.5)), Circle(radius=0.4).set_fill(C["paper"], 1).set_stroke(width=0),
                   Line(ORIGIN, UP * 0.26).set_stroke(ink, 6), Line(ORIGIN, RIGHT * 0.18).set_stroke(ink, 6))
    elif name == "target":
        g = VGroup(*[fill(Circle(radius=r), col if i % 2 == 0 else C["paper"]) for i, r in enumerate((0.5, 0.36, 0.22, 0.09))])
    elif name == "person":
        g = VGroup(fill(Circle(radius=0.2)).shift(UP * 0.26), fill(ArcBetweenPoints(RIGHT * 0.34, LEFT * 0.34, angle=PI).close_path()).shift(DOWN * 0.26))
    elif name == "star":
        g = VGroup(fill(Star(5, outer_radius=0.5, inner_radius=0.22)))
    elif name == "warning":
        g = VGroup(fill(Triangle().scale(0.6), C["yellow"]), Line(UP * 0.12, DOWN * 0.08).set_stroke(ink, 8).shift(DOWN * 0.05),
                   Dot(DOWN * 0.26, radius=0.05, color=ink))
    elif name == "lock":
        g = VGroup(Arc(radius=0.2, start_angle=0, angle=PI).set_stroke(C["muted"], 9).shift(UP * 0.14),
                   fill(RoundedRectangle(width=0.66, height=0.52, corner_radius=0.1)).shift(DOWN * 0.14))
    elif name == "chart":
        g = VGroup(VGroup(*[fill(RoundedRectangle(width=0.18, height=h, corner_radius=0.04)).move_to(RIGHT * x + DOWN * 0.38, aligned_edge=DOWN)
                            for x, h in ((-0.28, 0.3), (0, 0.55), (0.28, 0.8))]),
                   Line(LEFT * 0.46 + DOWN * 0.4, RIGHT * 0.46 + DOWN * 0.4).set_stroke(C["muted"], 4))
    elif name in ("signal", "noise"):
        if name == "signal":
            wave = FunctionGraph(lambda x: 0.25 * np.sin(2.5 * TAU * x), x_range=[-1, 1, 0.01]).set_stroke(col, 8)
        else:
            rng = np.random.default_rng(3)
            wave = VMobject().set_points_as_corners([np.array([x, rng.uniform(-0.3, 0.3), 0]) for x in np.linspace(-1, 1, 40)]).set_stroke(C["muted"], 5)
        return VGroup(wave).scale_to_fit_width(size * 2)
    elif name == "funnel":
        g = VGroup(fill(Polygon(LEFT * 0.5 + UP * 0.4, RIGHT * 0.5 + UP * 0.4, RIGHT * 0.1 + DOWN * 0.1, LEFT * 0.1 + DOWN * 0.1)),
                   fill(RoundedRectangle(width=0.2, height=0.32, corner_radius=0.04)).shift(DOWN * 0.26))
    elif name == "book":
        def page(sx):
            return fill(Polygon(DOWN * 0.32, sx * RIGHT * 0.5 + DOWN * 0.24, sx * RIGHT * 0.5 + UP * 0.34, UP * 0.26), C["paper"])
        lines_ = VGroup(*[Line(sx * RIGHT * 0.1 + UP * (0.15 - i * 0.13), sx * RIGHT * 0.4 + UP * (0.19 - i * 0.13))
                          for sx in (-1, 1) for i in range(3)]).set_stroke(C["paper_line"], 4)
        g = VGroup(fill(Polygon(DOWN * 0.4, RIGHT * 0.56 + DOWN * 0.3, RIGHT * 0.56 + UP * 0.28, LEFT * 0.56 + UP * 0.28, LEFT * 0.56 + DOWN * 0.3)),
                   page(-1), page(1), lines_)
    elif name == "database":
        g = VGroup()
        for i in range(3):
            y = 0.3 - i * 0.3
            g.add(fill(Rectangle(width=1.0, height=0.3), interpolate_color(ManimColor(col), BLACK, 0.25)).shift(UP * (y - 0.15)),
                  fill(Ellipse(width=1.0, height=0.3)).shift(UP * y).set_stroke(interpolate_color(ManimColor(col), BLACK, 0.35), 3))
    elif name == "folder":
        g = VGroup(fill(RoundedRectangle(width=0.45, height=0.3, corner_radius=0.06)).shift(UP * 0.28 + LEFT * 0.25),
                   fill(RoundedRectangle(width=1.0, height=0.7, corner_radius=0.08)))
    elif name == "mail":
        g = VGroup(fill(RoundedRectangle(width=1.0, height=0.66, corner_radius=0.08)),
                   VMobject().set_points_as_corners([LEFT * 0.46 + UP * 0.28, DOWN * 0.05, RIGHT * 0.46 + UP * 0.28]).set_stroke(ink, 5))
    elif name == "calendar":
        g = VGroup(fill(RoundedRectangle(width=0.9, height=0.85, corner_radius=0.1), C["paper"]),
                   fill(RoundedRectangle(width=0.9, height=0.25, corner_radius=0.1)).shift(UP * 0.3),
                   VGroup(*[Square(0.12).set_fill(C["paper_line"], 1).set_stroke(width=0).move_to(RIGHT * (x * 0.2) + DOWN * (y * 0.2))
                            for x in (-1, 0, 1) for y in (0, 1)]).shift(DOWN * 0.02))
    else:
        raise ValueError(f"unknown icon '{name}'")
    return g.scale_to_fit_height(size)


# =========================================================================== motion
def cubic_bezier(x1: float, y1: float, x2: float, y2: float):
    """A rate_func from CSS cubic-bezier control points, e.g. cubic_bezier(0.16, 1, 0.3, 1)."""
    def bez(t, a, b):
        return 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3

    def rate(x: float) -> float:
        if x <= 0 or x >= 1:
            return float(min(max(x, 0), 1))
        lo, hi = 0.0, 1.0
        for _ in range(30):  # bisection on x(t): monotonic for valid curves
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if bez(mid, x1, x2) < x else (lo, mid)
        return bez((lo + hi) / 2, y1, y2)
    return rate


def spring(mass: float = 1.0, tension: float = 140, friction: float = 26, settle: float = 0.001):
    """A rate_func from damped-spring physics (react-spring style mass/tension/friction).
    The animation's run_time is stretched over the time the spring takes to settle."""
    w0 = np.sqrt(tension / mass)
    zeta = friction / (2 * np.sqrt(tension * mass))

    def pos(t):
        if zeta < 1:
            wd = w0 * np.sqrt(1 - zeta ** 2)
            return 1 - np.exp(-zeta * w0 * t) * (np.cos(wd * t) + zeta * w0 / wd * np.sin(wd * t))
        if zeta == 1:
            return 1 - np.exp(-w0 * t) * (1 + w0 * t)
        r1, r2 = -w0 * (zeta - np.sqrt(zeta ** 2 - 1)), -w0 * (zeta + np.sqrt(zeta ** 2 - 1))
        return 1 - (r2 * np.exp(r1 * t) - r1 * np.exp(r2 * t)) / (r2 - r1)

    ts = np.linspace(0, 10, 4000)
    err = np.abs(1 - np.array([pos(t) for t in ts]))
    above = np.nonzero(err > settle)[0]
    T = ts[min(above[-1] + 1, len(ts) - 1)] if len(above) else ts[1]
    return lambda x: float(pos(x * T)) if x < 1 else 1.0


# Easing tokens: enter decelerates hard (expo-out), move accelerates then decelerates (Uber Base quintic
# in-out), exit accelerates away (quintic in). Never linear for anything that moves; linear is for fades only.
EASE = {
    "enter": cubic_bezier(0.16, 1, 0.3, 1),
    "move": cubic_bezier(0.83, 0, 0.17, 1),
    "exit": cubic_bezier(0.64, 0, 0.78, 0),
}
SPRING = {  # physics presets: bouncy overshoots ~20% (playful), smooth never overshoots, snappy is quick and tight
    "bouncy": spring(1, 180, 12),
    "smooth": spring(1, 140, 26),
    "snappy": spring(0.5, 210, 20),
}
STAGGER_GAP = 0.1  # seconds between the starts of elements entering together


def pop_in(mob: Mobject, run_time: float = 0.55, **kw) -> Animation:
    """Entrance for objects: scale up with a soft overshoot."""
    return GrowFromCenter(mob, run_time=run_time, rate_func=rate_functions.ease_out_back, **kw)


def pop_out(mob: Mobject, run_time: float = 0.35) -> Animation:
    return ShrinkToCenter(mob, run_time=run_time, rate_func=rate_functions.ease_in_back)


def rise_in(mob: Mobject, run_time: float = 0.5, distance: float = 0.25) -> Animation:
    """Entrance for text and panels: fade in while drifting up."""
    return FadeIn(mob, shift=UP * distance, run_time=run_time, rate_func=rate_functions.ease_out_cubic)


def stagger(anims: list, lag: float = 0.12, run_time: float | None = None) -> Animation:
    """Entrances one after another with overlap (cards appearing in sequence)."""
    return LaggedStart(*anims, lag_ratio=lag, **({"run_time": run_time} if run_time else {}))


def float_idle(mob: Mobject, amplitude: float = 0.05, period: float = 3.0) -> Mobject:
    """Gentle bob so a held element isn't frozen. Remove with mob.clear_updaters() before moving it."""
    state = {"t": 0.0, "base": mob.get_center().copy()}

    def upd(m, dt):
        state["t"] += dt
        m.move_to(state["base"] + UP * amplitude * np.sin(2 * np.pi * state["t"] / period))

    return mob.add_updater(upd)


# =========================================================================== background + header
def background(glow: str | None = "blue") -> VGroup:
    """The one background for the whole video: deep navy gradient with a faint corner glow."""
    rect = Rectangle(width=FW + 0.2, height=FH + 0.2, stroke_width=0)
    rect.set_fill(color=[C["bg_bottom"], C["bg_top"]], opacity=1).set_sheen_direction(UP)
    g = VGroup(rect)
    if glow:
        for r in np.linspace(6.5, 0.8, 14):  # many faint layers read as a smooth glow, not rings
            o = 0.012
            g.add(Circle(radius=r, fill_color=_col(glow), fill_opacity=o, stroke_width=0).move_to(RIGHT * 5.5 + DOWN * 3.6))
    g.set_z_index(-100)
    return g


def header(text: str, accent: str = "teal") -> VGroup:
    """Section header: top-left title with a short accent underline."""
    t = h2(text, max_width=CONTENT_W * 0.8)
    t.move_to([CONTENT_LEFT + t.width / 2, HEADER_Y, 0])
    bar = RoundedRectangle(width=0.6, height=0.07, corner_radius=0.035, fill_color=_col(accent), fill_opacity=1,
                           stroke_width=0).next_to(t, DOWN, buff=0.12, aligned_edge=LEFT)
    return VGroup(t, bar)


# =========================================================================== scene base
class _Beat:
    def __init__(self, beat_id: str, duration: float, start: float, words: list | None = None):
        self.id, self.duration, self.start, self.words = beat_id, duration, start, words or []

    def t(self, fraction: float) -> float:
        """A run_time that is `fraction` of this beat's narration."""
        return max(0.1, self.duration * fraction)

    def at(self, word: str, nth: int = 1, end: bool = False) -> float:
        """Seconds into the line where `word` starts (or ends) as spoken: case and punctuation ignored,
        `nth` picks a repeat. Use with ExplainerScene.wait_until to land a visual on the word."""
        norm = lambda w: "".join(ch for ch in w.lower() if ch.isalnum())
        target, seen = norm(word), 0
        for w in self.words:
            # "twenty" matches the spoken "twenty-eight"; "twenty-eight" matches it too
            if target == norm(w["w"]) or target in [norm(x) for x in w["w"].split("-")]:
                seen += 1
                if seen == nth:
                    return float(w["end" if end else "start"])
        raise KeyError(f"'{word}' (#{nth}) not spoken in beat '{self.id}': {' '.join(w['w'] for w in self.words)}")


class ExplainerScene(Scene):
    """Base class for every act.

    class Hook(ExplainerScene):
        def construct(self):
            with self.beat("hook-1") as b:
                self.set_header("The problem", "pink", run_time=b.t(0.15))
                self.play(pop_in(maya), run_time=b.t(0.3))
    """

    GLOW = "blue"      # faint glow colour in the background corner (None to disable)
    BEAT_GAP = 0.25    # breathing room after each line of narration

    def setup(self):
        self.camera.background_color = C["bg_top"]
        self.bg = background(self.GLOW)
        self.add(self.bg)
        self._header = None
        self._header_stale = None   # beat id of a clear_stage that kept the header
        self._current_beat = None
        tpath = _project_dir() / "timings.json"
        self._timings = json.loads(tpath.read_text())["beats"] if tpath.exists() else {}
        self._beatlog: list[dict] = []
        self._qa: list[dict] = []

    def _now(self) -> float:
        return float(self.renderer.time)

    @contextmanager
    def beat(self, beat_id: str):
        info = self._timings.get(beat_id)
        if info is None:
            raise KeyError(f"beat '{beat_id}' not in timings.json - run tts.py first or fix the id")
        start = self._now()
        self.add_sound(str(_project_dir() / info["audio"]))
        b = _Beat(beat_id, float(info["duration"]), start, info.get("words"))
        self._current_beat = beat_id
        yield b
        elapsed = self._now() - start
        if elapsed > b.duration * 0.9:
            over = elapsed - b.duration
            self._qa.append({"beat": beat_id, "issue": f"animations ran {over:.1f}s past the narration" if over > 0
                             else "animations fill >90% of the line, so the finished frame barely holds"})
        target = b.duration + self.BEAT_GAP
        if elapsed < target:
            self.wait(target - elapsed)
        self._check_layout(beat_id)
        if self._header_stale and self._header_stale != beat_id and self._header is not None:
            self._qa.append({"beat": beat_id, "issue": f"header '{getattr(self._header[0], 'original_text', self._header[0].text)}' kept through clear_stage at "
                             f"{self._header_stale}; check it still names what's on screen (or pass header= to clear_stage)"})
            self._header_stale = None
        self._beatlog.append({"id": beat_id, "start": start, "end": self._now()})

    def wait_until(self, b: "_Beat", word: str, nth: int = 1, lead: float = 0.1):
        """Wait until just before `word` is spoken in this beat (lead seconds early, so motion lands on it).
        No-op if that moment has already passed."""
        try:
            t = b.at(word, nth)
        except KeyError as e:  # don't kill a long render over a word mismatch: log it and carry on
            self._qa.append({"beat": b.id, "issue": f"wait_until skipped: {e.args[0]}"})
            return
        gap = b.start + t - lead - self._now()
        if gap > 1 / 60:
            self.wait(gap)

    def set_header(self, text: str, accent: str = "teal", run_time: float = 0.5):
        """Show or replace the section header (top-left)."""
        new = header(text, accent)
        anims = [FadeIn(new[0], shift=RIGHT * 0.2), GrowFromEdge(new[1], LEFT)]
        if self._header is not None:
            anims.insert(0, FadeOut(self._header, shift=LEFT * 0.2))
        self.play(*anims, run_time=run_time)
        self._header_stale = None
        self.remove(new[0], new[1])  # the entrance animations register the parts separately;
        self.add(new)                # re-add as one group so clear_stage can keep it
        self._header = new

    # QA ------------------------------------------------------------------------
    @staticmethod
    def _describe(m: Mobject) -> str:
        texts = [getattr(s, "original_text", s.text) for s in m.get_family() if isinstance(s, (Text, MarkupText)) and getattr(s, "text", "")]
        c = m.get_center()
        return (type(m).__name__ + (f" containing '{texts[0][:25]}'" if texts else "")
                + f" at ({c[0]:.1f}, {c[1]:.1f}) size {m.width:.1f}x{m.height:.1f}")

    def _check_layout(self, beat_id: str):
        hw, hh = FW / 2, FH / 2
        texts = []
        for m in self.mobjects:
            if m is self.bg or m.width < 0.01:
                continue
            visible = any(s.get_fill_opacity() > 0.05 or s.get_stroke_opacity() > 0.05 for s in m.get_family() if isinstance(s, VMobject) and s.has_points())
            if not visible:
                continue
            if (m.get_left()[0] < -hw + 0.2 or m.get_right()[0] > hw - 0.2 or m.get_bottom()[1] < -hh + 0.2
                    or m.get_top()[1] > hh - 0.2) and not getattr(m, "allow_offscreen", False):
                self._qa.append({"beat": beat_id, "issue": f"touches or leaves the frame edge: {self._describe(m)}"})
            texts += [s for s in m.get_family() if isinstance(s, (Text, MarkupText)) and s.get_fill_opacity() > 0.05]
        self._check_composition(beat_id)
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                a, b = texts[i], texts[j]
                if getattr(a, "is_overlay", False) or getattr(b, "is_overlay", False):
                    continue
                if (abs(a.get_center()[0] - b.get_center()[0]) * 2 < a.width + b.width - 0.05
                        and abs(a.get_center()[1] - b.get_center()[1]) * 2 < a.height + b.height - 0.05):
                    self._qa.append({"beat": beat_id, "issue": f"text overlap: '{getattr(a, 'original_text', a.text)[:30]}' / '{getattr(b, 'original_text', b.text)[:30]}'"})

    def _check_composition(self, beat_id: str):
        """Flag frames whose content is small or lopsided (the commonest 'looks unfinished' problem)."""
        skip = [self.bg] + ([self._header] if self._header is not None else [])
        content = [m for m in self.mobjects if all(m is not k for k in skip) and m.width > 0.05
                   and any(s.get_fill_opacity() > 0.05 or s.get_stroke_opacity() > 0.05
                           for s in m.get_family() if isinstance(s, VMobject) and s.has_points())]
        if not content:
            return
        box = Group(*content)  # Group, not VGroup: LaggedStart can leave plain Groups in the scene
        cover_w, cover_h = box.width / CONTENT_W, box.height / CONTENT_H
        dx, dy = box.get_center()[0] - CONTENT_CENTER[0], box.get_center()[1] - CONTENT_CENTER[1]
        if max(cover_w, cover_h) < 0.55:
            self._qa.append({"beat": beat_id, "issue": f"composition: content spans only {cover_w:.0%} of the width and "
                             f"{cover_h:.0%} of the height; scale up or use more of the grid"})
        if abs(dx) > 1.6 or abs(dy) > 0.9:
            side = ("left" if dx < 0 else "right") if abs(dx) > 1.6 else ""
            vert = ("low" if dy < 0 else "high") if abs(dy) > 0.9 else ""
            self._qa.append({"beat": beat_id, "issue": f"composition: content sits {vert} {side} (centre off by "
                             f"{dx:+.1f}, {dy:+.1f}); balance it in the content area".replace("  ", " ")})

    def tear_down(self):
        out = _project_dir() / "build"
        out.mkdir(exist_ok=True)
        name = type(self).__name__
        (out / f"beatlog_{name}.json").write_text(json.dumps({"scene": name, "beats": self._beatlog, "total": self._now()}, indent=2))
        (out / f"qa_{name}.json").write_text(json.dumps(self._qa, indent=2))

    # convenience ---------------------------------------------------------------
    def clear_stage(self, run_time: float = 0.5, keep_header: bool = True, header: tuple | None = None,
                    keep: list | None = None):
        """Fade out everything except the background (and header). Also removes stray sub-objects
        that LaggedStart / .animate on group members leave registered in the scene.
        header=("New idea", "teal") swaps the header in the same step, the usual move at an idea change.
        keep=[tracker, page_card] keeps persistent elements (a step tracker, a card that builds across the act)."""
        if header is not None:
            keep_header = True
        persist = list(keep or [])
        kept_ids = {id(x) for m in persist for x in m.get_family()}
        keep = [self.bg] + ([self._header] if keep_header and self._header is not None else [])
        keep += [m for m in self.mobjects if id(m) in kept_ids]
        others = [m for m in self.mobjects if all(m is not k for k in keep)]
        fade = []
        for m in others:  # animation wrappers (Groups) can hold kept members: fade only the rest of them
            if any(id(x) in kept_ids for x in m.get_family()):
                fade += [sm for sm in m.submobjects if not any(id(x) in kept_ids for x in sm.get_family())]
            else:
                fade.append(m)
        if header is not None and fade:
            run_time /= 2  # fade-out + header swap together cost run_time, not twice it
        if fade:
            self.play(*[FadeOut(m) for m in fade], run_time=run_time)
        self.remove(*[m for m in self.mobjects if all(m is not k for k in keep)])
        for m in persist:
            if m not in self.mobjects:
                self.add(m)
        if not keep_header:
            self._header = None
            self._header_stale = None
        if header is not None:
            self.set_header(*header, run_time=run_time)
        elif self._header is not None:
            self._header_stale = self._current_beat
