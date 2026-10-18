---
name: mobile-mockup
description: Create presentation-ready website screenshots inside an iPhone mockup, including a visible device bezel and mobile browser controls. Use for mobile mockups, iPhone-framed screenshots, and phone website previews from a URL or existing screenshot.
---

# Mobile Mockup

Create a real website screenshot inside a black iPhone with bezel, Dynamic Island, status bar, Safari-style controls, and shadow. Deliver the framed image; a raw screenshot alone is incomplete.

## Defaults

Use local headless Chromium, a 390 × 760 content viewport, 2× capture/export, and transparent PNG output. Use the requested URL's hostname in the frame. Save in the task's output directory or a new folder under `~/Documents/website-mockups/`.

Use ScreenshotAPI when the user chooses scale, batch/hosted capture, or explicitly requests it. Read [hosted capture](references/hosted.md) for that branch. Creating a paid plan or subscription requires a separate request.

## Create

1. Resolve the target URL from the user or current artifact. Ask only if no target is available.
2. Find this skill's installation directory. For first use, follow [setup](references/setup.md): Node.js 20+, `npm ci`, then `npm run setup`. Each skill contains its own renderer and assets; it works independently of the other mockup skill. Existing bundled Playwright packages are optional.
3. From this skill folder run:

   ```sh
   npm run capture -- --url https://example.com/ --out ./output
   ```

   Substitute the actual URL and output directory. Run `node scripts/capture.cjs --help` for supported options. The browser runs in the background without a visible window.
4. Inspect `capture.png` and `mockup.png`. Verify the real page, loaded fonts/images, correct address, complete frame, preserved proportions, and unobstructed content. Read back dimensions and transparency. A blocked or incomplete page is a failed capture, not a successful mockup.
5. Return the mockup inline and link the PNG. Link `slide.png` when requested. Retain the source capture, self-contained HTML, and metadata beside it.

## Customize

Read [command options](references/setup.md#setup-and-command-options) for viewport dimensions, a requested page section, an existing PNG, background color, or a 4K slide export. Inspect the current DOM before using `--hide` to suppress an obstructive popup or chat widget only within the capture session. Preserve meaningful page content.

The helper captures one viewport. For a full-page request, choose a section, separate captures, or an explicitly tall frame; preserve readable proportions. Existing images must match the intended viewport aspect ratio, which the helper checks.

Keep website pixels intact through deterministic HTML/CSS framing. The iPhone hardware and Safari controls are illustrative; page content is Chromium mobile emulation. Use a separate device workflow when actual iPhone Safari rendering matters. Personalized content and tracking numbers may vary between sessions. Use consistent capture preparation for comparisons.
