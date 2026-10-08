from pathlib import Path
import sys; sys.path.insert(0, str(Path(__file__).resolve().parent))
from kurz import *

# Source of assets/reference.png. Render one frame: manim -qh -s reference_src.py R1Hook
class Base(Scene):
    def setup(self):
        self.camera.background_color = C["bg_top"]; self.add(background())

class R1Hook(Base):
    def construct(self):
        self.add(header("The problem", "pink"))
        maya = Person(shirt="blue", skin=1, hair="long", hair_color=1, expression="worried")
        place(maya, "left_third").shift(DOWN * 0.4)
        bot = Bot(color="teal", expression="happy"); place(bot, "right_third").shift(DOWN * 0.4)
        q = bubble("What's our refund policy?", "blue", tail="left").next_to(maya, UP, buff=0.25).align_to(maya, LEFT).shift(UP*0.9)
        a = bubble("90 days, no questions asked!", "orange", tail="right").next_to(bot, UP, buff=0.25).align_to(bot, RIGHT)
        real = doc("Your real policy", "teal").scale(0.9).move_to(zone("center_third")[0] + DOWN * 1.2)
        st = stamp("MADE UP", "pink").scale(0.75).move_to(a.get_corner(DL) + RIGHT*0.6 + DOWN*0.15)
        self.add(maya, bot, q, a, real, st)

class R2Split(Base):
    def construct(self):
        self.add(header("Two kinds of exam", "teal"))
        _, w, h = zone("left_half")
        l = titled_panel("Closed book", Bot("orange", "sad", height=2.0), "orange", width=w-0.2, height=h-1.3)
        r = titled_panel("Open book", VGroup(Bot("teal", "happy", height=2.0), icon("book", "orange", 0.9)).arrange(RIGHT, buff=0.4), "teal", width=w-0.2, height=h-1.3, tinted=True)
        place(l, "left_half").shift(UP*0.45); place(r, "right_half").shift(UP*0.45)
        l.add(caption("Memory only").next_to(l[0].get_bottom(), UP, buff=0.3))
        r.add(caption("Look things up first").next_to(r[0].get_bottom(), UP, buff=0.3))
        co = callout("Open book = RAG", "teal").next_to(VGroup(l, r), DOWN, buff=0.35)
        self.add(l, r, co)

class R3Flow(Base):
    def construct(self):
        self.add(header("How RAG answers", "teal"))
        steps = [step_chip(1, "Retrieve", "teal"), step_chip(2, "Augment", "orange"), step_chip(3, "Generate", "pink")]
        f = flow(steps, buff=0.8).move_to(UP * 1.4)
        docs = VGroup(doc(accent="teal", width=0.9), doc(accent="teal", width=0.9)).arrange(RIGHT, buff=0.2).next_to(steps[0], DOWN, buff=0.7)
        prompt = card(VGroup(label("The prompt", "orange"), pill("Question", "blue"), pill("Policy p.2", "orange", filled=False)).arrange(DOWN, buff=0.18), "orange").next_to(steps[1], DOWN, buff=0.5)
        ans = VGroup(Bot("teal", "happy", height=1.6), bubble("14 days, with receipt", "teal", tail="none", size=22)).arrange(DOWN, buff=0.2).next_to(steps[2], DOWN, buff=0.45)
        self.add(f, docs, prompt, ans)

class R4Cards(Base):
    def construct(self):
        self.add(header("Where this helps", "yellow"))
        items = [("check", "teal", "Brand voice check", "Drafts that match your guide"), ("chart", "orange", "Real numbers", "Pulled from last quarter"), ("calendar", "pink", "Current offers", "Always today's promo")]
        cards = VGroup()
        for ic, acc, t, sub in items:
            inner = VGroup(icon(ic, acc, 1.1), label(t), caption(sub)).arrange(DOWN, buff=0.25)
            cards.add(card(inner, acc, pad=0.5, min_width=3.6))
        cards.arrange(RIGHT, buff=0.45); place(cards, "full")
        self.add(cards)

class R5Cast(Base):
    def construct(self):
        self.add(header("Cast", "purple"))
        people = VGroup(*[Person(shirt=s, skin=k, hair=hs, hair_color=hc, expression=e, height=2.2)
                          for s, k, hs, hc, e in [("teal",0,"short",0,"neutral"),("pink",2,"bun",4,"happy"),("orange",4,"curly",4,"thinking"),("purple",1,"long",3,"surprised"),("blue",3,"bald",0,"sad")]])
        people.arrange(RIGHT, buff=0.5).move_to(UP*0.75)
        bots = VGroup(*[VGroup(Bot(c, e, height=1.5), caption(e)).arrange(DOWN, buff=0.1) for c, e in [("teal","neutral"),("teal","happy"),("orange","worried"),("pink","angry"),("blue","surprised"),("purple","thinking")]])
        bots.arrange(RIGHT, buff=0.5).move_to(DOWN*2.3)
        self.add(people, bots)

class R6Bits(Base):
    def construct(self):
        self.add(header("Small pieces", "blue"))
        cnt = Counter(47, fmt="{:,.0f}", color="pink"); cap = caption("unread messages")
        num = card(VGroup(cnt, cap).arrange(DOWN, buff=0.1), "pink", tinted=True, pad=0.5)
        tags = VGroup(pill("signal", "teal"), pill("noise", "muted", filled=False), pill("2019", "pink", filled=False)).arrange(RIGHT, buff=0.25)
        icons = VGroup(*[icon(n, c, 0.8) for n, c in [("search","yellow"),("bulb","yellow"),("gear","blue"),("chat","blue"),("cross","pink"),("clock","orange"),("target","pink"),("lock","yellow"),("warning","yellow"),("folder","blue"),("mail","orange"),("database","purple")]]).arrange_in_grid(2, 6, buff=0.45)
        col = VGroup(num, tags).arrange(DOWN, buff=0.5); place(col, "left_third"); place(icons, "right_two_thirds")
        self.add(col, icons)
