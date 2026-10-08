---
name: pesty-explainer
description: Pesty Marketing branded explainer videos - turns one prompt into a finished 2-4 minute narrated MP4 in the Pesty brand (white canvas, Pesty Red, Epilogue/Montserrat, logo end card with CTA) for Pesty's own marketing content - YouTube, LinkedIn, website and sales explainers aimed at pest control owners. Use whenever someone wants a Pesty-branded or Pesty marketing video, "make a Pesty video on local SEO / LSAs / CAC", "explainer for our YouTube channel", "turn this case study into a video", even if they don't say "branded". For internal training videos (not Pesty-branded), use animated-explainer instead.
---

# Pesty explainer

Produce a finished, Pesty-branded explainer video from a single request, with no routine check-ins: the user expects an MP4 back. Honor an explicit script, storyboard, or shorter-clip request. Missing credentials or material source gaps require a focused clarification; never invent them. It runs the same proven pipeline as the `animated-explainer` skill (script → ElevenLabs voice → Manim → QA → assembly) with three differences that matter:

1. **Audience and voice.** The viewer is a pest control operator (PCO), usually an owner doing $1M–$20M who wants to grow. Pesty talks to them operator-to-operator: confident, plain-spoken, specific, a little scrappy. See [references/pesty-voice.md](references/pesty-voice.md).
2. **Proof.** Pesty leads with real numbers, so the video usually lands one or two of them. Every number must be real and sourced. An invented stat in a marketing video is a liability for the brand.
3. **The look.** Pesty's web design system translated to motion: white canvas, deep-teal ink, Pesty Red only as a spotlight, Epilogue headlines, the mark in the corner, and a logo end card with one CTA. See [references/pesty-style.md](references/pesty-style.md) and [assets/reference.png](assets/reference.png).

For a script or storyboard request, complete the proof and storyboard steps and deliver those artifacts; skip runtime setup, credentials, narration, and rendering.

## Pipeline at a glance

```
storyboard.json --tts.py--> audio + timings.json --scenes.py (Manim + pesty.py)--> rendered acts
     --frames.py--> visual QA stills --assemble.py--> explainer.mp4 + captions.srt
```

This skill requires **animated-explainer** (its scripts and rendering engine). Install both with:

```bash
npx skills add Pesty-Marketing/agent-skills --skill animated-explainer pesty-explainer -g
```

The packaged setup supports macOS with Homebrew, FFmpeg, uv, and an ElevenLabs account/key. Narration consumes ElevenLabs credits. Install [Montserrat](https://fonts.google.com/specimen/Montserrat) and [Epilogue](https://fonts.google.com/specimen/Epilogue) for the supplied motion style. Set `SKILL_DIR` to the absolute directory containing this loaded `SKILL.md`, resolving installation symlinks. Set `AE` to the installed animated-explainer directory (normally its sibling). If installed elsewhere, also export `ANIMATED_EXPLAINER_DIR="$AE"` for the brand helper.

Shell variables do not persist between commands. Set the actual skill paths plus these runtime paths in each command:

```bash
PY=~/.local/share/animated-explainer/venv/bin/python MANIM=~/.local/share/animated-explainer/venv/bin/manim
```

The shared scripts live in `$AE/scripts`. Always run them with `$PY`; the system Python has no Manim.

## 1. Set up

Run `$AE/scripts/setup.sh` (done when it prints `ready`). Create the project at `~/Movies/Explainers/pesty/<slug>/` and work there.

## 2. Understand the topic and gather proof

If the user supplied sources (a case study, a blog post, call notes), they are the ground truth. Otherwise use available web search or page retrieval tools to research only what you need: Pesty's own claims come from pestymarketing.com (case studies, service pages); industry facts (how Google's map pack or Local Services Ads work) from Google's documentation or reputable sources. Write `sources.md`: every number and factual claim in the script, with where it came from, plus further reading you cut.

Write one sentence each before scripting:
- **Audience pain:** the moment a PCO owner feels the problem (phones quiet in peak season, a competitor outranking them, an ad bill with nothing to show).
- **The big-picture rule.**
- **The 20% engine:** the one mechanism that delivers most of the result.
- **The proof:** the real number that shows it works (or none, if no honest one exists; don't stretch).
- **The takeaway** and the **CTA** (see the voice guide for which CTA fits).

Done when those lines exist and every claim is in `sources.md`.

## 3. Script the storyboard

Write `storyboard.json` in exactly this shape (each act needs both `id` and `scene`; `voice` is Chris, an American male narrator, the Pesty default):

```json
{
  "title": "Own the Map Pack", "slug": "own-the-map-pack", "voice": "iP95p4xoKVk53GoZ742B",
  "acts": [
    {"id": "hook", "scene": "Hook", "beats": [
      {"id": "hook-1", "narration": "Mike runs a nine-truck shop outside Tampa, and in May his phone went quiet.",
       "visual": "Mike (Person, teal shirt, worried) pops in left third; a phone card on the right shows 0 new calls"}
    ]},
    {"id": "concept",  "scene": "Concept",  "beats": [...]},
    {"id": "engine",   "scene": "Engine",   "beats": [...]},
    {"id": "takeaway", "scene": "Takeaway", "beats": [...]}
  ]
}
```

The 80/20 rules carry over unchanged; rough shares hook 10–20%, concept 20–33%, engine 38–55%, takeaway 8–18%:
1. **Hook:** a PCO owner character (named, with a concrete business: "Mike runs a nine-truck shop outside Tampa") living the pain. Open on him, not on Pesty.
2. **Core concept:** the big-picture rule, framed as the way out.
3. **The 20% engine:** the one workflow, walked through the character's business step by step. Land the proof number here or at the start of the takeaway.
4. **Takeaway + CTA:** one memorable sentence, then the end card (the last beat; see the voice guide).

Characters and worked examples may be illustrative when labeled as such. Do not present an invented character as a real client or attach fabricated results to one. The sample storyboard above is illustrative.

Micro-rules: kill the nice-to-knows; one line, one visual change (each `visual` names a specific change); write for the ear. The default runtime is 130–230 seconds, checked in step 4; that is usually **400–520 words**. For an explicitly requested other duration, size the narration to that request. Length comes from engine depth or a worked example in the character's business, never padding. A short how-to source usually needs a worked example to get there. Edit beats with `$PY $AE/scripts/sb.py <project> insert|set|delete|list`. Save `script.md`.

Done when every beat has an id, narration and concrete visual, every claim traces to `sources.md`, and the script passes a re-read against the micro-rules and the voice guide.

## 4. Voice it

Default narration is 130–230 seconds and the finished video is 120–240 seconds. For an explicitly requested shorter or longer video, evaluate timing against that request instead; default-runtime warnings alone do not reject it. At assembly, use `--any-length` only for that authorized length override or a smoke test, then verify the requested duration separately.

`$PY $AE/scripts/tts.py <project> --dry-run`, then `$PY $AE/scripts/tts.py <project> --max-chars 3500`. It reads the voice from the storyboard, caches unchanged lines, and reports act shares. Done when the total matches the requested duration (130–230 s by default), with relevant warnings resolved. Inspect act-share outside-range markers even when not labeled WARNING; resolve them or explain a deliberate exception.

## 5. Animate

Design first. Read [references/pesty-style.md](references/pesty-style.md), open [assets/reference.png](assets/reference.png) (the level of finish to match; source in `assets/reference_src.py`), and read `$AE/references/manim-patterns.md` for code structure, timing and gotchas; everything there applies, with `from pesty import *` and `PestyScene` in place of `kurz` / `ExplainerScene`. The Pesty-only helpers are listed in pesty-style.md; every helper's signature is in the docstrings of `assets/pesty.py` and `$AE/assets/kurz.py`.

Plan each beat's layout (header, zones, containers, what moves) and the engine act as one bespoke diagram that builds beat by beat. Then write `scenes.py`:

```python
import os, sys; sys.path.insert(0, os.environ["EXPLAINER_ASSETS"])
from pesty import *

class Hook(PestyScene):
    EYEBROW = "Local SEO"          # the video's topic label, shown above every header
    def construct(self):
        with self.beat("hook-1") as b:
            ...
```

Every act subclasses `PestyScene` with the same `EYEBROW`. Time each beat's key visual to the word that names it (`self.wait_until(b, "word")`), stagger groups, and use the easing tokens in pesty-style.md. Keep each beat's run_times ≤ 0.85 of its narration. The takeaway act ends with `self.end_card("<promise>", cta=..., url=...)` on its final beat. Render from the project dir:

`EXPLAINER_ASSETS="$SKILL_DIR/assets" ANIMATED_EXPLAINER_DIR="$AE" EXPLAINER_DIR=<project> $MANIM -qh --disable_caching scenes.py Hook Concept Engine Takeaway`

A full 1080p render of all four acts takes 6–10 minutes, longer than a foreground tool call allows. Start it as a background command (a supported background-process tool, or `nohup $MANIM ... --progress_bar none > render.log 2>&1 &`), and check it's done when every `build/beatlog_<Act>.json` is newer than the render's start, then read `render.log` for errors. Iterate on one act with `-ql`: it renders a fast 480p preview into its own folder, and `assemble.py` refuses to run if a preview is newer than the 1080p render, so finish with `-qh` for every changed act.

This is macOS: there is no `timeout` or `setsid`, and `sed -i` needs an empty argument (`sed -i ''`). For edits to `scenes.py`, use the editing tools or a short Python replace rather than complex `sed`.

Done when every act renders without errors.

## 6. Check what you made

`$PY $AE/scripts/frames.py <project>` writes a contact sheet per act and prints the render's QA warnings. Open every sheet and look. For each beat: is anything clipped, overlapping, unreadable or tiny; does the frame show what the narration says; would it make sense with the sound off? Then hold every frame to the brand checklist at the end of pesty-style.md. Judge it as Pesty's own designer would: does this look like it came from the same company as pestymarketing.com?

Fix in `scenes.py`, re-render affected acts (`frames.py --scene <Name>`). Done when every warning is resolved or deliberately accepted and every frame passes the checklist.

## 7. Assemble and deliver

`$PY $AE/scripts/assemble.py <project>` joins the acts, writes `captions.srt` and verifies 1920×1080, audio, 120–240 s and caption coverage; fix failures rather than skipping checks. Send `explainer.mp4` to the user using the available file-delivery mechanism and reply in a few lines: project folder, length, the takeaway, the proof numbers used and their sources, and anything you simplified or left out.

Done when assemble reports all checks ok and the user has the file.
