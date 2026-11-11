# SOP playbook: from a process doc to a video

## The structure that works

1. **Why it matters** (10–15 s): the outcome and the stakes, in one or two sentences. Title card.
2. **The steps at a glance** (8–15 s): all steps as a flow or numbered list. The viewer gets the map before the trip.
3. **Walkthrough** (60–70% of the video): one scene per step, in the real tool. Each step is "where → what → check": where to click, what to do, how you know it worked.
4. **Rules and edge cases** (10–25 s): what never to do, what to do when X happens, who to escalate to. Rule cards.
5. **Recap** (5–10 s): a checklist of the steps, ticking off.
6. **Close** (4–8 s): who owns the SOP, where to ask, the version or date.

A simple SOP (3–5 steps) runs 1.5–2.5 min. A full tool tour runs 3–5 min. Longer than 5 min: split it into a series ("Part 1 · Setup", "Part 2 · Weekly routine").

## Turning the doc into chunks

- Read the whole SOP and list the steps, the decisions (if/then), the warnings and the owner.
- Cut what the video can't show and doesn't need (history, rationale paragraphs). Link to the doc in the close instead.
- Write for the ear: second person, present tense, one action per sentence. "Click Send report, and check who it goes to."
- Name controls exactly as the UI does, and say them the way people read them (`Send report`, not "the send button").
- Numbers in words when spoken ("twenty percent", "eleven on Monday"). Captions show them as written in the script, so write them the way you want them read aloud *and* displayed.
- Each chunk is 6–16 words, one idea, and fits in two caption lines. Split long sentences at a comma into two chunks (`c2`, `c2b`).
- Mark the moments the picture must hit: the words that name a button, a number or a rule. These become `V['id'] + offset` beats.

## Outline to show the user before building

| # | Scene | Chapter | On screen | Narration |
|---|---|---|---|---|
| 1 | Intro | 1 · Why it matters | Title "Send the weekly client report", sample report card | Every Monday, each client gets a short report… / Here's how to send it in about ten minutes. |
| 2 | Overview | 2 · The four steps | Flow: Open → Check → Note → Send | There are four steps. / Open the client, check the numbers, add your note, and send it. |
| 3 | OpenClient | 3 · Walkthrough | Admin: click Reports, spotlight the due rows, open Gulf Shore | In the Pesty admin, click Reports. / Clients due this week are at the top. Open the first one. |
| … | | | | |

Estimated length: total words ÷ 2.6 + about 1 s per scene.

## Scene naming

`PascalCase` names that say what happens (`OpenClient`, `CheckNumbers`, `Guardrails`), and chapters numbered for the viewer (`3 · Walkthrough`). Chunk ids: a scene letter + a number (`w1`, `w2`, `w2b`).

## When the SOP has branches

Show the main path in the walkthrough. Put the branches in a `Flow` with labelled edges ("No email on file → ask the AM"), or a `RuleCards` "If… then…" scene. Never walk through every branch in the UI.

## When the tool can't be shown

There may be no access and no screenshots, or the screens may hold sensitive data. Use motion graphics instead: a `Flow` of the process, `StepList` with icons, and mock cards that carry only the fields that matter. Say so in the outline so the user can send screenshots instead.
