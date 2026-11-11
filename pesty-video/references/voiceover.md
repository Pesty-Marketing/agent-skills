# Voice-over: ElevenLabs and syncing

## 0. The default: voice.mjs (API)

`node scripts/voice.mjs video.html` sends each scene's chunks to ElevenLabs (`/with-timestamps`), keeps the clips in `vo/`, joins them with 0.6 s of silence into `voiceover.mp3`, and writes every chunk's real start and end into `#ev-vo` from the character timings. No silence-guessing, so the `~` caveats below don't apply.

- `--dry-run` prints the characters it would bill. `--max-chars N` refuses to bill more than N.
- `--voice`, `--model`, `--speed` (default Chris, `eleven_v4`, 1.1), `--gap` (pause between scenes, default 0.6 s).
- Edit a scene's words and run it again: only that scene is billed (`vo/cache.json`).
- The words in `#ev-script` are exactly what gets spoken and captioned, so write them for the ear.

Sections 1–3 below are the manual path, for a voice someone generated or recorded by hand.

## 1. The script

`node scripts/vo-script.mjs video.html` writes `voiceover-script.md` with:
- **Plain text**: one paragraph per scene, the exact chunk words. For ElevenLabs voices and models without audio tags (v4 and the standard models): paste as is.
- **v3 with audio tags**: the same words, each paragraph prefixed with the scene's `tone` (`[warm, clear]`, `[steady, explaining]`) and `[pause]` between scenes. Eleven v3 reads bracketed tags as performance directions, not words.
- **Scene starts**: the estimated timing, to give the user an idea of the length.

The words must stay identical to `#ev-script`: the captions show them and the aligner counts them. If the user wants to change wording, change the script JSON first, then regenerate the file.

Good tags (use sparingly, one per paragraph, and at most a few extra inside): `[calm, clear]`, `[warm]`, `[friendly]`, `[steady, explaining]`, `[confident]`, `[serious, clear]`, `[upbeat]`, `[pause]`, `[short pause]`. Avoid emotional tags (`[excited]`, `[laughs]`) in SOPs.

Tell the user, in plain words: paste the version for the model they use, generate, listen once, download the MP3, and send it back. If one sentence comes out wrong, regenerate just that paragraph in ElevenLabs and stitch it, or regenerate the whole thing. The aligner doesn't care about speed, only that the words match.

## 2. Aligning

`node scripts/align-vo.mjs video.html path/to/audio.mp3`

How it works:
1. ffmpeg finds every pause (default: quieter than −38 dB for at least 0.22 s).
2. **Scene boundaries** snap to the long pauses (paragraph breaks and `[pause]`), estimated from word counts and matched in order.
3. **Inside each scene**, chunk boundaries snap to the pauses at sentence and clause ends.
4. The real start/end of every chunk and each scene's length go into `<script id="ev-vo">`. The audio is copied next to the page as `voiceover.mp3`.

Everything keyed to `V`/`CUES` follows automatically: scene lengths, captions, camera, clicks, callouts and the SRT.

## 3. Reading the report

```
 4. CheckNumbers           starts  0:20  · 10.0 s
        c1       20.80 →   25.40  Check the three numbers first: …
      ~ c2       25.63 →   29.67  If any number drops…
```
- `~` means no pause was found at that boundary and its time is interpolated from word counts. That is usually fine inside a fast sentence. If it is a visible beat, check it.
- If one scene came out far too long or short, a scene boundary snapped to the wrong pause. Fixes, in order:
  - `--min-silence 0.3` (ignore short breaths) or `--min-silence 0.15` (the voice barely pauses).
  - `--noise -45` (a quiet recording) or `--noise -32` (background noise or music bed).
  - Split or merge chunks so boundaries fall at real sentence ends.
  - Regenerate the audio with clearer paragraph breaks (`[pause]` between scenes in v3).
- `--dry` prints the report without writing anything.

## 4. Checking the sync

Render stills at chunk starts (`export.mjs --stills chunks`): each frame's caption must match its label. Then open `video.html` in Chrome and listen through the walkthrough scenes. Clicks should land on the spoken button name, and zooms should arrive as the thing is named. To nudge one beat, change its offset (`V.c2 + 0.4` → `V.c2 + 0.9`). Never edit the measured times by hand.

## Without a voice-over

Leave `#ev-vo` empty. Timing comes from word counts (2.6 words/s), captions carry the message, and the MP4 is silent. You can still add a voice later: generate it from `voiceover-script.md` and align. Nothing else changes.
