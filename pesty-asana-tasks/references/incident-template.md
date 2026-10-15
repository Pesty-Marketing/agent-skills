# Website incident template

Use this when something on a client website is **broken**. Title: `[TAG] P# | Short, observable description of the problem`, for example `[EX] P1 | Homepage form submits but no lead arrives`.

The task goes in the **DX** section of the client's main project.

## Description

Fill in each section that applies. Remove the ones that don't, rather than leaving placeholder text. Make each heading an `<h2>`.

```
Summary
  The main point in bold: what's broken, who it affects, and whether leads are affected right now.

What's happening
  The issue as a visitor or user would see it.

What should be happening
  The expected behaviour.

URLs / locations affected
  Links.

When first noticed
  Date and approximate time.

How widespread
  One page, several pages, or site-wide.

Evidence
  Screenshots, recordings, error messages.

Is this affecting leads or revenue right now?
  Yes, No or Unsure, with a sentence on why.

Client Override Documentation   (only if Client Override = Yes)
  - What did we recommend?
  - What did the client decide instead?
  - What tradeoffs did we communicate?
  - Proof the client acknowledged it (call recording link, email screenshot).
```

When the incident is resolved, add **Root cause**, **Resolution** (what changed, and how it was checked on the live site) and **Follow-up** (anything left to do, with the client's account manager mentioned or added as a follower). These additions to the description need approval like any other update.

If the incident covers several findings, put each one on its own line, starting with its severity and grouped under category headings. Findings at different severities go in separate tickets (see SKILL.md).

## Custom fields

| Field | How to set it |
|---|---|
| Incident Severity | P1 Critical, P2 High, P3 Medium or P4 Low, using the priority rules in SKILL.md. Must match the P# in the title |
| Severity Rationale | One sentence, e.g. "Primary contact form broken on the homepage" |
| Impact Type | Any that apply: Lead flow / revenue, Conversion, SEO, Performance / usability, Security, Admin / internal, Cosmetic |
| Primary Affected Area | Any that apply: Forms / lead capture, Hosting / infrastructure, Homepage, Landing pages, Blog, Site-wide, Third-party integration |
| Client Visibility | Public-facing or Internal-only |
| Workaround Available? | Yes, No or Unknown |
| Discovered By | Client, Internal QA, Account Manager, DXA Team or SEO Team |
| Client Override | Yes only if the client chose something other than what we recommended |
| Original Request Date | The date the issue was first reported |

## Response and resolution targets

Use these when setting the due date and when telling the team what to expect. **Don't paste this table into the ticket**: the ticket shows severity through the field and the title.

| Severity | Response | Resolution goal |
|---|---|---|
| P1 Critical | As soon as possible during support hours | Same business day |
| P2 High | Same business day | Within 24 hours (may run longer depending on scope) |
| P3 Medium | Within 24 hours | 5–15 business days |
| P4 Low | Within 24 hours | 5–15 business days |

Support hours are Monday to Friday, 8am–5pm Pacific. There's no after-hours expectation. P1 and P2 issues get updates at every major change or every 4 hours, whichever comes first.

A fix counts as done when the issue can no longer be reproduced, it has been checked on the relevant devices and browsers, and the conversion paths (forms, calls, navigation) have been confirmed working. Then the client gets a summary.
