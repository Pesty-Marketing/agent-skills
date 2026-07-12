# Pesty Agent Skills

Cross-agent skills for the Pesty Marketing team, in the open [Agent Skills](https://agentskills.io) format — one folder per skill, each with a `SKILL.md` (plus optional `references/`). Works with Claude Code, Cursor, Codex, Gemini CLI, and any other agent that reads the spec.

Browse the catalog: **pestymarketing.com/internal/agent-skills/**

## Install

Prereqs: Node.js. The repo is public — anyone (team or clients) can install.

Install everything into every agent on your machine (recommended — symlinks one canonical copy into each agent's skills directory):

    npx skills add Pesty-Marketing/agent-skills -g

Install a single skill:

    npx skills add Pesty-Marketing/agent-skills --skill "yt-structure" -g

Update later by re-running the same command.

## Skills

| Skill | What it does |
|---|---|
| `ann-handley` | Create or audit marketing content with the Everybody Writes framework |
| `brand-identity` | Build or audit a pest-control client brand identity (Wheeler ideals) |
| `buyer-personas` | Build decision-focused buyer personas from real inputs (5 Rings method) |
| `pesty-frontend` | Pesty dashboards/internal tools in the dark-navy design system |
| `storybrand` | Write or audit customer-facing copy with the StoryBrand SB7 framework |
| `storytelling` | Long-form narrative copy via Will Storr's Science of Storytelling |
| `ui-design` | Build or audit interface designs (general-purpose, not Pesty-specific) |
| `yt-structure` | Turn a YouTube video/talk/article into a clean, citable Markdown doc |

Notes:
- `brand-identity` expects the `brand-builder` asset repo at `~/Projects/Pesty/brand-builder/`.


## Adding a new skill

1. Create `<skill-name>/SKILL.md` in this repo (kebab-case folder; frontmatter needs `name` matching the folder and a `description` that says what it does **and when to use it** — that's all agents see before loading it). Put supporting docs in `<skill-name>/references/`.
2. Commit and push.
3. Regenerate the catalog page: `python3 site/build.py && bash site/deploy.sh`.
4. Everyone picks it up on their next `npx skills add Pesty-Marketing/agent-skills -g`.

Don't create skills loose in `~/.claude/skills/` — this repo is the source of truth.
