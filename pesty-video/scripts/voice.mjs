#!/usr/bin/env node
// Voice the narration with the ElevenLabs API and write exact chunk times into
// video.html (<script id="ev-vo">) — no recording, pasting or silence-guessing.
//
//   node voice.mjs video.html --dry-run            -> characters that would be billed, nothing sent
//   node voice.mjs video.html [--voice ID] [--model ID] [--speed 1.1] [--gap 0.6] [--max-chars N]
//
// One request per scene (the scene's chunks joined), using /with-timestamps so every
// chunk's start/end comes from ElevenLabs' character timings. Clips are trimmed to the
// last spoken character and joined with --gap seconds of silence into voiceover.mp3
// next to the page. ev-vo is written in the same shape align-vo.mjs writes, so
// captions, camera, clicks and the SRT all follow it unchanged.
//
// Cache: vo/<scene>.mp3 + vo/cache.json. A scene whose words, voice, model and
// settings are unchanged is reused, so editing one scene re-bills only that scene.
// The key comes from $ELEVENLABS_API_KEY or the macOS Keychain item "elevenlabs-api".
// Voice defaults (Chris, eleven_v4, speed 1.1) match the motion-video skill.
// A hand-made MP3 still goes through align-vo.mjs instead.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { args, ffmpegPath, run, readVideo, writeBlock, fmt } from './lib.mjs';

const DEFAULT_VOICE = 'iP95p4xoKVk53GoZ742B'; // Chris: American male, the Pesty narrator
const DEFAULT_MODEL = 'eleven_v4';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true };
const API = (v) => `https://api.elevenlabs.io/v1/text-to-speech/${v}/with-timestamps?output_format=mp3_44100_128`;
const LEAD = 0.35, TAIL = 1.6; // same as align-vo.mjs: a scene starts just before its first word

const { pos, o } = args(process.argv.slice(2));
if (!pos[0]) { console.error('Usage: node voice.mjs video.html [--dry-run] [--voice ID] [--model ID] [--speed 1.1] [--gap 0.6] [--max-chars N]'); process.exit(1); }
const htmlFile = path.resolve(pos[0]);
const htmlDir = path.dirname(htmlFile);
const { html, scenes, script } = readVideo(htmlFile);
const voice = o.voice || DEFAULT_VOICE, model = o.model || DEFAULT_MODEL;
const settings = { ...VOICE_SETTINGS, speed: Number(o.speed || 1.1) };
const GAP = Number(o.gap || 0.6);
const r3 = (x) => Math.round(x * 1000) / 1000;

// voiced scenes, in order; silent scenes may only come at the very end (same rule as align-vo)
const voiced = [];
let silentGap = null;
for (const s of scenes) {
  const list = script[s.name] || [];
  if (!list.length) { silentGap = silentGap || s.name; continue; }
  if (silentGap) { console.error(`Scene "${silentGap}" has no voice-over but comes before "${s.name}", which does. Only trailing scenes can be silent.`); process.exit(1); }
  voiced.push({ name: s.name, chunks: list.map(([id, text]) => ({ id, text: String(text).trim() })) });
}
if (!voiced.length) { console.error('The script has no chunks.'); process.exit(1); }
for (const v of voiced) v.text = v.chunks.map((c) => c.text).join(' ');

const voDir = path.join(htmlDir, 'vo');
fs.mkdirSync(voDir, { recursive: true });
const cachePath = path.join(voDir, 'cache.json');
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const hash = (text) => crypto.createHash('sha1').update(JSON.stringify([text, voice, model, settings])).digest('hex').slice(0, 12);
const isCached = (v) => cache[v.name] && cache[v.name].hash === hash(v.text) && fs.existsSync(path.join(voDir, `${v.name}.mp3`));
const toBill = voiced.filter((v) => !isCached(v)).reduce((a, v) => a + v.text.length, 0);
const total = voiced.reduce((a, v) => a + v.text.length, 0);

if (o['dry-run']) {
  console.log(`Would bill ${toBill} characters (${total} in the script; ${voiced.filter(isCached).length}/${voiced.length} scenes cached). Voice ${voice}, model ${model}, speed ${settings.speed}.`);
  process.exit(0);
}
if (o['max-chars'] != null && toBill > Number(o['max-chars'])) { console.error(`Would bill ${toBill} characters, over --max-chars ${o['max-chars']}.`); process.exit(1); }

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  try { return execFileSync('security', ['find-generic-password', '-s', 'elevenlabs-api', '-w'], { encoding: 'utf8' }).trim(); } catch (e) {
    console.error('No ElevenLabs key: set ELEVENLABS_API_KEY or run `security add-generic-password -s elevenlabs-api -a $USER -w <key>`'); process.exit(1);
  }
}

// chunk times (relative to the clip) from the character alignment of the joined scene text
function chunkTimes(v, al) {
  const chars = al.characters, st = al.character_start_times_seconds, en = al.character_end_times_seconds;
  if (chars.join('') !== v.text) throw new Error(`Alignment text for scene ${v.name} does not match the script text.`);
  const out = {};
  let off = 0;
  for (const c of v.chunks) {
    const a = off, b = off + c.text.length - 1;
    out[c.id] = [r3(st[a]), r3(en[b])];
    off += c.text.length + 1; // + the joining space
  }
  return { times: out, end: r3(en[chars.length - 1]) };
}

const key = toBill ? apiKey() : null;
for (let i = 0; i < voiced.length; i++) {
  const v = voiced[i];
  if (isCached(v)) continue;
  const body = { text: v.text, model_id: model, voice_settings: settings };
  if (i > 0) body.previous_text = voiced[i - 1].text;
  if (i + 1 < voiced.length) body.next_text = voiced[i + 1].text;
  let r = await fetch(API(voice), { method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (r.status === 400) { // some models refuse previous/next text
    const t = await r.text();
    if (/previous_text|next_text/.test(t)) { delete body.previous_text; delete body.next_text; r = await fetch(API(voice), { method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
    else { console.error(`ElevenLabs error on scene ${v.name}: 400 ${t.slice(0, 300)}`); process.exit(1); }
  }
  if (!r.ok) { console.error(`ElevenLabs error on scene ${v.name}: ${r.status} ${(await r.text()).slice(0, 300)}`); process.exit(1); }
  const data = await r.json();
  fs.writeFileSync(path.join(voDir, `${v.name}.mp3`), Buffer.from(data.audio_base64, 'base64'));
  const { times, end } = chunkTimes(v, data.alignment || data.normalized_alignment);
  cache[v.name] = { hash: hash(v.text), times, end };
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1)); // paid work survives an interrupt
  console.log(`  voiced ${v.name.padEnd(22)} ${end.toFixed(1)} s`);
}

// --- join the clips: trim each to its last word (+80 ms), then GAP of silence ----------
const inputs = [], parts = [];
voiced.forEach((v, k) => {
  inputs.push('-i', path.join(voDir, `${v.name}.mp3`));
  const end = cache[v.name].end + 0.08;
  parts.push(`[${k}:a]atrim=0:${end.toFixed(3)},asetpts=PTS-STARTPTS${k < voiced.length - 1 ? `,apad=pad_dur=${GAP}` : ''}[a${k}]`);
});
const fc = parts.join(';') + ';' + voiced.map((_, k) => `[a${k}]`).join('') + `concat=n=${voiced.length}:v=0:a=1[out]`;
const outMp3 = path.join(htmlDir, 'voiceover.mp3');
await run(ffmpegPath(), ['-y', '-hide_banner', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-b:a', '192k', outMp3]);

// --- absolute times, scene starts and durations (same rules as align-vo.mjs) --------------
const times = {};
let t0 = 0;
const clipStart = {};
voiced.forEach((v, k) => {
  clipStart[v.name] = t0;
  for (const [id, [a, b]] of Object.entries(cache[v.name].times)) times[id] = [r3(t0 + a), r3(t0 + b)];
  t0 += cache[v.name].end + 0.08 + (k < voiced.length - 1 ? GAP : 0);
});
const audioDuration = r3(t0);
const lastSpeech = times[voiced[voiced.length - 1].chunks.slice(-1)[0].id][1];
const sceneStart = {};
voiced.forEach((v, k) => {
  const at = times[v.chunks[0].id][0];
  if (k === 0) { sceneStart[v.name] = 0; return; }
  const prevEnd = times[voiced[k - 1].chunks.slice(-1)[0].id][1];
  sceneStart[v.name] = r3(Math.min(at, Math.max(at - LEAD, prevEnd + 0.05)));
});
const durs = {};
voiced.forEach((v, k) => {
  const next = voiced[k + 1];
  durs[v.name] = r3((next ? sceneStart[next.name] : Math.max(lastSpeech + TAIL, audioDuration)) - sceneStart[v.name]);
});
for (const s of scenes) if (!(s.name in durs)) durs[s.name] = s.dur != null ? s.dur : 3;

const vo = { audio: 'voiceover.mp3', audioDuration, durs, times, method: 'elevenlabs', voice, model };
fs.writeFileSync(htmlFile, writeBlock(html, 'ev-vo', vo));

console.log(`\nBilled ${toBill} characters. Voice ${fmt(audioDuration)} (${audioDuration.toFixed(2)} s) across ${voiced.length} scenes.`);
for (const s of scenes) {
  console.log(`  ${s.name.padEnd(22)} starts ${sceneStart[s.name] != null ? fmt(sceneStart[s.name]).padStart(5) : ' (after voice)'} · ${durs[s.name].toFixed(1)} s`);
}
console.log(`Wrote voiceover.mp3 and <script id="ev-vo"> into ${path.basename(htmlFile)}. Video length ${fmt(Object.values(durs).reduce((a, b) => a + b, 0))}.`);
