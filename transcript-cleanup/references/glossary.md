# The glossary

The glossary is the transfer of judgment from the reviewer to the drafter. Everything the
drafter fixes silently, it fixes because a line here told it to; everything else it flags.

## Sources of truth, in order

1. The user's note ("speaker is X, title I think is Y").
2. The user's calendar entry or the meeting's attendee list.
3. A client or team roster (names the recognizer reliably mangles).
4. What the room says — an audience member's "Mr. Bond", a moderator's introduction.
5. The public record — a web search on the facts stated on stage (the company sold, the year,
   the buyer). Confirm spelling from the person's own site or profile.

What none of these settle stays flagged. A flagged unknown is recoverable; a plausible guess
is not.

## Format

One file, three parts. Keep entries as `garbled → intended`; the drafter applies them
literally.

```markdown
# Glossary — <talk> (garbled → intended). Verified facts at bottom.

## Speaker / event (verified <date>, <how>)
- Speaker: **Jon Bond**, co-founder, Kirshenbaum Bond & Partners — identified from "Mr. Bond" in
  the Q&A; sale to MDC Partners (2004) confirmed by web search.
- "curry bambond" / "Christian Gambon" → Kirshenbaum Bond
- "Jay Shai" → Jay Chiat (Chiat/Day)
- "Steve Fick" → unresolved; keep as "Steve Fick [?]"

## Terms
- "parados principle" / "Paris, principal" → Pareto principle
- "six pin shirts" → six constraints (he lists five; the sixth is garbled — keep the flag)
- "XKS" → an acronym for cut, delegate, systematize — render "[garbled — an acronym]" then the words

## Numbers / phrases
- "sign 20, 50, 80 K a month" → save $20K, $50K, $80K a month
- "I think ownership, X buds would pass to a million" → garbled; flag with a likely reading
- Recording begins mid-sentence. Speaker labels: **Audience:** / **Ross:**.
```

## What goes in

- Every proper noun the recognizer mangled, with the intended spelling.
- Domain terms it turned into sound-alikes (EBITDA, LOI, P&L, KPI, CAC, LTV, Pareto).
- Repeated verbal tics rendered several ways ("shit rolls uphill" arrived four ways in one talk).
- Figures whose units or magnitude were dropped. Restore a unit only when explicit source
  wording or user confirmation establishes it. Agency-revenue context alone does not justify
  changing "$50 a month" to "$50K a month"; keep the uncertainty flagged.
- Passages that do not parse, so the drafter flags rather than smooths them.
- Speaker labels and any name the speaker uses for an audience member.

Run `scripts/glossary_candidates.py <raw>` first to surface candidate tokens and figures; inspect RAW for omissions (and `scripts/locate.py <raw> "<phrase>"` when a flag needs a locator for the Open questions list);
it lists candidates, it does not resolve them.
