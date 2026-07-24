---
name: website-launch-impact-report
description: "Build a client-facing before/after report answering whether a website relaunch or migration helped or hurt — SEO, conversions, and UX, pre-launch vs post-launch. Use when a site was relaunched, redesigned, or migrated to new URLs and someone asks 'did the new site help or hurt', 'new-site impact', 'before/after website report', or 'launch impact report for <client>'. Not for routine monthly SEO reporting or a report unconnected to a launch/migration event."
---

# Website Launch Impact Report

A before/after report anchored on a launch date: did the new site help or hurt? You compare a pre-launch window against an equal-length post-launch window across three lenses — **SEO** (Search Console), **conversions** (analytics + call tracking), and **UX** — and you split every lens by page type (money/service pages vs. blog), because a relaunch almost always moves those two groups in opposite directions.

A capable agent already knows the obvious moves: match window lengths, add a year-over-year window for seasonality, split branded vs. non-branded queries, confirm old URLs 301 to new ones and new ones are indexed, isolate organic from other channels, lead with a verdict and keep tables in an appendix, and recommend a 60/90-day re-check. **Do all that.** This skill exists for the five things that quietly wreck these reports if you don't know them — they are the reason to read on.

## The five things that go wrong

### 1. The last few days of Search Console data are incomplete — and will flip your verdict
Search Console backfills for roughly **3–4 days**: the most recent days under-report and revise *upward* later. If your post-launch window ends on "yesterday," you are comparing a complete pre-launch window against a post-launch window whose tail is missing data — understating post-launch and manufacturing a false decline.

- **Probe the latest fully-settled date** before fixing the window. Query the daily series and end the post window on the last day that isn't still climbing — don't assume a fixed lag, and don't just use today minus N.
- **Label the read.** If the window necessarily includes still-settling days, say so in the report: "conservative floor, will rise" vs. "settled picture." Then **re-pull and redeploy ~4+ days after the post window closes** — that later pull is the real story, not the first one.
- This is not the same as the 60/90-day ranking-maturity re-check. This is days, not weeks, and it's about *data completeness*, not *ranking re-settling*. You need both.
- **The shorter the post window, the more this bites.** Those 3–4 settling days are noise in a three-month window but 15–20% of a three-week one — and "we just relaunched, how's it doing?" (asked days in) is both the most common request and the most fragile. Widen the window if you can; if you can't, mark the whole report preliminary and commit in writing to the re-pull.

> Real case: a first-day read showed non-branded impressions **down ~9%**; a re-pull two days later, once Search Console settled, showed them **up ~17%**. The sign flipped. Never treat the first pull as final.

### 2. If URLs changed, matching pages by their new path silently misfiles every old page
When a relaunch changes slugs (e.g. `/miami-fl-pest-control/` → `/service-areas/miami-pest-control/`, or blog posts dropping a dated segment), grouping or comparing pages by their **post-launch** path dumps every **pre-launch** URL into "other." The visible symptom is a fake finding like "service-area pages went from 6 to 1,400" — the pages existed all along under old slugs; only the classifier was wrong. It also breaks per-page matched-pair comparison (every migrated page looks brand-new).

Build a **slug-stable page key** that maps a page to the *same* identity before and after the move, and make your group classifier recognize **both** the old and new slug forms. Match pages by that key, not by raw URL.

```python
# One shared classifier, used everywhere you group or compare pages.
# group_of(url) -> which reporting group ("service_areas" / "blog" / "other"),
#                  recognizing BOTH old root-level slugs and new /service-areas/ ones.
# page_key(url) -> a slug-stable identity so a page that changed URL at launch
#                  keeps ONE key (old and new map together), enabling matched pairs.
#
#   /service-areas/miami-pest-control/  and  /miami-fl-pest-control/  -> "sa:miami-pest-control"
#   /blog/2024/november/foo/            and  /blog/foo/               -> "blog:foo"
#
# Normalize cosmetic launch-time cleanups too, or you get false negatives:
# strip trailing/leading hyphens, and strip a prefix like /services/ if
# top-level pages moved under it. Getting this normalization right is what
# turns a false "78% of blog pages lost" into the true retention number.
```

Once pages are keyed, add the redirect + indexation audit the obvious checklist already calls for — but now it's per-matched-page (did *this* page's equity survive?), which is the question the client actually has.

### 3. An instant, identical step-change at cutover is a tracking artifact, not real UX
The dangerous UX metric is one that jumps the moment the new site goes live and jumps **identically across every device**. Engagement rate doubling and pages-per-session doubling at the exact cutover, same on mobile and desktop, is a tagging/config change (new template, new measurement setup), not users suddenly loving the site. Report it as real and you've lied to the client.

Gate every UX metric with a **cutover step-test**: if a metric shows a sustained, instant level-shift at the launch date (rather than a gradual move), exclude it from the verdict and instead *show the step as evidence of the tagging change*. Metrics that move gradually (e.g. average engaged time) are the ones you can trust. If load-speed data (Core Web Vitals) isn't available, say you couldn't measure it — don't proxy it with a tainted engagement metric.

### 4. Write the client copy with zero internal-context hedging
The client never saw your analysis history, your earlier draft, or the classification bug you fixed. Phrases that reference that history read as confusing non-sequiturs. Ban them:

- ❌ "Now that we know these pages existed before…" / "these pages already existed" / "not old pages mistaken for new ones" / "contrary to what it first looked like"
- ✅ State the fact plainly: "At launch these pages moved from old URLs to the new structure, and impressions held roughly steady."

If a sentence only makes sense to someone who watched you correct a mistake, delete the framing and keep the fact.

### 5. Report the gaps honestly instead of hiding or dressing them up
- **No pre-launch baseline?** An event that only started firing at launch (a new form-submit event) has no "before." Report it as "new, no baseline" — never as `0 → N` growth, which fakes an infinite lift.
- **Small volumes?** Single- and low-double-digit counts are "directional only, not statistically robust." Label them so; don't build a headline on ten phone clicks.
- **Pre-existing trend?** If organic was already declining (or rising) year-over-year before the launch, show that as context and say plainly the launch didn't cause it — don't let the launch take blame or credit for a trend that predates it.

## Reparameterize for each client
The report is the same shape every time; these knobs change. Establish all of them before pulling data:

| Knob | Notes |
|---|---|
| Search Console property | Domain property (`sc-domain:…`) vs. URL-prefix (`https://…/`) — affects the query and whether www/protocol variants are covered. |
| Analytics property ID | Or none — some clients have no GA at all; then conversions come from call tracking / events only. |
| Brand-term regex | Splits branded from non-branded. Mind spelling variants (e.g. "defense" vs. "defence"). |
| Launch/cutover date | Threaded through every window and every sentence of copy. |
| Window length + refresh cadence | Equal pre/post lengths; plan the ~4-day-later re-pull (gotcha #1) and the 60/90-day re-check. |
| Did URLs migrate? | If yes → you need the slug-stable page key (gotcha #2) and the redirect/indexation audit. If no → skip both. |
| Call tracking present? | If yes → **first** confirm the dynamic-number swap survived the launch; a broken swap target silently misattributes calls. Restrict post-launch call attribution to swap-independent sources, or use all-channel totals only. If no → conversions are analytics events only. |
| Geo/state filter? | Some clients scope analytics to operating states; others don't — check account-manager notes, prior audits, or the analytics property config to decide. |

## Deliverable
One **self-contained single-file HTML** page — all CSS/JS/images inline, no CDN or external fonts, charts as inline SVG (not a JS chart library). It has to render years from now with nothing to fetch.

Structure it as a **plain-language story first**: did it work → by how much → where the leads come from → what's next. Push methodology, matched-pair tables, and caveats into a collapsible "for those who want the detail" section at the bottom. If you use reveal-on-scroll animations, add a no-JS / ~3-second failsafe that shows all content — a client must never land on a blank section.

Deploy the file to the client's static host and purge the CDN/reverse-proxy cache, then verify a cache MISS on the bare URL (a 200 alone doesn't prove freshness — a proxy will serve stale). Exact host, credentials, and purge command are environment-specific — keep them in your project's own instructions (e.g. your repo's CLAUDE.md or deploy script), not here.

## This template is still converging
This pattern has been built a handful of times and is deliberately **not** yet frozen into one parameterized codebase — each real client run is still teaching us what's core vs. bespoke. When you build one, fork the most complete existing internal instance rather than starting fresh, and note what you reused unchanged vs. what you had to build custom (a new geo filter, a different migration mapping, a missing data source). Once a couple more runs agree on the shape, it's worth extracting a config-driven template. Until then, favor copying the latest instance and reparameterizing over rebuilding.
