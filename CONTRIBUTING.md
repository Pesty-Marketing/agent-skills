# Writing a Great Skill

How to add a skill to this repo that agents actually find, load, and follow. The
mechanical steps are in the [README](README.md#adding-a-new-skill); this is the
craft guide. Distilled from Anthropic's skill-authoring best practices, the
agentskills.io spec, Matt Pocock's ["The Missing Manual" talk](https://www.youtube.com/watch?v=UNzCG3lw6O0)
(trigger/structure/steering/pruning checklist), and lessons from building the
seven skills already here.

## What a skill is (and isn't)

A skill is a reusable reference guide that teaches an agent a technique, a
framework, or a workflow — StoryBrand's SB7, the 5 Rings persona method, our
frontend design system. It gets used across many projects by many people.

**Make a skill when:**
- The technique wasn't obvious — you'd want it again without re-deriving it
- It applies across clients/projects, and teammates would benefit
- It needs judgment an agent must be taught (frameworks, taste, process)

**Don't make a skill for:**
- One-off solutions or a story about how you solved something once
- Project-specific conventions (those belong in that project's instructions file)
- Things a linter or script could enforce mechanically — automate those instead

## Anatomy and the three loading levels

```
skill-name/
├── SKILL.md          # required: frontmatter + instructions
├── references/       # optional: deep docs, loaded only when needed
└── scripts/          # optional: bundled executable helpers
```

Agents load skills in three stages, and this shapes everything about how you write:

1. **`name` + `description`** — loaded into *every* session, for *every* skill.
   This is all the agent sees when deciding whether to open your skill.
2. **SKILL.md body** — loaded only when the skill triggers. Keep it lean;
   every token competes with the user's actual conversation.
3. **`references/` files** — loaded individually, only when the body points to
   them. Effectively unlimited depth lives here.

Rule of thumb: description sells it, body steers it, references carry the weight.

**Level 1 isn't free.** Every skill's description loads into *every* session —
that's context load the agent pays whether or not the skill is used. Seven
skills is cheap; seventy isn't. A skill only ever invoked deliberately by its
owner (a personal workflow, a leadership-only process) can opt out of
auto-triggering where the agent supports it (`disable-model-invocation: true`
in Claude Code) — the trade is context load for cognitive load: the agent no
longer carries the description, but now *you* have to remember the skill
exists. Team skills in this repo should stay model-invoked; just make the
call consciously.

## The description — the 500 characters that matter most

The description is the *only* thing an agent reads before deciding to use your
skill. A great skill with a weak description never runs.

**Formula: what it does + when to use it (+ when not to).**

```yaml
# ✅ Good — what, modes, concrete trigger phrases, and a "not for"
description: Apply the StoryBrand SB7 framework to create or evaluate
  customer-facing copy. Two modes — Write (homepage, landing page, email, ad,
  one-liner) and Audit (review existing copy against SB7 checklist). Invoke
  when user says "use StoryBrand," "SB7," or requests help with brand
  messaging, homepage copy, or marketing copy where narrative structure
  matters. Not for blog posts, SEO articles, or general writing.

# ❌ Bad — no trigger conditions, agent can't tell when it applies
description: A framework for marketing copy.
```

Guidelines:

- **Be generous with triggers.** Agents under-trigger skills. List the phrases
  and situations that should activate it, including ones where the user doesn't
  name the skill ("help with my homepage copy" should hit storybrand).
- **Name what it's NOT for** when it borders on a sibling skill (see how
  `ui-design` points general work to itself and Pesty work to `pesty-design`).
- **Never summarize the internal workflow.** Testing shows agents will follow a
  workflow summary in the description *instead of reading the skill body*. Say
  what and when — never how.
- **Third person, under ~500 characters** if you can (hard cap 1024).
- **Quote the YAML value if it contains `#`, `:`, or other YAML-special
  characters** — an unquoted `#` silently truncates the description.

## Writing the body

- **Assume the agent is smart.** Don't explain what a homepage or a PDF is.
  Only add what the agent doesn't already know: your framework, your standards,
  your sequence. Challenge every paragraph: "does this justify its tokens?"
- **Imperative voice, explained.** "Score each section against the checklist"
  beats "you should probably consider scoring…". And explain *why* things
  matter instead of stacking ALL-CAPS MUSTs — a reason generalizes; a bare
  rule invites lawyering.
- **Use modes when a skill does more than one thing.** Our skills open with a
  "Mode Detection" section (Write vs. Audit) so the agent commits to a lane
  before working. Steal that pattern.
- **One excellent example beats five mediocre ones.** Real, complete, showing
  the pattern — not fill-in-the-blank templates in three languages.
- **Match specificity to fragility.** Judgment calls get heuristics; fragile,
  must-not-vary operations get an exact script or template ("use this exact
  structure"). Don't write loose guidance for brittle steps or rigid recipes
  for creative ones.
- **Stay agent-neutral.** This repo serves Claude Code, Cursor, Codex, and
  Gemini CLI. No `/slash-command` syntax, no Claude-only tool names
  (WebSearch, Task) — say "search the web," "fetch the page." (We had to
  scrub all of these once already.)
- **Keep SKILL.md under ~500 lines.** Approaching the limit? Move depth into
  `references/` with a clear pointer for each file: what's in it and when to
  read it. Unpointed reference files never get read.
- **Split references by branch.** The deciding question for what stays inline:
  does *every* run of the skill need it? Material used on every pass (a
  template the skill always fills) belongs in SKILL.md; material only one mode
  or branch touches (the Audit rubric, one framework's deep-dive) moves to
  `references/` behind its pointer. That's why `ui-design` is a router over
  six files while a single-purpose skill can be one self-contained page.
- **Bundle scripts for repeated mechanical work.** If every use of the skill
  would rewrite the same helper, ship it in `scripts/` and tell the body to
  run it (see `yt-structure/scripts/`). State prereqs (e.g. yt-dlp) plainly.

## Steering — when the agent won't do what the skill says

Two techniques for the classic failure "I wrote it in the skill and the agent
ignored it":

- **Leading words.** Pack the behavior you want into a short, well-known term
  and repeat it consistently through the skill. "Vertical slice" beats a
  paragraph of "don't build layer by layer; get something small working
  end-to-end first" — the term triggers everything the agent already knows
  about the concept. Our skills lean on this already (SB7, Mode Detection,
  5 Rings); do it on purpose. **Verification is built in:** watch the agent's
  reasoning — when the technique lands, the agent echoes your term back
  ("doing this as a thin vertical slice") while it works. If your term never
  shows up in its thinking, it isn't steering; pick a stronger one.
- **Manage leg work by hiding the goal.** Agents under-invest in early steps
  when they can see the finish line — "ask clarifying questions, then write
  the plan" reliably produces two shallow questions and an eager plan. When a
  step needs real effort, split it into its own skill (or its own explicit
  gate) so the agent sees only the current phase, not the payoff after it.

## Pruning — keep the skill honest

Big skills are a symptom. Three failure modes to sweep for, especially on
skills an agent helped write:

- **No-ops — run the deletion test.** For each paragraph ask: would the agent
  behave any differently if this were deleted? "Write a clear commit message"
  fails the test — agents do that anyway. Delete what doesn't change behavior.
- **Sediment.** Shared docs accrete additions nobody feels brave enough to
  delete. If material is stale or only relevant to one branch, move it to
  that branch's reference file or kill it — don't let it pile up in SKILL.md.
- **Duplication.** Every fact, template, and rule gets one home. If the same
  guidance appears in the body and a reference file, one of them is wrong
  by the next edit.

## Test before you ship

An untested skill is a guess. Minimum bar — takes ten minutes:

1. **Trigger test.** Fresh agent session, phrase a task the way a teammate
   naturally would — *without* naming the skill. Does the agent reach for it?
   If not, your description needs richer triggers.
2. **Follow test.** Run 2–3 realistic prompts through the skill and read the
   output against what you intended. Watch for the agent skipping sections of
   your body — skipped sections are usually buried or unnecessary.
3. **Fix and re-run.** Edits count as changes; re-test them.

For heavier iteration (side-by-side baseline comparisons, description
optimization), Anthropic's `skill-creator` plugin in Claude Code automates the
loop — worth it for skills the whole team will lean on.

## Shipping checklist

- [ ] Kebab-case folder; frontmatter `name` matches it exactly
- [ ] Description: what + when + trigger phrases (+ not-for); YAML-safe quoting
- [ ] Body lean and agent-neutral; references pointed-to; scripts' prereqs stated
- [ ] Pruning pass: deletion-test every paragraph (no no-ops), no duplication,
      branch-only material moved to `references/`
- [ ] Trigger-tested and follow-tested in a fresh session; leading words show
      up in the agent's reasoning
- [ ] **No secrets, client credentials, or internal-only material** — this repo
      is public. Sensitive/Andrew-only skills stay out entirely.
- [ ] Add a `HUMAN_COPY` entry in `site/build.py` (title, category, tagline,
      example prompt) — without it the catalog card falls back to raw
      frontmatter with a build warning
- [ ] `python3 site/build.py && bash site/deploy.sh` to refresh the catalog
- [ ] Commit + push (`gitleaks protect --staged` first)
- [ ] Re-run the install command so your agents pick it up:
      `npx skills add Pesty-Marketing/agent-skills -g`

## Exemplars in this repo

- **`storybrand`** — trigger-rich description with a "not for" clause, clean
  Write/Audit mode detection, scoring rubric in `references/`
- **`ui-design`** — big framework split across six pointed reference files;
  SKILL.md stays a router
- **`yt-structure`** — bundled script with stated prereqs; description built
  around real trigger phrases
