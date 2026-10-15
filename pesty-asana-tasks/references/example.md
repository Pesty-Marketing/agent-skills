# Example ticket

A complete incident ticket written to the skill's standard. The client, people, numbers and links are made up. Copy the **shape**, not the content: main point first, sections a reader can scan, a table for items with several attributes, conditions someone can check under "Done when", and terms defined for a reader with no background.

## The draft as shown to the user for approval

- **Title:** `[EX] P2 | Quote form leads from 2 of 5 locations aren't reaching the office`
- **Project / section:** Example Pest Co → DX (also added to Dev Team Backlog)
- **Assignee:** the developer. **Due:** tomorrow, per the P2 resolution goal. *(Both chosen by the agent, so the user can change them.)*
- **Followers:** none until approved.
- **Fields:**
  - Incident Severity: P2 – High
  - Severity Rationale: "Two locations' quote-form leads go to an inbox nobody checks. Phone leads are unaffected."
  - Impact Type: Lead flow / revenue
  - Primary Affected Area: Forms / lead capture
  - Client Visibility: Public-facing
  - Workaround Available?: Yes
  - Discovered By: Account Manager
  - Client Override: No
  - Original Request Date: the day it was reported
- **Subtasks:** one per open item, each starting with the decision or action it needs.

## Description (`html_notes` source)

```xml
<body><h2>Summary</h2><strong>Quote form submissions from the Northside and Lakeview pages are being sent to an old inbox, so the office hasn't seen them since the 3rd. 3 of 5 locations are fixed. Two still need a change in the form settings.</strong>
<ul><li><strong>Fixed:</strong> Downtown, Eastgate and Riverside now send to the office inbox. Checked with a test submission on each live page.</li><li><strong>Left:</strong> Northside and Lakeview still send to the old inbox. Both are subtasks below.</li><li><strong>Workaround:</strong> the account manager forwards the old inbox to the office every morning until this is closed.</li></ul>

<h2>Why this matters</h2>Each location page has its own quote form. When a visitor submits it, the form emails the lead to whatever address is in that form's <strong>notification settings</strong>. If that address is wrong, the lead is sent but nobody acts on it, and the client loses the job without knowing.

<h2>What's left (subtasks)</h2><ol><li><strong>Update the Northside form notification</strong> to the office inbox, then send a test submission.</li><li><strong>Update the Lakeview form notification</strong> the same way. Its form is a copy of Northside's, so check that both show the new address.</li></ol>

<h2>Already fixed</h2><table><tr><td><strong>Location</strong></td><td><strong>Change</strong></td><td><strong>Checked</strong></td></tr><tr><td>Downtown</td><td>Notification moved to the office inbox</td><td>Test lead received</td></tr><tr><td>Eastgate</td><td>Notification moved to the office inbox</td><td>Test lead received</td></tr><tr><td>Riverside</td><td>Notification moved to the office inbox</td><td>Test lead received</td></tr></table>

<h2>Done when</h2><ul><li>A test submission on all five location pages arrives in the office inbox.</li><li>Leads that went to the old inbox since the 3rd have been forwarded to the client, and the client has been told.</li><li>The daily forwarding workaround has been switched off.</li></ul>

<h2>Key terms</h2><ul><li><strong>Notification settings:</strong> the part of the form builder that decides which email address receives each submission.</li><li><strong>Old inbox:</strong> the address the forms used before the client changed email providers.</li></ul>

<h2>Links</h2><ul><li><a href="https://example.com/northside">Northside location page</a></li><li><a href="https://example.com/lakeview">Lakeview location page</a></li></ul></body>
```

## Why it works

- The bold summary answers the reader's first questions straight away: what's wrong, how far along the fix is, and whether leads are still being lost.
- Each item under "What's left" is a subtask, so progress shows in Asana without anyone reading the description.
- "Done when" turns closing the task into a checklist instead of a judgment call.
- Nothing in it assigns blame or guesses at causes, so the client can read it safely.
