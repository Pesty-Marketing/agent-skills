---
name: motion-video
description: Motion-graphics videos built from HTML/CSS scenes and rendered frame-exact to MP4. Covers silent screen loops (booth TV, lobby, trade show), tool or software walkthroughs from real screenshots, case study and results videos, and short social clips (16:9, 9:16, 1:1) with optional ElevenLabs narration and captions. Use for "make a video of X", "promo loop for our booth", "walkthrough video of this tool", "turn this case study into a video", "a short clip for LinkedIn/Reels". Concept explainers that need diagrams or animated math belong to animated-explainer / pesty-explainer.
---

# Motion video

Make a video the way a motion designer would, in HTML: each **scene** is a `<section>` of real text, images and screenshots. `motion.js` animates the elements from `data-*` attributes, and `render.py` pauses every animation and seeks it frame by frame into an MP4. Frames are exact and repeatable. Any edit means changing HTML and re-rendering.

Set `MV` to the directory holding this `SKILL.md`, after resolving symlinks. Scripts run with `python3` and need `playwright` (with `playwright install chromium`), `requests`, `qrcode`, `opencv-python-headless`, `numpy`, and `ffmpeg` on PATH.

## Presets

| preset | for | narration | min text | default sizes |
|---|---|---|---|---|
| `loop` | screens people walk past at 3–10 ft | off | 56px | 16x9 |
| `walkthrough` | showing a real tool, step by step | on | 30px | 16x9 |
| `story` | case studies, results, announcements | on | 30px | 16x9 + 9x16 |

The preset only sets defaults. `storyboard.json` can override `narration`, `captions`, `sizes` and `min_px`.

## Steps

1. **Brief.** Collect the goal, audience, where the video will play, length, preset, theme (`pesty` is the default; `neutral` is unbranded) and sources. If the user names a client, a URL or a document, read it now.
   - Every number and claim in a video comes from a source the user approved.
   - Write it the way the source writes it, and add no cause-and-effect the source doesn't state.
   - Done when you could say the video's single message in one sentence.

2. **Scaffold.** Run `python3 $MV/scripts/new.py <preset> videos/<slug> --title "<Title>" [--theme pesty]`. This writes `storyboard.json`, `video.html`, and a copy of the library in `motion/`.

3. **Storyboard, then stop for approval.** Fill in `storyboard.json` following [references/storyboard.md](references/storyboard.md): one entry per scene with its id, the on-screen words (`screen`), the `narration` line, and `dur` for silent scenes.
   - Show it to the user as a short table and wait for an explicit OK.
   - Changing a storyboard costs nothing; a render does not.
   - Done when the user approves.

4. **Gather visuals.**
   - **Real tool screens:** `python3 $MV/scripts/capture.py <url> --out videos/<slug>/shots/<name>.png`. Use `--actions` for clicks and typing, and `--record` for a short `.webm` where motion matters.
   - **Logged-in tools:** run `capture.py <url> --login` once. The user signs in in the window that opens. The skill reuses the saved session; the agent never types a password.
   - **QR codes:** `python3 $MV/scripts/qr.py <url> --out videos/<slug>/qr.png`.
   - Show the real product only. Never rebuild a UI as a mockup.

5. **Narrate** (narrated videos only). Run `python3 $MV/scripts/tts.py videos/<slug> --dry-run`, then `--max-chars <N>`. It writes `timings.json`, which has the word times. Scenes stretch to fit their narration, and only changed lines are billed on a re-run. The key comes from `$ELEVENLABS_API_KEY` or the macOS Keychain item `elevenlabs-api`. If neither exists, ask the user; never ask for the key in chat.

6. **Build `video.html`** from the scene library: [references/scenes.md](references/scenes.md) has every component, the `data-in` / `data-anim` timing grammar, and how to time an element to a spoken word (`data-in="@revenue"`). Follow [references/readability.md](references/readability.md) for the preset you're making. Preview by opening `video.html` in a browser, after step 7 has written `timeline.js`.

7. **Stills and gates.** Run `python3 $MV/scripts/render.py stills videos/<slug>`.
   - It writes one still per scene plus `stills/<size>/contact-sheet.jpg`, and runs every gate: timing, fonts, text size, fit, QR decode, and the loop seam.
   - Open the contact sheet and every still, and fix what you see: crowding, a weak hierarchy, text fighting the background, a scene that says two things.
   - Re-run until the gates print `checks: all passed` for every size and the stills look finished.
   - Show the contact sheet to the user before the final render.

8. **Render and deliver.** Run `python3 $MV/scripts/render.py video videos/<slug> --deliver`.
   - It writes `out/<slug>-<size>.mp4` (h264 yuv420p, AAC narration) and `captions.srt`, and copies them to `~/Downloads`.
   - Confirm with `ffprobe` that each file has the expected size and duration, and an audio stream when narrated.
   - Hand over the file paths. Publishing or posting a video is the user's call.

## Gotchas

- **Fonts:** themes load from Google Fonts, so rendering needs network access. If a font is missing, the render fails with an error instead of falling back to Arial.
- **Transforms:** `motion.js` animates `transform` and `opacity` on any element that has `data-in`. Put layout transforms on a wrapper element, not on the animated one.
- **Size:** every size renders with its short side at 1080px, so px values mean the same thing in every orientation. Use `.row`, `.only-landscape` / `.only-portrait`, or `@media (orientation:portrait)` for layouts that change by size.
- **Library edits:** a library fix belongs in `$MV/assets/motion/`, followed by `new.py --refresh videos/<slug>`. Don't fork `motion/` inside a project.
- **Overlap:** the fit gate catches text that overflows its box, not one element covering another. When you review stills, check that photos and big numbers don't collide, and in 9:16 that the photo crop keeps faces (`object-position`).
