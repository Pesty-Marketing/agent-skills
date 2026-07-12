#!/usr/bin/env python3
"""Build the static catalog page for the Pesty agent-skills repo.

Parses each `<skill>/SKILL.md` YAML frontmatter (name, description), counts
reference files per skill, and renders `dist/index.html` from the template
string below. stdlib only. Deterministic: running this twice with unchanged
inputs produces byte-identical output.

Usage: python3 site/build.py
"""
import html
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SITE_DIR = Path(__file__).resolve().parent
DIST_DIR = SITE_DIR / "dist"

# Folders in the repo root that are not skills.
SKIP_DIRS = {"site", ".git", ".github"}

BADGES = ["Claude Code", "Cursor", "Codex", "Gemini CLI"]

GLOBAL_INSTALL_CMD = "npx skills add Pesty-Marketing/agent-skills -g"


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
        skills.append(
            {
                "folder": entry.name,
                "name": name,
                "description": description,
                "ref_count": count_reference_files(entry),
            }
        )
    return skills


def esc(s):
    return html.escape(s, quote=True)


def render_badges():
    return "".join(f'<span class="badge">{esc(b)}</span>' for b in BADGES)


def render_card(skill, index):
    name = skill["name"]
    desc = skill["description"]
    ref_count = skill["ref_count"]
    install_cmd = f'npx skills add Pesty-Marketing/agent-skills --skill "{name}" -g'
    code_id = f"cmd-skill-{index}"

    ref_html = ""
    if ref_count > 0:
        plural = "doc" if ref_count == 1 else "docs"
        ref_html = (
            f'<div class="ref-count">+ {ref_count} reference {plural}</div>'
        )

    return f"""      <article class="skill-card">
        <h3 class="skill-name">{esc(name)}</h3>
        <p class="skill-desc">{esc(desc)}</p>
        <div class="badge-row">{render_badges()}</div>
        {ref_html}
        <div class="code-row">
          <code id="{code_id}" class="code-block">{esc(install_cmd)}</code>
          <button class="copy-btn" type="button" onclick="copyCmd('{code_id}', this)">Copy</button>
        </div>
      </article>
"""


PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pesty Agent Skills</title>
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
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-12);
    max-width: 640px;
}

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

.getting-started {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-8);
    margin-bottom: var(--space-16);
}
.prereqs {
    margin: 0 0 var(--space-6);
    padding-left: var(--space-4);
    color: var(--text);
    font-size: var(--text-sm);
}
.prereqs li { margin-bottom: var(--space-1); }
.prereqs a { color: var(--blue); }

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
}
.skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-md);
    font-weight: 700;
    color: var(--white);
    margin: 0 0 var(--space-2);
}
.skill-desc {
    font-size: var(--text-sm);
    color: var(--text);
    margin: 0 0 var(--space-4);
    flex-grow: 1;
}
.badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
}
.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    background: var(--blue-dim);
    color: var(--blue);
}
.ref-count {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-bottom: var(--space-3);
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
</style>
</head>
<body>
<main class="container">
  <h1 class="page-title">Pesty Agent Skills</h1>
  <p class="page-subtitle">Shared skills for Claude Code, Cursor, Codex, and Gemini — one install, every agent.</p>

  <section class="getting-started">
    <h2 class="section-header">Getting Started</h2>
    <ul class="prereqs">
      <li>Node.js installed</li>
      <li>That&#x27;s it &mdash; the repo is public, no GitHub account needed</li>
    </ul>
    <div class="code-row">
      <code id="cmd-global" class="code-block">__GLOBAL_INSTALL_CMD__</code>
      <button class="copy-btn" type="button" onclick="copyCmd('cmd-global', this)">Copy</button>
    </div>
  </section>

  <h2 class="section-header">Skills</h2>
  <div class="card-grid">
__CARDS__
  </div>

  <footer>
    <p>Source: <a href="https://github.com/Pesty-Marketing/agent-skills">github.com/Pesty-Marketing/agent-skills</a> &mdash; add new skills there, not in <code>~/.claude/skills</code>.</p>
  </footer>
</main>
<script>
function copyCmd(id, btn) {
  var el = document.getElementById(id);
  var text = el.textContent;
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
</script>
</body>
</html>
"""


def build():
    skills = discover_skills()
    cards = "".join(render_card(s, i) for i, s in enumerate(skills))
    page = PAGE_TEMPLATE.replace("__CARDS__", cards.rstrip("\n"))
    page = page.replace("__GLOBAL_INSTALL_CMD__", esc(GLOBAL_INSTALL_CMD))

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DIST_DIR / "index.html"
    out_path.write_text(page, encoding="utf-8")
    print(f"Wrote {out_path} ({len(skills)} skills)")
    for s in skills:
        print(f"  - {s['name']} (refs: {s['ref_count']})")


if __name__ == "__main__":
    build()
