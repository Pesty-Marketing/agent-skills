#!/usr/bin/env node
// Write voiceover-script.md next to video.html: the narration ready to paste
// into ElevenLabs, generated from the same chunks the captions use (so the
// words match and align-vo.mjs can line them up afterwards).
//
//   node vo-script.mjs path/to/video.html
import fs from 'node:fs';
import path from 'node:path';
import { args, readVideo, countWords, fmt } from './lib.mjs';

const { pos } = args(process.argv.slice(2));
if (!pos[0]) { console.error('Usage: node vo-script.mjs video.html'); process.exit(1); }
const file = pos[0];
const { scenes, script, title } = readVideo(file);
const WPS = 2.6, LEAD = 0.5, TAIL = 0.7;

let acc = 0;
const rows = [], plain = [], v3 = [];
let totalWords = 0;
scenes.forEach((s, i) => {
  const chunks = script[s.name] || [];
  const w = chunks.reduce((a, c) => a + countWords(c[1]), 0);
  totalWords += w;
  const dur = s.dur != null ? s.dur : chunks.length ? LEAD + w / WPS + 0.3 * (chunks.length - 1) + TAIL : 4;
  rows.push(`| ${i + 1} | ${s.name} | ${s.chapter || ''} | ${fmt(acc)} | ${w} |`);
  acc += dur;
  if (!chunks.length) return;
  const text = chunks.map((c) => c[1].trim()).join(' ');
  plain.push(text);
  v3.push((s.tone ? `[${s.tone}] ` : '') + text);
});

const md = `# ${title} — voice-over script

About ${fmt(acc)} at a normal pace (${totalWords} words, ${WPS} words per second). If the recording comes out faster or slower, that is fine: \`align-vo.mjs\` moves the video to match the voice.

Keep the words exactly as written. The captions and the timing use these same sentences.

## ElevenLabs, plain text (models without audio tags)

Paste as is. One paragraph per scene.

${plain.join('\n\n')}

## ElevenLabs v3, with audio tags

Same words, with tone tags in brackets and a pause between scenes. v3 reads the tags as directions, not out loud.

${v3.join('\n\n[pause]\n\n')}

## Scene starts (estimated)

| # | Scene | Chapter | Starts | Words |
|---|---|---|---|---|
${rows.join('\n')}
`;
const out = path.join(path.dirname(path.resolve(file)), 'voiceover-script.md');
fs.writeFileSync(out, md);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${totalWords} words, ~${fmt(acc)})`);
