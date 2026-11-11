---
name: pesty-video
description: Makes premium narrated 16:9 videos in the Pesty brand. It covers case-study and client-results videos, explainer videos for Pesty blog articles, and SOP, training and internal tool walkthroughs. Each video is one HTML page with its own player, plus an MP4, an .srt and a poster. It has motion-graphic titles, counting metrics, flow diagrams, recreated app screens with camera zooms, a clicking cursor, spotlights, callouts and captions. The ElevenLabs voice-over is synced to the animation, and a claims gate checks every number against the live page. Use it for "turn this case study into a video", "make a video for this blog post", "explainer video for the article on X", "results video for <client>", "SOP video", "training or onboarding video", "walkthrough of this tool", "hacé un video", even if the word "skill" never comes up. Vertical social clips (9:16 / 1:1) and silent booth loops are out of scope.
---

# Pesty video

A continuous, voiced, captioned motion piece, not a slideshow. One React tree is drawn as a pure function of one clock `T`, so the video can be scrubbed, stays frame-exact, and exports to MP4.

**What you deliver:** a folder holding `video.html` (it plays in any browser, with chapters, captions and sound), `voiceover.mp3`, and `out/<name>.mp4` + `out/<name>.srt` + `out/poster.png`.

## Three kinds of video, three starter templates

| Kind | Starter | Data | Claims gate |
|---|---|---|---|
| **Case study / client results** | `assets/case-study.html` | Real numbers, worded exactly as the published case-study page | **Required.** `page` = the case-study URL |
| **Blog-article explainer** | `assets/explainer.html` | Ideas from the article, plus any numbers it states | **Required when it states a number.** `page` = the article URL |
| **SOP / training / tool walkthrough** | `assets/sop.html` | Fictional sample data (Gulf Shore Pest Control, Maria Lopez…) | None (sample data by rule) |

## Files in this skill

| Path | What it is |
|---|---|
| `assets/engine.js` | Timeline engine: clock, player, camera layers, spotlight, callouts, cursor, captions, chapter label, lower third, voice sync, export hooks. `window.EV` |
| `assets/kit.js` | Pesty tokens (Epilogue / Montserrat / JetBrains Mono, pesty-design colours), logos, icons, app-UI primitives, `AppShell`, motion blocks (titles, step lists, flow diagrams, checklists, rule cards, metrics, end card). `window.KIT` |
| `assets/{case-study,explainer,sop}.html` | Complete starter videos. Start every video by copying the matching one |
| `scripts/voice.mjs` | Voices the narration through the ElevenLabs API and writes exact chunk times into the page |
| `scripts/check-claims.mjs` | The claims gate: every evidence string and every number shown or spoken must be on the live page |
| `scripts/export.mjs` | Review stills + contact sheets, or the MP4 + SRT (refuses to export if the claims gate fails) |
| `scripts/align-vo.mjs` | For a hand-made MP3 only: measures the recording and writes its times into the page |
| `scripts/vo-script.mjs` | Writes `voiceover-script.md` for pasting into ElevenLabs by hand (the manual path) |
| `references/engine-api.md` | Every API, with examples. **Read before writing the composition** |
| `references/craft.md` | What makes it look premium: layout, motion, camera, pacing, review checklist. **Read before building** |
| `references/sop-playbook.md` | How to turn an SOP into scenes and a script |
| `references/voiceover.md` | Voice-over: the API path, the manual path, fixing a bad alignment |

## Setup (once per machine)

The scripts need Node 20+ and Google Chrome. Install their two dependencies once:

```bash
cd <this skill>/scripts && npm install
```

If `ffmpeg-static` reports a missing binary, run `node node_modules/ffmpeg-static/install.js` in that folder. The voice-over needs an ElevenLabs key in `$ELEVENLABS_API_KEY` or the macOS Keychain item `elevenlabs-api`.

## Workflow

### 1. Brief

Get what you need, and ask only for what is missing:
- **Source**: the case-study URL, the blog article URL, or for an SOP the doc, notes, repo or live tool.
- **Screens** (walkthroughs only): screenshots or repo source for every tool shown. Never invent a UI you haven't seen.
- **Length**: case study 45–90 s; blog explainer 1–3 min; SOP 1.5–4 min.

### 2. Storyboard, then get approval

Show the user a table (scene, chapter, what's on screen, narration) plus the estimated length (about 2.6 words per second, counting each number as it is spoken: "$12.5M" is five words, "2024" is three) **before building**. Changing words now is free; changing them after the build moves every beat.

- **Case study:** hook (the headline result), the challenge, what Pesty did, the results (metrics counting up, bars), a client quote if the page has one, and an end card with the page URL. Every number and quote comes from the page, worded as the page words it. Write numbers as digits in the narration (`$18.1M`, `211%`) so the claims gate can check them.
- **Blog explainer:** the article's one question as the hook, its core idea as a `Flow` or `StepList`, one scene per key point, any stat as a `Metric`, and an end card pointing to the article. Paraphrase the article; don't read it out.
- **SOP:** read `references/sop-playbook.md`.

### 3. Build

```bash
mkdir -p "<project>/videos/<slug>" && cd "<project>/videos/<slug>"
cp <this skill>/assets/{<kind>.html,engine.js,kit.js} . && mv <kind>.html video.html
```

Read `references/engine-api.md` and `references/craft.md`, then replace the starter's JSON blocks and the composition:
- `#ev-scenes`: the outline. `#ev-script`: the narration chunks. `#ev-vo`: leave it empty.
- `#ev-claims` (case studies and explainers with numbers): `{"page": "<URL>", "evidence": ["<sentence copied from the page>", …]}`. One evidence string per claim the video makes.
- `plan(p, V, CUES)`: every camera move, spotlight, callout, click and state change, **keyed to a narration chunk `V['id']` or a scene cue `CUES.Name`**. Never use absolute seconds.
- `Piece()`: the scenes.

Change `<title>` to the video's name.

### 4. Check claims and review stills (always, before showing anyone)

```bash
node <this skill>/scripts/check-claims.mjs video.html      # skip for an SOP with sample data
node <this skill>/scripts/export.mjs video.html --stills chunks
```

The claims gate prints every miss and exits 1. Fix the video, never the page. Then look at **every** `out/sheet-NN.png` (12 labelled frames each, one per caption). The terminal also prints page errors and "plan aimed at missing element" warnings. Go through the review checklist at the end of `references/craft.md`, fix what you find, render again, and repeat until a pass comes back clean. If the brand fonts fail to load, every script stops; check the Google Fonts link.

### 5. Voice-over

```bash
node <this skill>/scripts/voice.mjs video.html --dry-run   # characters it would bill
node <this skill>/scripts/voice.mjs video.html             # voiceover.mp3 + exact times in #ev-vo
```

Defaults: Chris (the Pesty narrator), `eleven_v4`, speed 1.1. Scenes are cached, so after a wording change only the changed scenes are billed. Scene lengths, captions, zooms, clicks and callouts all move to follow the real voice. Repeat step 4 afterwards. To use a voice someone recorded by hand, see `references/voiceover.md` (`align-vo.mjs`).

### 6. Export and hand off

```bash
node <this skill>/scripts/export.mjs video.html                 # out/video.mp4 + out/video.srt
node <this skill>/scripts/export.mjs video.html --no-captions   # clean video; ship the .srt beside it
node <this skill>/scripts/export.mjs video.html --stills <end-card time> --no-captions   # poster frame
```

The export runs the claims gate first and refuses to render on a miss. Rendering runs at about 30 frames a second with 4 workers. Run long exports in the background. Then give the user:
- the MP4 path (and the SRT and poster), and how long it runs
- for a blog explainer: the no-captions MP4 + SRT is the version to embed
- what you could not check (for example: "I haven't listened to the audio end to end")

Publishing to the blog, YouTube or social is the user's call; never post.

## Non-negotiables

1. **Render from `T` only.** No CSS `animation`/`transition`, no `setTimeout`/`setInterval`, no `requestAnimationFrame`, and no state that changes over time outside the plan. Anything else breaks scrubbing and exports wrong frames.
2. **Every beat is keyed to the voice**: `V['c2'] + 0.4`, `CUES.Send - 0.2`. That is what lets the voice-over re-sync everything.
3. **Show what the narration says, when it says it.** A visual lands 0.2 to 0.6 s after the words that name it start, and a click about 0.1 s before the sentence that names it ends.
4. **Real numbers only from the page; sample data only in SOPs.** A case study or explainer states nothing the live page doesn't, and passes the claims gate before export. An SOP uses realistic fictional data and never real client PII, real emails, real phone numbers or secrets.
5. **Everything the plan aims at stays mounted.** Stack pages and screens in one grid cell and show one with `visibility`. Never mount and unmount them.
6. **One caption at a time, at most 2 lines (about 90 characters).** Split narration at natural clause breaks.
7. **Pesty brand**: Epilogue headings, Montserrat body, ink `#002330`, Pesty red `#D90429` only for focus (spotlight ring, callout dot, the key number, the primary button), neutral grey stage, a dark ink background for the close. No music.
8. Never show the review stills, the plan or the code to the end viewer. They get the video.

---

> Adapted from Bruno Martín Aguilar's pesty-explainer-video. Maintained by [Pesty Marketing](https://pestymarketing.com) · Browse the [full skill catalog](https://pestymarketing.com/agent-skills/).
