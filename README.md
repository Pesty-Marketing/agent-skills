# Pesty Agent Skills

Built and battle-tested by [Pesty Marketing](https://pestymarketing.com?utm_source=github&utm_medium=readme&utm_campaign=agent-skills), a pest-control marketing agency — these are the actual frameworks we run client work through.

Cross-agent skills for the Pesty Marketing team, in the open [Agent Skills](https://agentskills.io) format — one folder per skill, each with a `SKILL.md` (plus optional `references/`). Works with Claude Code, Cursor, Codex, Gemini CLI, and any other agent that reads the spec.

Browse the [full skill catalog](https://pestymarketing.com/agent-skills/?utm_source=github&utm_medium=readme&utm_campaign=agent-skills).

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
| `buyer-personas` | Build decision-focused buyer personas from real inputs (5 Rings method) |
| `pesty-design` | The default Pesty design system — colors, type, components, and UI kit for on-brand pages, prototypes, and interfaces |
| `storybrand` | Write or audit customer-facing copy with the StoryBrand SB7 framework |
| `storytelling` | Long-form narrative copy via Will Storr's Science of Storytelling |
| `ui-design` | Build or audit interface designs (general-purpose, not Pesty-specific) |
| `yt-structure` | Turn a YouTube video/talk/article into a clean, citable Markdown doc |

> **Deprecated:** `pesty-frontend` (dark-navy internal-tools system) was superseded by `pesty-design` as the default on 2026-07-17. Its folder stays in the repo as reference for maintaining the existing dark-navy dashboards, but it's excluded from the catalog and no longer installed by default.

## Adding a new skill

**Read [CONTRIBUTING.md](CONTRIBUTING.md) first** — it covers how to write a skill agents actually find and follow (description formula, structure, testing). The mechanics:

1. Create `<skill-name>/SKILL.md` in this repo (kebab-case folder; frontmatter needs `name` matching the folder and a `description` that says what it does **and when to use it** — that's all agents see before loading it). Put supporting docs in `<skill-name>/references/`.
2. Add a `HUMAN_COPY` entry for it in `site/build.py` (title, category, tagline, example prompt).
3. Commit and push.
4. Regenerate the catalog page: `python3 site/build.py && bash site/deploy.sh`.
5. Everyone picks it up on their next `npx skills add Pesty-Marketing/agent-skills -g`.

Don't create skills loose in `~/.claude/skills/` — this repo is the source of truth.

## License

MIT — see [LICENSE](LICENSE).

---

If these are useful to you, we'd appreciate a ⭐ and a link back. Browse the [full skill catalog](https://pestymarketing.com/agent-skills/?utm_source=github&utm_medium=readme&utm_campaign=agent-skills) for more.
