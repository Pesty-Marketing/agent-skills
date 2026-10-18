# ScreenshotAPI for hosted capture

Use the same renderer with `--provider screenshotapi` when the user chooses a hosted or batch workflow. The frames and output formats remain the same. This calls ScreenshotAPI's REST API; an MCP server is optional.

Set `SCREENSHOTAPI_TOKEN` in the process environment using the user's existing credential setup. Keep the key out of source files, prompts, generated HTML, and committed files. If unavailable, help the user obtain their own key from the ScreenshotAPI dashboard and configure it locally. A typical dashboard location is Settings → API Key; verify the current UI. Creating a new subscription or rolling an existing key is separate from capturing screenshots.

Run inside the installed skill folder:

```sh
npm run capture -- --url https://example.com/ --provider screenshotapi --out ./output
```

Use the same viewport and identified overlay selectors when comparing local and hosted output. Check the returned source dimensions and loading; options alone do not establish correct output. Hosted capture still needs local Playwright for deterministic frame export. Pass `--title` if the hosted image needs a custom desktop tab title.

A batch needs explicit URL scope, quota/budget awareness, and bounded concurrency. The helper processes one URL at a time; it does not schedule recurring jobs or buy credits. Requests render remotely, so websites may show different personalized content or tracking numbers than local sessions.

Official setup: https://www.screenshotapi.net/docs/getStarted
