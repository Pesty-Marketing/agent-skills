from pathlib import Path
import sys; sys.path.insert(0, str(Path(__file__).resolve().parent))
from pesty import *

# Source of assets/reference.png. One frame each: manim -qh -s reference_src.py P1Hook  (etc.)
EYE = "Local SEO"


class Base(Scene):
    def setup(self):
        self.camera.background_color = C["bg_top"]
        self.add(background(), mark().move_to([CONTENT_RIGHT - 0.25, HEADER_Y - 0.3, 0]))


class P1Hook(Base):
    def construct(self):
        self.add(header("The phone stopped ringing", "red", EYE))
        mike = Person(shirt="teal", skin=1, hair="short", hair_color=0, expression="worried", height=2.9)
        place(mike, "left_third").shift(DOWN * 0.45)
        name = caption("Mike · owns a 9-truck shop").next_to(mike, DOWN, buff=0.15)
        b = bubble("Where did the calls go?", "blue", tail="left", max_width=3.4).next_to(mike, UP, buff=0.25).align_to(mike, LEFT)
        rows = VGroup(*[card(VGroup(label(n, size=26), caption(s)).arrange(DOWN, aligned_edge=LEFT, buff=0.08), c, min_width=5.8)
                        for n, s, c in [("1  Apex Pest Co.", "4.9 ★  ·  312 reviews", None), ("2  Shield Termite", "4.8 ★  ·  207 reviews", None),
                                        ("3  Mike's Pest Pros", "4.1 ★  ·  18 reviews", "red")]])
        rows.arrange(DOWN, buff=0.2)
        p = titled_panel("Google: \"pest control near me\"", rows, "teal", width=7.0, height=5.4)
        place(p, "right_half").shift(RIGHT * 0.3)
        self.add(mike, name, b, p)


class P2Split(Base):
    def construct(self):
        self.add(header("Rent or own leads", "red", EYE))
        _, w, h = zone("left_half")
        l = titled_panel("Rent them", VGroup(icon("funnel", "amber", 1.2), label("Pay per click, forever")).arrange(DOWN, buff=0.4),
                         "amber", width=w - 0.2, height=h - 1.3)
        r = titled_panel("Own them", VGroup(icon("chart", "green", 1.2), label("Rankings that compound")).arrange(DOWN, buff=0.4),
                         "green", width=w - 0.2, height=h - 1.3, tinted=True)
        place(l, "left_half").shift(UP * 0.45); place(r, "right_half").shift(UP * 0.45)
        co = callout("Do both. Shift spend as SEO grows.", "red").next_to(VGroup(l, r), DOWN, buff=0.35)
        self.add(l, r, co)


class P3Engine(Base):
    def construct(self):
        self.add(header("Three map-pack levers", "red", EYE))
        detail = VGroup(*[card(VGroup(icon(i, c, 0.8), label(t, size=26), caption(s)).arrange(DOWN, buff=0.18), min_width=3.9, pad=0.4)
                          for i, c, t, s in [("star", "red", "Ask after every job", "Text a link at ticket close"),
                                             ("folder", "slate", "Real trucks, real techs", "Upload weekly"),
                                             ("target", "slate", "Every city you serve", "One page per city")]])
        detail.arrange(RIGHT, buff=0.6)
        steps = VGroup(step_chip(1, "Reviews"), step_chip(2, "Photos"), step_chip(3, "Service areas"))
        for st_, d in zip(steps, detail):
            st_.next_to(d, UP, buff=0.7).set_x(d.get_x())
        steps[0][0].set_fill(tint("red", 0.1))  # the active step
        arrows = VGroup(*[arrow(a_, b_) for a_, b_ in zip(steps, steps[1:])])
        f = VGroup(steps, arrows, detail)
        place(f, "full")
        detail = VGroup()
        self.add(f, detail)


class P4Stat(Base):
    def construct(self):
        self.add(header("What it's worth", "red", EYE))
        hero = shadow(card(stat("329", "new recurring customers", sub="from a Pesty case study"), pad=0.6, min_width=5.6))
        side = VGroup(card(stat("$72.04", "cost per acquisition", "green", size=72), pad=0.45, min_width=5.0),
                      card(stat("1", "client per city", "teal", size=72), pad=0.45, min_width=5.0)).arrange(DOWN, buff=0.35)
        row = VGroup(hero, side).arrange(RIGHT, buff=0.8)
        place(row, "full")
        self.add(row)


class P5Cast(Base):
    def construct(self):
        self.add(header("Cast", "red", EYE))
        people = VGroup(*[Person(shirt=s, skin=k, hair=hs, hair_color=hc, expression=e, height=2.3)
                          for s, k, hs, hc, e in [("teal", 0, "short", 0, "neutral"), ("red", 2, "bun", 4, "happy"),
                                                  ("blue", 4, "curly", 4, "thinking"), ("green", 1, "long", 3, "surprised"), ("purple", 3, "bald", 0, "sad")]])
        people.arrange(RIGHT, buff=0.55).move_to(UP * 0.7)
        bots = VGroup(*[VGroup(Bot(c, e, height=1.4), caption(e)).arrange(DOWN, buff=0.1)
                        for c, e in [("blue", "neutral"), ("blue", "happy"), ("amber", "worried"), ("red", "angry"), ("teal", "thinking")]])
        bots.arrange(RIGHT, buff=0.8).next_to(people, DOWN, buff=0.45)
        self.add(people, bots)


class P6End(Base):
    def construct(self):
        self.add(end_card("Own your city's map pack."))
