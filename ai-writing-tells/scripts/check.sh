#!/usr/bin/env bash
# Flag AI-writing tells in a draft. Usage: check.sh FILE [FILE...]
# Works on .md, .html, .txt. Prints file:line:match per hit, then em-dash density.
# Exit 0 when no phrase hits, 1 when any file has hits (em-dash density is advisory).
set -u
PATTERNS=(
  # A. announcing significance
  'the distinction matters' 'matters more than it sounds' 'is not the only thing that matters'
  'worth reading twice' 'worth being blunt' 'worth knowing' 'it is worth noting' "it's worth noting"
  'the part that matters' 'and that is the point' 'changes the decision' "here's the thing"
  # B. pre-announced honesty
  'to be precise' 'to be clear' 'the honest version' 'honest counterweight' 'honestly, it depends'
  'we want to be careful' 'we will not claim' 'let me be direct' 'full disclosure' 'that way round'
  # C. antithesis
  'not just [a-z]+,? but' 'and that is exactly the problem' "it('s| is) not [a-z ]+\. it('s| is)"
  # D. false profundity
  'now put [a-z ]+ next to it' 'read that again' 'hold onto that' 'that is the whole story'
  # E. intensifiers / hedges
  '\bgenuinely\b' '\btruly\b' '\bmeaningful(ly)?\b' 'entirely possible that' '\barguably\b'
  'at the end of the day' 'make no mistake'
  # F. vocabulary
  '\bdelve' '\bleverag(e|es|ed|ing)\b' '\blandscape\b' '\bnavigat' '\brobust\b' '\bunderscore'
  '\bcrucial\b' '\bpivotal\b' '\btestament\b' '\bseamless' 'game-changer' 'double-edged'
  '\bnuanced\b' "in today's" 'the reality is'
)
joined=$(IFS='|'; echo "${PATTERNS[*]}")
status=0
for f in "$@"; do
  hits=$(grep -nEio "$joined" "$f")
  if [ -n "$hits" ]; then printf '%s\n' "$hits" | sed "s|^|$f:|"; status=1; fi
  words=$(sed 's/<[^>]*>//g' "$f" | wc -w | tr -d ' ')
  dashes=$(grep -o '—\|&mdash;' "$f" | wc -l | tr -d ' ')
  echo "$f: $dashes em-dashes / $words words (target ≤ 1 per 250 ≈ $(( words / 250 )))"
done
exit $status
