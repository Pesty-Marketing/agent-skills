# Setup and command options

Each mockup skill is a standalone package. Installing one does not require the other.

Requirements: Node.js 20 or newer, npm, and a Playwright-compatible browser. This setup works on macOS, Windows, and Linux. Use the terminal's actual skill installation directory as the working directory; do not assume a particular agent directory.

Run once inside the installed skill folder:

```sh
npm ci
npm run setup
```

On Linux, browser libraries may also be needed:

```sh
npm run setup -- --with-deps
```

This may require system administrator access. Keep an existing working browser setup when available. To use installed Google Chrome rather than downloaded Chromium, set `MOCKUP_CHROME_CHANNEL=chrome` in the process environment.

Capture from the same skill folder:

```sh
npm run capture -- --url https://example.com/ --out ./output
```

The skill selects its own device by default. Both use headless rendering, so no browser window opens. A URL is still required when framing an existing screenshot because it supplies the address label.

| Option | Behavior |
| --- | --- |
| `--out DIRECTORY` | Save source PNG, framed PNG, self-contained HTML, and metadata here |
| `--width N --height N` | Change the content viewport; preserve its aspect ratio |
| `--slide` | Also export a centered mockup on a 3840 × 2160 slide |
| `--background '#ffffff'` | Set the mockup/slide background; default mockup is transparent |
| `--title TEXT` | Override the desktop tab title |
| `--scroll-to CSS_SELECTOR` | Bring a requested page section into the content viewport |
| `--hide CSS_SELECTOR` | Hide an identified overlay only in the capture session; repeat as needed |
| `--input SCREENSHOT.png` | Frame an existing PNG without fetching its URL; specify its intended CSS width/height if different from the defaults |

Inspect the current DOM before choosing overlay selectors. Keep meaningful page content visible. The screenshot helper captures one viewport; choose a section or separate captures for a long page rather than squeezing it into a normal frame. Title, address, and device controls are illustrative; the website pixels remain intact. Mobile capture uses Chromium emulation, not physical iPhone Safari.

The PNG must have the same aspect ratio as the chosen viewport. A 2880 × 1800 screenshot should use `--width 1440 --height 900` (or other dimensions with that same ratio). The renderer rejects mismatched ratios rather than stretching or cropping silently.

If the agent provides bundled Node packages, `MOCKUP_NODE_MODULES` or `NODE_PATH` can supply Playwright instead of a local npm installation. Local package dependencies take precedence. This is optional; the package does not require a Codex-specific tool.

Run `npm test` after setup to test live captures against a local fixture, transparency, slide dimensions, existing images, and error handling without external service credits.
