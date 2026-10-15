---
name: pesty-asana-tasks
description: "Create, update, or comment on Pesty Marketing Asana tasks, including website incident and website enhancement tickets. Use whenever someone asks to make a task or ticket, log something in Asana, file an incident, update or reassign an Asana task, or comment on one, even if they don't mention best practices. Not for reading Asana to prepare meetings or reports."
---

# Pesty Asana Tasks

Pesty's Asana boards are shared with the whole team, and clients can see them. A task has to make sense to a reader with no background, look professional to the client, and give whoever picks it up enough to act on without asking questions.

## Approval gate: draft first, write after approval

Nothing gets written to Asana until the user has approved that exact change. This applies to:

- **Creating** a task or subtask.
- **Updating** an existing task: title, description, custom fields, assignee, due date, section, followers or completion status.
- **Commenting.**

Show the draft in the conversation. Then wait.

- **For a new task:** title, project and section, assignee, due date, every custom field value and the full description.
- **For an update:** each changed value as before → after.
- **For a comment:** the full text.

Write relative dates such as "next Friday" as an exact date with the weekday. If the user changes the draft, show it again and wait again. Approval covers only the draft it was given for, not later changes.

If the user shares a Slack thread, an email or notes **without** asking for tasks, don't draft any. List what could become a task and let the user choose.

## Choose the mode

| Mode | Use when | Title |
|---|---|---|
| Standard | Content, SEO, account-management or other work that isn't a website defect or website change | `[TAG] Action-oriented description` |
| Website Incident | Something on the website is **broken**: a page, form, feature or integration doesn't work as intended | `[TAG] P# \| Short, observable description of the problem` |
| Website Enhancement | The client wants something on the website **added or improved**. Nothing is broken | `[TAG] P4 \| Short description of what's being added or changed` |
| Update | Changing a task that already exists | Keep the title format the task already uses |
| Comment | Reporting progress or an outcome on an existing task | — |

For an incident, read [references/incident-template.md](references/incident-template.md) before drafting. For an enhancement, read [references/enhancement-template.md](references/enhancement-template.md). Before any write, read [references/asana-formatting.md](references/asana-formatting.md), because Asana rejects or garbles most HTML.

## Titles

- Every title starts with the client tag, for example `[EX] Fix homepage form`.
- **Don't put `[Website Incident]` or `[Website Enhancement]` in the title.** Those labels belong to the Asana templates. On a real task, the client tag replaces them: the DX section and the custom fields already show what kind of task it is.
- Describe what can be observed, not who caused it. Write "Homepage form submits but no lead arrives", not "Dev broke the form".
- If you edit a description through the API, check the title again afterwards. Asana can strip bracketed text from the title when the description changes.

**Client tag.** Tags aren't listed here. Look up the tag each time:

1. Find the client's main project. Skip projects whose names contain Blog, Website Build, CRO or QA.
2. Read its recent task titles. The prefix in square brackets that appears most often, usually 1–5 letters, is the tag.
3. If no prefix clearly dominates, or the client has no project, ask the user.

## Priority (P1–P4)

Incident and enhancement titles both carry a priority. It comes from Pesty's Incident Severity & Response Policy, which judges business impact:

| P# | Name | Use when |
|---|---|---|
| P1 | Critical | Lead flow is broken, users are blocked, the site is fully or partly down, the admin is unusable, or there's a security risk. Examples: a form not submitting, the site down, hosting limits exceeded |
| P2 | High | Major harm to conversion, rankings or usability that doesn't stop revenue completely. Examples: broken navigation, CTAs pushed below the fold, severe Core Web Vitals failures tied to rankings |
| P3 | Medium | A local or non-critical problem with a workaround and no proven effect on revenue, SEO or trust |
| P4 | Low | Cosmetic changes, enhancements and nice-to-haves |

For incidents, adjust the level up or down using these signals:

- Raise the level for: a live or upcoming campaign; a high-traffic or primary conversion page; site-wide impact; compliance or security implications; no workaround; a visible brand or trust error (wrong phone number, business name, pricing or license information).
- Lower it for: low-traffic areas, a clear workaround, cosmetic-only impact, no evidence of an effect on KPIs.
- PageSpeed scores alone never set severity. Impact does.
- **Enhancements are always P4,** and the signals above don't apply to them. If the client asks for one sooner or clearly signals urgency, the task gets the **Client-Prioritized** Asana tag and keeps P4. Client priority changes the order work is done in, not the severity. If you can't tell whether the client is asking for urgency, ask the user.
- Explain the level in one sentence in the Severity Rationale field.

## Findings at different severities

If one incident turns up findings at more than one severity level, create **one ticket per severity level**. Then the P# in each title is true for everything in that ticket, and urgent items don't wait behind cosmetic ones.

Before drafting, ask the user whether the tickets should be **subtasks** of one parent task or **separate tasks**. If they choose subtasks, propose the parent in the draft as well. Give it a title in the same format, carrying the highest severity among its subtasks. Inside each ticket, put each finding on its own line, starting with its severity, grouped under category headings. Don't merge findings into paragraphs.

## Writing descriptions and comments

**Use the Pyramid Principle.** If the `pyramid-principle` skill is installed, use it. If not, follow this order:

1. **The main point first**, in bold: the bottom line or the decision needed.
2. **Supporting points**: the reasons, the parts of the work, or the open items.
3. **Evidence** under the point it supports: URLs, screenshots, data, dates.

Format it so a person can scan it: short `##` headings, bullet lists, numbered steps, and tables for lists of items with several attributes. Keep paragraphs short. A teammate with no background should understand the task in 30 seconds.

- **Client-safe.** The client may read it. No blame, no internal jargon, no guessing about causes. Write "The current implementation needs to be updated", not "the site is a mess".
- **Matched to the assignee.** Developer: exact URLs, element names, and expected versus actual behaviour, with no backstory. Designer: the visual goal, reference examples and brand constraints. SEO: target keywords, URLs and current performance. Account manager: plain language, focused on the client relationship and what they need to do.
- **Define the terms** the reader may not know, and **link** the sources: audit sheets, Slack threads, related tasks.
- For multi-part work, include a **Done when** section with conditions the reader can check.

[references/example.md](references/example.md) shows a complete ticket written this way. Read it when drafting an incident or enhancement description.

**Comments.** After multi-step work on a task, post **one** comment at the end that says what was done and what happens next. Don't post one comment per step: readers then have to piece the current state together. Comments go through the approval gate too.

## Fields and placement

- Fill in every custom field you can decide. Leave a field on its default only when you really don't know the value.
- Put the task in the right section of the client's main project. Website incidents and enhancements go in **DX** unless the work belongs to a section with its own owner, such as CRO or SEO.
- Add every ticket a developer will work on to the **Dev Team Backlog** project as well.
- Set the assignee and a due date, and say in the draft which ones you chose yourself so the user can change them. Don't add followers until the user approves, so nobody gets notified about a draft.

## Before you write

- [ ] The user approved this exact draft.
- [ ] The title starts with the client tag from the client's main project.
- [ ] Incident or enhancement titles have `P# |` and no `[Website Incident]` or `[Website Enhancement]`.
- [ ] Findings at different severities are in separate tickets, and the user chose subtasks or separate tasks.
- [ ] The description leads with the main point, is easy to scan, and is safe for the client to read.
- [ ] The template was used for an incident or enhancement, and every field that can be decided is filled in.
- [ ] The markup follows [references/asana-formatting.md](references/asana-formatting.md).
