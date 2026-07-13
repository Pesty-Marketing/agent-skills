#!/usr/bin/env python3
"""Build the static catalog page for the Pesty agent-skills repo.

Parses each `<skill>/SKILL.md` YAML frontmatter (name, description), counts
reference files per skill, and renders `dist/index.html` from the template
string below. stdlib only. Deterministic for a given day: the footer stamps
the build date, everything else is byte-identical across runs with unchanged
inputs.

Card copy: SKILL.md descriptions are written for AI agents, so each card
shows human-facing copy from HUMAN_COPY below (title, tagline, category,
example prompt) and tucks the agent description + install command behind a
details disclosure. When adding a skill, add its HUMAN_COPY entry too —
otherwise the card falls back to the raw agent description and the build
prints a warning.

Usage: python3 site/build.py
"""
import datetime
import html
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SITE_DIR = Path(__file__).resolve().parent
DIST_DIR = SITE_DIR / "dist"

# Folders in the repo root that are not skills.
SKIP_DIRS = {"site", ".git", ".github"}

AGENTS = ["Claude Code", "Cursor", "Codex", "Gemini CLI"]

GLOBAL_INSTALL_CMD = "npx skills add Pesty-Marketing/agent-skills -g"

# Category -> design-system accent token pair (chip text / chip background).
CATEGORIES = {
    "Writing & Messaging": ("var(--blue)", "var(--blue-dim)"),
    "Research": ("var(--purple)", "var(--purple-dim)"),
    "Design & Build": ("var(--green)", "var(--green-dim)"),
    "Content Ops": ("var(--amber)", "var(--amber-dim)"),
    "New": ("var(--text-secondary)", "var(--surface-raised)"),
}

# Human-facing card copy, keyed by skill folder name.
HUMAN_COPY = {
    "ann-handley": {
        "title": "Everybody Writes",
        "category": "Writing & Messaging",
        "tagline": "Make any marketing copy sound human — blogs, emails, social — using Ann Handley's rules.",
        "prompt": "Use the ann-handley skill to punch up this email draft.",
    },
    "buyer-personas": {
        "title": "Buyer Personas",
        "category": "Research",
        "tagline": "Turn real call transcripts and reviews into a persona built on what actually drives buyers.",
        "prompt": "Use the buyer-personas skill to build a persona from these sales call transcripts.",
    },
    "pesty-frontend": {
        "title": "Pesty Frontend",
        "category": "Design & Build",
        "tagline": "Build dashboards and client reports in our dark-navy design system — on-brand by default.",
        "prompt": "Use the pesty-frontend skill to build a one-page KPI dashboard from this data.",
    },
    "storybrand": {
        "title": "StoryBrand (SB7)",
        "category": "Writing & Messaging",
        "tagline": "Write or audit homepage, landing-page, and ad copy so the customer is the hero and the message is clear.",
        "prompt": "Use the storybrand skill to audit the copy on this homepage.",
    },
    "storytelling": {
        "title": "Science of Storytelling",
        "category": "Writing & Messaging",
        "tagline": "Give founder stories, About pages, and case studies a real narrative arc that keeps people reading.",
        "prompt": "Use the storytelling skill to turn these notes into a founder story.",
    },
    "ui-design": {
        "title": "UI Design",
        "category": "Design & Build",
        "tagline": "Design or audit any interface — layout, type, color, forms — against professional UI standards.",
        "prompt": "Use the ui-design skill to review this screenshot of our signup page.",
    },
    "yt-structure": {
        "title": "YouTube to Markdown",
        "category": "Content Ops",
        "tagline": "Turn a YouTube video, talk, or article into a clean, citable Markdown doc for a knowledge library.",
        "prompt": "Use the yt-structure skill to structure this YouTube video: <link>",
    },
}


def parse_frontmatter(text):
    """Extract simple `key: value` pairs from a leading YAML frontmatter block.

    Handles unquoted scalars and double-quoted scalars with escaped quotes
    (the only two forms used in this repo's SKILL.md files). Not a general
    YAML parser.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return {}
    fields = {}
    key = None
    for line in lines[1:end]:
        m = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if m:
            key = m.group(1)
            raw = m.group(2).strip()
            fields[key] = _unquote(raw)
        elif key is not None:
            # continuation line (not used by current SKILL.md files, but
            # handled defensively so a future multi-line value doesn't
            # silently vanish).
            fields[key] = (fields[key] + " " + line.strip()).strip()
    return fields


def _unquote(raw):
    if len(raw) >= 2 and raw[0] == '"' and raw[-1] == '"':
        inner = raw[1:-1]
        return inner.replace('\\"', '"')
    return raw


def count_reference_files(skill_dir):
    refs_dir = skill_dir / "references"
    if not refs_dir.is_dir():
        return 0
    return sum(1 for p in refs_dir.rglob("*") if p.is_file())


def discover_skills():
    skills = []
    for entry in sorted(REPO_ROOT.iterdir(), key=lambda p: p.name):
        if not entry.is_dir():
            continue
        if entry.name in SKIP_DIRS or entry.name.startswith("."):
            continue
        skill_md = entry / "SKILL.md"
        if not skill_md.is_file():
            continue
        fm = parse_frontmatter(skill_md.read_text(encoding="utf-8"))
        name = fm.get("name", entry.name)
        description = fm.get("description", "")
        copy = HUMAN_COPY.get(entry.name)
        if copy is None:
            print(f"WARNING: no HUMAN_COPY entry for '{entry.name}' — "
                  f"card falls back to the agent-facing description. "
                  f"Add one in site/build.py.")
            copy = {
                "title": name,
                "category": "New",
                "tagline": description,
                "prompt": "",
            }
        skills.append(
            {
                "folder": entry.name,
                "name": name,
                "description": description,
                "ref_count": count_reference_files(entry),
                **copy,
            }
        )
    # Group cards by category so related skills sit together.
    order = list(CATEGORIES)
    skills.sort(key=lambda s: (order.index(s["category"]), s["name"]))
    return skills


def esc(s):
    return html.escape(s, quote=True)


def render_card(skill, index):
    name = skill["name"]
    install_cmd = f'npx skills add Pesty-Marketing/agent-skills --skill "{name}" -g'
    code_id = f"cmd-skill-{index}"
    prompt_id = f"prompt-skill-{index}"
    color, bg = CATEGORIES[skill["category"]]

    prompt_html = ""
    if skill["prompt"]:
        prompt_html = f"""        <div class="prompt-row">
          <div class="prompt-label">Try this prompt</div>
          <div class="prompt-line">
            <span id="{prompt_id}" class="prompt-text">&ldquo;{esc(skill["prompt"])}&rdquo;</span>
            <button class="copy-btn" type="button" onclick="copyCmd('{prompt_id}', this)">Copy</button>
          </div>
        </div>
"""

    ref_count = skill["ref_count"]
    ref_note = ""
    if ref_count > 0:
        plural = "guide" if ref_count == 1 else "guides"
        ref_note = f"<p class=\"detail-refs\">Ships with {ref_count} reference {plural} the agent reads as it works.</p>"

    return f"""      <article class="skill-card">
        <div class="card-top">
          <span class="chip" style="color:{color};background:{bg}">{esc(skill["category"])}</span>
          <code class="skill-slug">{esc(name)}</code>
        </div>
        <h3 class="skill-title">{esc(skill["title"])}</h3>
        <p class="skill-desc">{esc(skill["tagline"])}</p>
{prompt_html}        <details class="skill-details">
          <summary>Details &amp; solo install</summary>
          <p class="detail-desc">{esc(skill["description"])}</p>
          {ref_note}
          <div class="code-row">
            <code id="{code_id}" class="code-block">{esc(install_cmd)}</code>
            <button class="copy-btn" type="button" onclick="copyCmd('{code_id}', this)">Copy</button>
          </div>
        </details>
      </article>
"""


# UTM convention for the page template below: any future outbound link added
# to the <footer> (or elsewhere in this template) that points at a
# pestymarketing.com page OTHER than this catalog page itself should append
# utm_source=agent-skills-catalog&utm_medium=web&utm_campaign=agent-skills.
# The GitHub/CONTRIBUTING links currently in the footer are external and
# stay plain. No such internal links exist yet, so nothing is added here.
PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pesty Agent Skills</title>
<meta name="description" content="The skills Pesty Marketing's AI agents run on — one command installs them into Claude Code, Cursor, Codex, and Gemini CLI.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root {
    /* Background & Surfaces */
    --bg: #001c28;
    --surface: rgba(255, 255, 255, 0.035);
    --surface-hover: rgba(255, 255, 255, 0.06);
    --surface-raised: rgba(255, 255, 255, 0.055);
    --surface-raised-hover: rgba(255, 255, 255, 0.08);

    /* Borders */
    --border: rgba(255, 255, 255, 0.07);
    --border-subtle: rgba(255, 255, 255, 0.04);

    /* Text Hierarchy */
    --text: #c8d3dc;
    --text-secondary: #9ab3c2;
    --text-tertiary: #5e8899;
    --white: #eef2f6;

    /* Semantic Colors */
    --accent: #e04560;
    --green: #34d399;
    --blue: #60a5fa;
    --amber: #f59e0b;
    --red: #e04560;
    --purple: #a78bfa;

    /* Semantic Dim (12% opacity backgrounds) */
    --accent-dim: rgba(224, 69, 96, 0.12);
    --green-dim: rgba(52, 211, 153, 0.12);
    --blue-dim: rgba(96, 165, 250, 0.12);
    --amber-dim: rgba(245, 158, 11, 0.12);
    --red-dim: rgba(224, 69, 96, 0.12);
    --purple-dim: rgba(167, 139, 250, 0.12);

    /* Typography */
    --font-display: 'Epilogue', sans-serif;
    --font-body: 'Montserrat', sans-serif;
    --font-mono: 'Space Mono', monospace;

    --text-xs: 11px;
    --text-sm: 13px;
    --text-md: 15px;
    --text-lg: 28px;

    /* Spacing (8pt grid) */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-6: 24px;
    --space-8: 32px;
    --space-12: 48px;
    --space-16: 64px;
    --space-20: 80px;

    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-full: 9999px;

    /* Transitions */
    --transition-fast: 110ms ease;
    --transition-std: 150ms ease;
    --transition-slow: 200ms ease;

    /* Layout */
    --container-width: 1200px;
    --container-padding: 24px;

    /* Shadows (navy-tinted) */
    --shadow-card: 0 1px 3px rgba(0, 35, 48, 0.06), 0 4px 12px rgba(0, 35, 48, 0.04);
    --shadow-elevated: 0 4px 16px rgba(0, 35, 48, 0.12), 0 8px 32px rgba(0, 35, 48, 0.08);
}
*, *::before, *::after { box-sizing: border-box; }
body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
}
:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
.container { max-width: var(--container-width); margin: 0 auto; padding: 48px var(--container-padding) 80px; }

.page-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 32px;
    color: var(--white);
    letter-spacing: -0.5px;
    margin: 0 0 8px;
}
.page-subtitle {
    font-size: var(--text-md);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
    max-width: 720px;
}
.works-with {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 var(--space-12);
}
.works-with strong { color: var(--text-secondary); font-weight: 600; }

.title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-4);
}
.agency-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 6px 12px;
    margin-top: 4px;
    text-decoration: none;
    white-space: nowrap;
    transition: background-color var(--transition-std), color var(--transition-std), border-color var(--transition-std);
}
.agency-badge:hover { background: var(--surface-raised-hover); color: var(--white); border-color: rgba(255, 255, 255, 0.12); }

.lead-capture {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-6);
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-6) var(--space-8);
    margin: 0 0 var(--space-8);
}
.lead-capture-copy { flex: 1 1 320px; }
.lead-capture-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    color: var(--white);
    margin: 0 0 var(--space-1);
}
.lead-capture-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    max-width: 480px;
}
.lead-form {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    flex: 1 1 360px;
    max-width: 420px;
}
.lead-input {
    flex: 1;
    min-width: 180px;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--white);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
}
.lead-input::placeholder { color: var(--text-tertiary); }
.lead-input:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
.lead-submit {
    flex-shrink: 0;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--bg);
    background: var(--accent);
    border: 1px solid var(--accent);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-4);
    cursor: pointer;
    white-space: nowrap;
    transition: background-color var(--transition-std), border-color var(--transition-std);
}
.lead-submit:hover { background: #ec5c76; border-color: #ec5c76; }
.lead-capture-secondary {
    flex-basis: 100%;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0;
}
.lead-capture-secondary a { color: var(--text-secondary); }
.lead-capture-secondary a:hover { color: var(--white); }

.value-strip {
    margin-top: var(--space-16);
    padding: var(--space-4) var(--space-6);
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: center;
}
.value-strip a { color: var(--white); font-weight: 600; text-decoration: underline; }
.value-strip a:hover { color: var(--text-secondary); }

.section-header {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-left: var(--space-3);
    border-left: 3px solid var(--accent);
    margin: 0 0 var(--space-4);
}

.how-it-works {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-8);
    margin-bottom: var(--space-16);
}
.steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--space-6);
}
.step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    background: var(--accent-dim);
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    margin-bottom: var(--space-2);
}
.step-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--text-md);
    color: var(--white);
    margin: 0 0 var(--space-2);
}
.step-body { margin: 0 0 var(--space-3); color: var(--text); }
.step-note { font-size: var(--text-xs); color: var(--text-tertiary); margin: var(--space-2) 0 0; }

.code-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
}
.code-block {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green);
    overflow-x: auto;
    white-space: pre;
}
.copy-btn {
    flex-shrink: 0;
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-3);
    cursor: pointer;
    transition: background-color var(--transition-std), color var(--transition-std), border-color var(--transition-std);
}
.copy-btn:hover { background: var(--surface-raised-hover); color: var(--white); }
.copy-btn.copied { color: var(--green); border-color: var(--green-dim); background: var(--green-dim); }

.how-it-works .code-block { white-space: pre-wrap; word-break: break-word; }

.example-prompt {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-style: italic;
}

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-4);
    padding-top: var(--space-8);
    border-top: 1px solid var(--border-subtle);
}
.skill-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-6);
    box-shadow: var(--shadow-card);
    transition: background-color var(--transition-std), border-color var(--transition-std);
}
.skill-card:hover { background: var(--surface-raised-hover); border-color: rgba(255, 255, 255, 0.12); }
.card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
}
.chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
}
.skill-slug {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
}
.skill-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    color: var(--white);
    letter-spacing: -0.2px;
    margin: 0 0 var(--space-2);
}
.skill-desc {
    font-size: var(--text-sm);
    color: var(--text);
    margin: 0 0 var(--space-4);
    flex-grow: 1;
}
.prompt-row {
    background: var(--surface);
    border: 1px solid var(--border-subtle);
    border-left: 3px solid var(--accent);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    margin-bottom: var(--space-3);
}
.prompt-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--space-1);
}
.prompt-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}
.prompt-text {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-style: italic;
}
.skill-details summary {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    cursor: pointer;
    transition: color var(--transition-std);
}
.skill-details summary:hover { color: var(--text-secondary); }
.skill-details[open] summary { margin-bottom: var(--space-3); }
.detail-desc {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-3);
}
.detail-refs {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-3);
}
.skill-card .code-row { padding: var(--space-2) var(--space-3); }
.skill-card .code-block { font-size: 10px; }

footer {
    margin-top: var(--space-16);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-subtle);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
}
footer a { color: var(--text-secondary); }
footer p { margin: 0 0 var(--space-2); }
</style>
</head>
<body>
<main class="container">
  <div class="title-row">
    <h1 class="page-title">Pesty Agent Skills</h1>
    <a class="agency-badge" href="https://pestymarketing.com/?utm_source=agent-skills-catalog&amp;utm_medium=web&amp;utm_campaign=agent-skills" target="_blank" rel="noopener">Built by Pesty Marketing &#x2197;</a>
  </div>
  <p class="page-subtitle">The skills our team&#x27;s AI agents run on &mdash; StoryBrand copy audits, buyer personas, UI reviews, on-brand dashboards, and more. One command installs all of them into every agent on your machine.</p>
  <p class="works-with">Works in <strong>Claude Code &middot; Cursor &middot; Codex &middot; Gemini CLI</strong></p>

  <!-- Email capture wired to beehiiv (The Pesty Playbook, pub_85b456ee-aaa7-46fe-ade2-fcfb25f36000)
       via its magic-link subscribe endpoint. Plain GET form -> works with JS fully disabled (the
       browser builds the query string from the named inputs itself; no submit handler needed).
       beehiiv shows its own branded one-click confirm page, then bounces back here with
       ?subscribed=1 (plus an appended &email=... we don't need). The inline script below only
       swaps this band's copy on that return -- it never touches the submit path. -->
  <section class="lead-capture" id="lead-capture">
    <div class="lead-capture-copy" id="lead-capture-copy">
      <h2 class="lead-capture-title">Get new skills as we ship them</h2>
      <p class="lead-capture-sub">We add a new skill every few weeks. Drop your email and we&#x27;ll let you know &mdash; no spam, unsubscribe anytime.</p>
    </div>
    <form class="lead-form" id="lead-form" action="https://magic.beehiiv.com/v1/85b456ee-aaa7-46fe-ade2-fcfb25f36000" method="get">
      <input type="hidden" name="redirect_to" value="https://pestymarketing.com/agent-skills/?subscribed=1">
      <input class="lead-input" type="email" name="email" placeholder="you@company.com" required aria-label="Email address">
      <button class="lead-submit" type="submit">Notify me</button>
    </form>
    <p class="lead-capture-secondary">Running a pest control company and want more than skills? <a href="https://pestymarketing.com/?utm_source=agent-skills-catalog&amp;utm_medium=web&amp;utm_campaign=agent-skills" target="_blank" rel="noopener">Talk to Pesty &rarr;</a></p>
  </section>

  <section class="how-it-works">
    <h2 class="section-header">How it works</h2>
    <div class="steps">
      <div class="step">
        <span class="step-num">1</span>
        <h3 class="step-title">Install once</h3>
        <p class="step-body">Copy this into your terminal. Only prereq is Node.js &mdash; no GitHub account needed.</p>
        <div class="code-row">
          <code id="cmd-global" class="code-block">__GLOBAL_INSTALL_CMD__</code>
          <button class="copy-btn" type="button" onclick="copyCmd('cmd-global', this)">Copy</button>
        </div>
      </div>
      <div class="step">
        <span class="step-num">2</span>
        <h3 class="step-title">Open your agent</h3>
        <p class="step-body">Claude Code, Cursor, Codex, or Gemini CLI &mdash; every skill is now available in all of them, automatically.</p>
        <p class="step-note">Re-run the install command anytime to pull the latest versions.</p>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        <h3 class="step-title">Ask for a skill by name</h3>
        <p class="step-body example-prompt">&ldquo;Use the storybrand skill to audit the copy on this homepage.&rdquo;</p>
        <p class="step-note">Every card below has a ready-to-paste example prompt.</p>
      </div>
    </div>
  </section>

  <h2 class="section-header">Skills</h2>
  <div class="card-grid">
__CARDS__
  </div>

  <section class="value-strip">
    <p style="margin:0">Pesty Marketing is a pest-control marketing agency &mdash; these are the frameworks our own team&#x27;s agents run on for real client work. <a href="https://pestymarketing.com/?utm_source=agent-skills-catalog&amp;utm_medium=web&amp;utm_campaign=agent-skills" target="_blank" rel="noopener">Talk to Pesty &rarr;</a></p>
  </section>

  <footer>
    <p>Updated __UPDATED__ &middot; MIT license &middot; Source: <a href="https://github.com/Pesty-Marketing/agent-skills">github.com/Pesty-Marketing/agent-skills</a></p>
    <p>Want to add a skill? Read the <a href="https://github.com/Pesty-Marketing/agent-skills/blob/main/CONTRIBUTING.md">skill-writing guide</a> and add it in the repo (not <code>~/.claude/skills</code>) &mdash; or drop skill ideas in #pesty-crew.</p>
    <p>Built by Pesty Marketing, a pest-control marketing agency &rarr; <a href="https://pestymarketing.com/?utm_source=agent-skills-catalog&amp;utm_medium=web&amp;utm_campaign=agent-skills" target="_blank" rel="noopener">pestymarketing.com</a></p>
  </footer>
</main>
<script>
function copyCmd(id, btn) {
  var el = document.getElementById(id);
  var text = el.textContent.replace(/^\\u201c|\\u201d$/g, '');
  var done = function () {
    var original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }
}

(function () {
  // Runs on return from the beehiiv subscribe redirect (see the lead-capture
  // form comment above). Swaps the band's copy in place; the submit path
  // itself never depends on this script.
  if (new URLSearchParams(window.location.search).get('subscribed') !== '1') return;
  var copy = document.getElementById('lead-capture-copy');
  var form = document.getElementById('lead-form');
  if (copy) {
    copy.innerHTML = '<h2 class="lead-capture-title">You&#39;re on the list.</h2>'
      + '<p class="lead-capture-sub">We&#39;ll email you when the next skill ships.</p>';
  }
  if (form) { form.style.display = 'none'; }
})();
</script>
</body>
</html>
"""


def build():
    skills = discover_skills()
    cards = "".join(render_card(s, i) for i, s in enumerate(skills))
    page = PAGE_TEMPLATE.replace("__CARDS__", cards.rstrip("\n"))
    page = page.replace("__GLOBAL_INSTALL_CMD__", esc(GLOBAL_INSTALL_CMD))
    page = page.replace("__UPDATED__", datetime.date.today().strftime("%B %Y"))

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DIST_DIR / "index.html"
    out_path.write_text(page, encoding="utf-8")
    print(f"Wrote {out_path} ({len(skills)} skills)")
    for s in skills:
        print(f"  - {s['name']} [{s['category']}] (refs: {s['ref_count']})")


if __name__ == "__main__":
    build()
