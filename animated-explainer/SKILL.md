---
name: animated-explainer
description: Animated explainer videos - turns one prompt into a finished 2-4 minute narrated MP4 (Manim animation, polished flat motion-design style, ElevenLabs voice, .srt captions). Use whenever someone asks for an explainer, training, or educational video on any topic - "make a video explaining X", "3b1b/Kurzgesagt-style explainer on Y", "turn this doc into a training video", "animate how Z works" - even if they don't say "animated" or "Manim". For Pesty Marketing branded or marketing videos, use pesty-explainer instead.
---

# Animated explainer

Produce a finished, watchable video from a single request, with no check-ins: the user expects to get an MP4 back, not a draft or a question. Honor an explicit request for a script, storyboard, or shorter clip. Missing credentials or material source gaps need a focused clarification; never invent them. Two things make it good, and both matter equally. First, a script that teaches one idea through a character the viewer follows. Second, design polished enough to look like a motion studio made it: consistent layout, clear hierarchy, illustrations built for the concept. A strong script with amateur visuals still fails, because clumsy design distracts from the lesson.

Current edition: **internal training**. The tone is a smart colleague explaining something useful, warm and concrete, not a lecture or an ad.

For a script or storyboard request, complete the topic and storyboard steps and deliver those artifacts; skip runtime setup, credentials, narration, and rendering.

## Pipeline at a glance

```
storyboard.json --tts.py--> audio/*.mp3 + timings.json --scenes.py (Manim + kurz.py)--> rendered acts
     --frames.py--> visual QA stills --assemble.py--> explainer.mp4 + captions.srt
```

This packaged setup supports macOS with Homebrew. It needs FFmpeg, uv, and an ElevenLabs account/key; narration consumes ElevenLabs credits. Set `SKILL_DIR` to the absolute directory containing this loaded `SKILL.md`, resolving any installation symlink. It may be under `.agents/skills`, `.codex/skills`, or `.claude/skills`. Keep the whole folder together. The supplied training-video style uses Avenir Next, available on macOS.

Paths: `PY=~/.local/share/animated-explainer/venv/bin/python`, `MANIM=~/.local/share/animated-explainer/venv/bin/manim`. Always run the scripts with `$PY`; the system Python does not have Manim installed.

## 1. Set up

Run `$SKILL_DIR/scripts/setup.sh`. It installs the Cairo/Pango and Python rendering dependencies and checks FFmpeg, uv, the font, and ElevenLabs credentials. Install any missing prerequisite using the command it reports. Create the project at `~/Movies/Explainers/<slug>/` (slug = short kebab-case topic) and do all work there.

Done when setup prints `ready`.

## 2. Understand the topic

If the user supplied sources (files, URLs, notes), they are the ground truth: read them fully and build from them. Research with the available web search or page retrieval tools only for claims you aren't confident are correct and current, such as named people's actual statements, numbers, or recent tools. A training video that teaches something false is worse than no video. Write `sources.md` listing what you used, with any further reading you cut from the video for the "learn more" pointer.

Before scripting, write down in one sentence each:
- **Audience pain**: the moment a viewer feels the problem.
- **The big-picture rule**: the concept as a single principle.
- **The 20% engine**: the one mechanism or workflow that delivers most of the value. Only one.
- **The takeaway**: the sentence you want them repeating tomorrow.

Done when those four lines exist and every factual claim you plan to make is backed by your sources or by knowledge you're confident in.

## 3. Script the storyboard

Write `storyboard.json` in this shape:

```json
{
  "title": "Signal over Noise", "slug": "signal-over-noise",
  "acts": [
    {"id": "hook", "scene": "Hook", "beats": [
      {"id": "hook-1", "narration": "It's 9am and Maya already has 47 unread messages.",
       "visual": "Maya (Person, worried) in left third; message cards stack up in a panel on the right while a counter ticks to 47"}
    ]},
    {"id": "concept", "scene": "Concept", "beats": [...]},
    {"id": "engine",  "scene": "Engine", "beats": [...]},
    {"id": "takeaway","scene": "Takeaway", "beats": [...]}
  ]
}
```

Follow the 80/20 structure. Each act has one job, and the engine gets the most time (rough shares: hook 10–20%, concept 20–33%, engine 38–55%, takeaway 8–18%):
1. **Hook (~first 30 s).** Establish the relatable problem. Show a character experiencing the exact pain point the audience feels. Open on the character and their situation, not a definition or "Today we'll learn".
2. **Core concept.** Introduce the concept as a useful approach, with its material limitations. Explain the big-picture rule, not the minor details.
3. **The 20% engine.** Focus entirely on the single highest-yield mechanism. For a complex system, show the one workflow that solves the problem, not a tour.
4. **Takeaway / CTA (last ~30 s).** A concrete next step or one memorable summary sentence. Point to the cut nuance here ("for the details, see …").

Micro-rules, which are what separate a good script from a lecture:
- **Kill the nice-to-knows.** If a detail doesn't directly serve the core solution, delete it. Move needed nuance to the resources pointer at the end.
- **One line, one visual change.** Each beat is one sentence, or two very short ones, and its `visual` names a specific transformation: something appears, moves, morphs, changes colour or expression. "Show the concept" is not a visual. If you can't name the change, the line is probably abstract filler, so rewrite or cut it.
- Write for the ear: short sentences, concrete nouns, "you", contractions, numbers spoken as words where natural. Give the character a name and keep them through the video so the story has continuity.
- Default length: **400–520 words** (narration runs ~2.3–2.9 words/second, so under ~400 words misses the 2-minute floor). Length comes from depth in the engine, not padding: if the draft is short, walk the mechanism through a concrete worked example (the character applying it step by step), or show it working on a second case. Never lengthen by adding nice-to-knows or a longer hook.
- Edit beats with `$PY $SKILL_DIR/scripts/sb.py <project> insert|set|delete|list` (by beat id), rather than by list index, so you never overwrite a line.

For a requested shorter or longer clip, size the script to that duration rather than enforcing the default word count.

Save a readable `script.md` (narration grouped by act) alongside.

Done when every beat has an id, narration and concrete visual; the four acts are present; and you've re-read the script once, cutting anything that fails the micro-rules.

## 4. Voice it

Default narration is 130–230 seconds and the finished video is 120–240 seconds. For an explicitly requested shorter or longer video, evaluate timing against that request instead; default-runtime warnings alone do not reject it. At assembly, use `--any-length` only for that authorized length override or a smoke test, then verify the requested duration separately.

`$PY $SKILL_DIR/scripts/tts.py <project>`. It voices each beat with ElevenLabs, caches unchanged lines, and prints per-act timings. `--dry-run` shows the character count first, and `--max-chars N` refuses to bill more than N. ElevenLabs credit costs money, so dry-run before the first full voicing and avoid re-voicing beats needlessly. The report shows each act's share of the runtime and flags acts outside the 80/20 shape. If the total is outside the window or the engine is under-weighted, edit the script and re-run; only changed beats are billed.

Done when `timings.json` exists, the printed total matches the requested duration (130–230 s by default), and relevant warnings are resolved. Inspect the act-share report too: address unexplained outside-range markers even when they are not labeled WARNING.

## 5. Animate

Design first, then code. Read [references/visual-style.md](references/visual-style.md) and open [assets/reference.png](assets/reference.png), which shows the design system rendered and sets the level of finish to match. Read [references/manim-patterns.md](references/manim-patterns.md) for code structure, timing and gotchas.

Before writing code, add a `layout` note to each beat in your head or in the storyboard: which header, which zone holds what, which container, and what moves. Pick the video's 2–3 accent colours and what each means. Plan the engine act as one bespoke diagram that builds up beat by beat; that diagram is the centrepiece of the video.

Write `scenes.py` with one `ExplainerScene` subclass per act (class names = `scene` fields), importing the house library:

```python
import os, sys; sys.path.insert(0, os.environ["EXPLAINER_ASSETS"])
from kurz import *
```

Each beat is a `with self.beat("<id>") as b:` block. Sound starts at the block's start and the block pads to the narration's length. Size animations with `run_time=b.t(fraction)` and keep a beat's fractions summing to **≤ 0.85**, so the finished picture holds on screen while the sentence lands. Render all acts:

`EXPLAINER_ASSETS="$SKILL_DIR/assets" EXPLAINER_DIR=<project> $MANIM -qh --disable_caching scenes.py Hook Concept Engine Takeaway` (run from the project dir).

Done when every act renders without errors.

## 6. Check what you made

`$PY $SKILL_DIR/scripts/frames.py <project>` writes a contact sheet per act (the last frame of every beat) and prints layout warnings from the render: text overlaps, objects off-frame, animations overrunning narration. Open each sheet and look, because automated checks miss most visual problems. For every beat, ask:
- Is anything clipped, overlapping, unreadable, or tiny?
- Does the frame show what the narration says at that moment?
- Would a viewer with the sound off still follow the progression?

Then hold every frame to the composition checklist at the end of visual-style.md (grid alignment, one focal point, containers, type hierarchy, colour meaning, no unintended overlaps). Judge it the way a picky motion designer would: does this look intentionally designed, or assembled? Individual frames are full-size in `build/frames/<Scene>/` when you need to check small text.

Fix problems in `scenes.py` and re-render only the affected acts (`frames.py --scene <Name>` re-checks one).

Done when every warning is resolved or deliberately accepted, and every frame passes both the three questions and the checklist.

## 7. Assemble and deliver

`$PY $SKILL_DIR/scripts/assemble.py <project>` joins the acts, writes `captions.srt` (timed from the real render), and verifies 1920×1080, audio present, 120–240 s, and caption coverage. It exits non-zero on failure; fix the cause rather than skipping checks.

Deliver: send `explainer.mp4` to the user using the available file-delivery mechanism and reply in a few lines with the path to the project folder, the video length, the takeaway sentence, and anything you simplified or left out.

Done when assemble reports all checks ok and the user has the file.
