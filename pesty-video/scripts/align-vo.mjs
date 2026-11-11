#!/usr/bin/env node
// Measure where every voice-over chunk is spoken in the recorded audio and
// write those times into video.html (<script id="ev-vo">). Every beat keyed to
// V['id'] / CUES then follows the real voice.
//
//   node align-vo.mjs path/to/video.html path/to/voiceover.mp3 [--noise -38] [--min-silence 0.22] [--dry]
//
// How: ffmpeg finds the pauses; the chunk boundaries are first estimated from
// word counts, then snapped to the nearest real pause (dynamic programming,
// in order, longer pauses preferred). Boundaries with no pause nearby keep a
// word-proportional estimate and are flagged "~" in the report.
import fs from 'node:fs';
import path from 'node:path';
import { args, ffmpegPath, run, readVideo, writeBlock, countWords, fmt } from './lib.mjs';

const { pos, o } = args(process.argv.slice(2));
if (pos.length < 2) { console.error('Usage: node align-vo.mjs video.html voiceover.mp3 [--noise -38] [--min-silence 0.22] [--dry]'); process.exit(1); }
const [htmlFile, audioIn] = pos;
const NOISE = Number(o.noise || -38), MIN_SIL = Number(o['min-silence'] || 0.22);
const LEAD = 0.35, TAIL = 1.6;

const { html, scenes, script } = readVideo(htmlFile);
const htmlDir = path.dirname(path.resolve(htmlFile));

// audio next to the page (so the preview, the artifact and the exporter all find it)
let audioPath = path.resolve(audioIn);
if (path.relative(htmlDir, audioPath).startsWith('..')) {
  const dest = path.join(htmlDir, 'voiceover' + path.extname(audioPath).toLowerCase());
  fs.copyFileSync(audioPath, dest); audioPath = dest;
  console.log(`Copied the audio next to the page: ${path.basename(dest)}`);
}
const audioRel = path.relative(htmlDir, audioPath).split(path.sep).join('/');

// chunks in order + guard: every voiced scene must come before any silent tail
const chunks = [];
let seenSilentGap = null;
for (const s of scenes) {
  const list = script[s.name] || [];
  if (!list.length) { seenSilentGap = seenSilentGap || s.name; continue; }
  if (seenSilentGap) { console.error(`Scene "${seenSilentGap}" has no voice-over but comes before "${s.name}", which does. With a voice-over, every scene needs at least one line, except silent scenes at the very end.`); process.exit(1); }
  for (const [id, text] of list) chunks.push({ id, scene: s.name, text, words: countWords(text) });
}
if (!chunks.length) { console.error('The script has no chunks.'); process.exit(1); }

// --- 1. pauses ---------------------------------------------------------------
const { err } = await run(ffmpegPath(), ['-hide_banner', '-nostats', '-i', audioPath, '-af', `silencedetect=noise=${NOISE}dB:d=${MIN_SIL}`, '-f', 'null', '-']);
const dm = err.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
if (!dm) { console.error('Could not read the audio duration.'); process.exit(1); }
const duration = +dm[1] * 3600 + +dm[2] * 60 + +dm[3];
const silences = [];
let open = null;
for (const line of err.split('\n')) {
  const a = line.match(/silence_start:\s*(-?[\d.]+)/); if (a) open = Math.max(0, +a[1]);
  const b = line.match(/silence_end:\s*([\d.]+)/); if (b && open != null) { silences.push({ start: open, end: +b[1] }); open = null; }
}
if (open != null) silences.push({ start: open, end: duration });

const speech = [];
let t = 0;
for (const s of silences) { if (s.start > t + 0.02) speech.push([t, s.start]); t = Math.max(t, s.end); }
if (duration > t + 0.02) speech.push([t, duration]);
if (!speech.length) { console.error('No speech found. Try --noise -45.'); process.exit(1); }
const firstSpeech = speech[0][0], lastSpeech = speech[speech.length - 1][1];
const totalSpeech = speech.reduce((a, [x, y]) => a + (y - x), 0);
const speechToAbs = (st) => { let acc = 0; for (const [x, y] of speech) { if (acc + (y - x) >= st) return x + (st - acc); acc += y - x; } return lastSpeech; };
const pauses = silences.filter((s) => s.start > firstSpeech + 0.05 && s.end < lastSpeech - 0.05).map((s) => ({ ...s, mid: (s.start + s.end) / 2, len: s.end - s.start }));

// --- 2. scene boundaries -> the long pauses (paragraph breaks) -------------------
// Assign boundaries (in order) to distinct pauses (in order), or leave some unsnapped.
function assign(est, cand, costFn, skip) {
  const M = cand.length;
  let dp = new Float64Array(M + 1).fill(Infinity); dp[0] = 0;
  const back = [];
  for (let i = 0; i < est.length; i++) {
    const nd = new Float64Array(M + 1).fill(Infinity), bk = new Int32Array(M + 1).fill(-2);
    for (let j = 0; j <= M; j++) if (dp[j] + skip < nd[j]) { nd[j] = dp[j] + skip; bk[j] = -1; }
    let best = Infinity, bestJ = -1;
    for (let j = 1; j <= M; j++) {
      if (dp[j - 1] < best) { best = dp[j - 1]; bestJ = j - 1; }
      const c = best + costFn(est[i], cand[j - 1]);
      if (c < nd[j]) { nd[j] = c; bk[j] = bestJ; }
    }
    back.push(bk); dp = nd;
  }
  let jEnd = 0; for (let j = 1; j <= M; j++) if (dp[j] < dp[jEnd]) jEnd = j;
  const out = new Array(est.length).fill(null);
  for (let i = est.length - 1, j = jEnd; i >= 0; i--) { const b = back[i][j]; if (b === -1) continue; out[i] = cand[j - 1]; j = b; }
  return out;
}
const r3 = (x) => Math.round(x * 1000) / 1000;
const N = chunks.length;
const voiced = scenes.filter((s) => (script[s.name] || []).length);
const groups = voiced.map((s) => chunks.filter((c) => c.scene === s.name));
const gw = groups.map((g) => g.reduce((a, c) => a + c.words + 0.6, 0));
const Wt = gw.reduce((a, b) => a + b, 0);
const estS = [];
let accW = 0;
for (let k = 0; k < groups.length - 1; k++) { accW += gw[k]; estS.push(speechToAbs((totalSpeech * accW) / Wt)); }
const sceneSnap = assign(estS, pauses, (e, p) => Math.abs(e - p.mid) - 6 * Math.min(p.len, 1.5), 25);

// --- 3. lines inside each scene -> the pauses inside that scene --------------------
const times = {}, loose = new Set();
let snapped = sceneSnap.filter(Boolean).length;
groups.forEach((g, k) => {
  const a = k === 0 ? firstSpeech : sceneSnap[k - 1] ? sceneSnap[k - 1].end : estS[k - 1];
  const b = k === groups.length - 1 ? lastSpeech : sceneSnap[k] ? sceneSnap[k].start : estS[k];
  if (k > 0 && !sceneSnap[k - 1]) loose.add(g[0].id);
  if (k < groups.length - 1 && !sceneSnap[k]) loose.add(g[g.length - 1].id);
  const segs = speech.map(([x, y]) => [Math.max(x, a), Math.min(y, b)]).filter(([x, y]) => y > x);
  const tot = segs.reduce((s, [x, y]) => s + y - x, 0) || b - a;
  const toAbs = (st) => { let c = 0; for (const [x, y] of segs) { if (c + (y - x) >= st) return x + (st - c); c += y - x; } return b; };
  const w = g.map((c) => c.words + 0.6), W = w.reduce((s, x) => s + x, 0);
  const est = [];
  let cw = 0;
  for (let i = 0; i < g.length - 1; i++) { cw += w[i]; est.push(toAbs((tot * cw) / W)); }
  const inside = pauses.filter((p) => p.start > a + 0.05 && p.end < b - 0.05);
  const snap = assign(est, inside, (e, p) => Math.abs(e - p.mid) / (0.4 + Math.min(p.len, 0.8)), 0.9);
  snapped += snap.filter(Boolean).length;
  const bt = (i) => (i < 0 ? a : i >= est.length ? b : snap[i] ? snap[i].mid : null);
  for (let i = 0; i < est.length; i++) {
    if (snap[i]) continue;
    let lo = i - 1; while (lo >= 0 && !snap[lo]) lo--;
    let hi = i + 1; while (hi < est.length && !snap[hi]) hi++;
    let wa = 0, wi = 0;
    for (let q = lo + 1; q <= hi; q++) { wa += w[q]; if (q <= i) wi += w[q]; }
    est[i] = bt(lo) + ((bt(hi) - bt(lo)) * wi) / wa;
    loose.add(g[i].id); loose.add(g[i + 1].id);
  }
  g.forEach((c, i) => {
    const s = i === 0 ? a : snap[i - 1] ? snap[i - 1].end : est[i - 1];
    const e = i === g.length - 1 ? b : snap[i] ? snap[i].start : est[i];
    times[c.id] = [r3(s), r3(Math.max(e, s + 0.3))];
  });
});

// --- 4. scene starts and durations ----------------------------------------------------
const sceneStart = {};
voiced.forEach((s, k) => {
  const first = script[s.name][0][0];
  if (k === 0) { sceneStart[s.name] = 0; return; }
  const prevList = script[voiced[k - 1].name];
  const prevEnd = times[prevList[prevList.length - 1][0]][1];
  const at = times[first][0];
  sceneStart[s.name] = Math.min(at, Math.max(at - LEAD, prevEnd + 0.05));
});
const durs = {};
voiced.forEach((s, k) => {
  const next = voiced[k + 1];
  const end = next ? sceneStart[next.name] : Math.max(lastSpeech + TAIL, duration);
  durs[s.name] = r3(end - sceneStart[s.name]);
});
for (const s of scenes) if (!(s.name in durs)) durs[s.name] = s.dur != null ? s.dur : 3;

// --- 5. report + write -------------------------------------------------------------
console.log(`\nAudio ${fmt(duration)} (${duration.toFixed(2)} s) · ${silences.length} pauses · ${N} chunks · ${snapped}/${N - 1} boundaries snapped to a pause\n`);
let k = 0;
for (const s of scenes) {
  const st = sceneStart[s.name] != null ? sceneStart[s.name] : null;
  console.log(`${String(++k).padStart(2)}. ${s.name.padEnd(22)} starts ${st == null ? ' (after voice)' : fmt(st).padStart(5)}  · ${durs[s.name].toFixed(1)} s${s.dur != null && script[s.name] ? `  (authored ${s.dur}s)` : ''}`);
  for (const [id, text] of script[s.name] || []) {
    console.log(`      ${loose.has(id) ? '~' : ' '} ${id.padEnd(6)} ${times[id][0].toFixed(2).padStart(7)} → ${times[id][1].toFixed(2).padStart(7)}  ${text.length > 70 ? text.slice(0, 67) + '...' : text}`);
  }
}
console.log('\n"~" = no pause found at that boundary; its time is estimated from word counts. Check those spots by ear.');
const vo = { audio: audioRel, audioDuration: r3(duration), durs, times, method: 'silence', noise: NOISE };
if (o.dry) { console.log('\n--dry: nothing written.'); process.exit(0); }
fs.writeFileSync(htmlFile, writeBlock(html, 'ev-vo', vo));
console.log(`\nWrote the measured times into ${path.basename(htmlFile)} (<script id="ev-vo">). Video length is now ${fmt(Object.values(durs).reduce((a, b) => a + b, 0))}.`);
