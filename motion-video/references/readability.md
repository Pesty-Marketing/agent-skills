# Readability by preset

`render.py` enforces the minimum text size, the frame fit and reading time. Everything else here is judgment, and you check it on the stills.

## Reading time (every preset)

Viewers watch muted, and on-screen text has to be readable without the narration. The `read` gate simulates one viewer who reads every text block once, in the order blocks appear, at 3 words a second (about 180 words a minute; storyboard `read_wps` changes it). A block fails when it leaves the screen before that viewer could finish it.

- **It counts all text on screen, not per scene.** Three blocks that land together are read one after another, so a stat, its label and a footnote need the sum of their reading times.
- **Word-by-word reveals** count from when the first word lands, and the viewer can't finish before the last word lands.
- **Burned-in captions** are skipped, because they follow the narration. Glyphs with no letter or digit (✓ → •) aren't words.
- **Fixing a failure**, in order of preference:
  1. Raise the scene's `dur`. For a narrated scene, `dur` is a minimum, so this holds the frame after the last spoken word.
  2. Cut words on screen. On-screen text is the three-word version, not the transcript.
  3. Stagger less text into the same moment.
- **Never** put `data-read-ok` on a claim, number or call to action to get past the gate.
- **Length:** don't trim a case study to hit a target length. The default for case studies is the full cut, with every claim held long enough to read. Make a short cut only when asked, by dropping whole scenes or stats, never by speeding the rest up.

## loop: screens people walk past (3–10 ft, no sound)

- **Text size:** 56px minimum, enforced. Headlines are 120–150px.
  - To judge a still at 10 ft, shrink it to 480px wide. Anything you can't read at that size, a passer-by can't read either.
- **Words:** about 7 per scene. A viewer gets 2–3 seconds before walking on.
- **Persistent band:** keep the "what this is" line and the QR code on screen the whole time, in a `.band` along the bottom with `--bottom-reserve` on `<body>`. Whichever second someone looks up, they see what it is and how to act.
- **Opening:** start with the question the viewer already has, and with motion: a city name swapping, numbers counting.
- **Contrast:** use the dark body class (`<body class="preset-loop dark">`), which holds up best on booth TVs.
- **QR codes:**
  - The band QR is at least 230px. The end card has a big one, 400px or more.
  - Keep the URL short so the code has fewer, bigger squares.
- **Seam:** the loop must end on the state it starts on. The seam gate checks this.

## walkthrough: a real tool, step by step

- **Screens:** use real captures only, at 2x density, so a zoom stays sharp.
- **Zoom:** zoom (`data-cam`) to the field or button being talked about. A full-page screenshot at 1080p is unreadable on video.
- **One action per scene:** move the cursor, click, then show the result. Time the click to the spoken verb: `click` on the step whose `t=@click`.
- **Highlights:** use a `.hl` box or a `.callout` for anything the narration names. The dimmed surround tells the viewer where to look.
- **Labels:** a step label (`.step`) plus a 3–6 word instruction beside the screen.
- **Login details:** hide cookie banners and chat widgets with `capture.py --hide`. Never show real customer data. Use a demo account or blur it.

## story: case studies and results

- **Lead with the result:** before → after, counting up. The story behind it comes after.
- **Claims:** every number and claim matches the source exactly. Say what happened, and add no "because of us" the source doesn't state.
- **Big numbers:** use `.stat` or `.ba`, one per scene, timed to the moment the narrator says the number (`data-in="@18.1"`).
- **Ending:** end on the logo, one call to action and the URL. Don't add a second call to action.
- **9:16:** check the portrait stills separately. Stacked layouts need `.only-portrait` copy that's shorter, not the landscape copy squeezed in.
