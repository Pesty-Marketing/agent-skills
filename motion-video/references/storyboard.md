# storyboard.json

The storyboard is the contract between the user and the render. Scene `id`s link three things: the `<section class="scene" data-scene="id">` in `video.html`, the clips in `timings.json`, and the still names.

```json
{
  "title": "Native Pest Management case study",
  "slug": "native-case-study",
  "preset": "story",
  "theme": "pesty",
  "sizes": ["16x9", "9x16"],
  "narration": true,
  "captions": ["9x16"],
  "voice": "optional ElevenLabs voice id (default comes from the theme)",
  "min_px": 30,
  "loop": false,
  "sources": ["https://… every claim traces to one of these"],
  "scenes": [
    {"id": "hook", "narration": "…", "screen": "what is on screen", "dur": 6}
  ]
}
```

| field | meaning |
|---|---|
| `scenes[].narration` | The spoken line. The scene lasts 0.4 s + the audio length + 0.7 s, or `dur` if that's longer. |
| `scenes[].dur` | Seconds. Required for silent scenes. For narrated scenes it's a minimum. |
| `scenes[].screen` | Notes for you and the user. The renderer ignores it. |
| `scenes[].still` | Seconds into the scene to take its still and run the fit checks (default: 75% of the way in). Set it when a scene is mid-transition at 75%. |
| `captions` | `true` burns captions into every size, a list burns them into only those sizes (for example `["9x16"]` for feeds that autoplay muted), and `false` burns in none. `captions.srt` is written whenever the video is narrated. |
| `read_wps` | Reading speed for the `read` gate, in words a second (default 3). Lower it for an older audience or a screen seen from far away. Never raise it to pass a failing video. |
| `loop` | Defaults to `true` for the loop preset. The last scene fades out so the end matches the start, and a gate checks the seam. |

## Writing scenes

- **One scene, one idea.** If you can't say what the viewer learns from the scene in a short sentence, split it.
- **Narration:** write it the way a person talks, one or two sentences per scene, about 2.5 words per second.
  - Numbers are written the way they should be said: "$18.1 million", not "$18.1M".
  - Run the `ai-writing-tells` check on narration before voicing it, if that skill is installed.
- **On-screen words** are not a transcript of the narration. Show the number, the name or the three-word version.
- **Length:**
  - loops: 20–40 s, 5–8 scenes of about 5 s each
  - walkthroughs: 45–120 s
  - stories and social clips: 30–90 s
- **For approval,** show the user a table with these columns: # | id | on screen | narration | seconds. Show only that table. Show no HTML until they approve it.
