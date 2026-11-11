#!/usr/bin/env node
// Render video.html frame by frame in headless Chrome and encode an MP4 (H.264
// + AAC voice-over) plus an .srt captions file. Or render review stills.
//
//   node export.mjs video.html                       -> out/<name>.mp4 + .srt
//   node export.mjs video.html --no-captions         -> captions not burned in (ship the .srt)
//   node export.mjs video.html --from 30 --to 45     -> just a slice (quick check)
//   node export.mjs video.html --fps 24 --workers 4 --crf 18 --out path.mp4
//   node export.mjs video.html --stills chunks       -> one PNG per caption + contact sheets
//   node export.mjs video.html --stills every:4      -> one PNG every 4 s
//   node export.mjs video.html --stills 12.5,40,61   -> PNGs at those times
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { args, ffmpegPath, run, launchBrowser, openVideo, fmt } from './lib.mjs';
import { checkClaims } from './check-claims.mjs';

const { pos, o } = args(process.argv.slice(2));
if (!pos[0]) { console.error('Usage: node export.mjs video.html [--out file.mp4] [--fps 30] [--from s] [--to s] [--no-captions] [--workers N] [--crf 18] [--stills chunks|every:N|t1,t2]'); process.exit(1); }
const htmlFile = path.resolve(pos[0]);
const htmlDir = path.dirname(htmlFile);
const name = path.basename(htmlFile, '.html');
const outDir = path.join(htmlDir, 'out');
fs.mkdirSync(outDir, { recursive: true });
const captions = !o['no-captions'];

const browser = await launchBrowser();
try {
  if (o.stills) await stills();
  else await video();
} finally {
  await browser.close();
}

// ---------------------------------------------------------------------------
async function stills() {
  const v = await openVideo(browser, htmlFile, { captions });
  const { info } = v;
  let times = [];
  if (o.stills === 'chunks' || o.stills === true) times = info.items.map((it) => ({ t: Math.min(it.until - 0.05, it.at + Math.min(1.2, (it.until - it.at) * 0.6)), label: `${it.id} · ${it.text}` }));
  else if (String(o.stills).startsWith('every:')) { const step = Number(String(o.stills).split(':')[1]) || 5; for (let t = 0; t < info.duration; t += step) times.push({ t, label: '' }); }
  else times = String(o.stills).split(',').map(Number).filter((x) => !isNaN(x)).map((t) => ({ t, label: '' }));
  const dir = path.join(outDir, 'stills');
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const index = [], problems = [];
  for (let i = 0; i < times.length; i++) {
    const { t, label } = times[i];
    await v.seek(t);
    const miss = await v.missing();
    if (miss.length) problems.push(`${fmt(t)} (${t.toFixed(2)}s): plan aims at missing/hidden element(s): ${miss.join(', ')}`);
    const file = `${String(i + 1).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(dir, file), await v.shot('png'));
    index.push({ file, t: Math.round(t * 100) / 100, label });
  }
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(index, null, 1));
  // contact sheets: 12 labelled thumbnails per image
  const sheets = [];
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (let s = 0; s * 12 < index.length; s++) {
    const part = index.slice(s * 12, s * 12 + 12);
    const cells = part.map((x) => `<figure><img src="stills/${x.file}"><figcaption><b>${fmt(x.t)}</b> <i>${x.t.toFixed(2)}s</i> ${x.label.replace(/</g, '&lt;').slice(0, 90)}</figcaption></figure>`).join('');
    const sheetHtml = path.join(outDir, '_sheet.html');
    fs.writeFileSync(sheetHtml, `<html><body style="margin:0;background:#11181C;font:14px system-ui;color:#fff"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:14px">${cells}</div><style>figure{margin:0}img{width:100%;display:block;border-radius:6px}figcaption{padding:6px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}i{color:#98A4AB;font-style:normal}</style></body></html>`);
    await page.goto('file://' + sheetHtml, { waitUntil: 'load' });
    const f = path.join(outDir, `sheet-${String(s + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: f, fullPage: true });
    fs.rmSync(sheetHtml, { force: true });
    sheets.push(f);
  }
  console.log(`\n${index.length} stills in ${path.relative(process.cwd(), dir)}/  ·  contact sheets:\n${sheets.map((f) => '  ' + path.relative(process.cwd(), f)).join('\n')}`);
  if (v.errors.length) console.log('\nPage errors:\n  ' + [...new Set(v.errors)].join('\n  '));
  if (problems.length) console.log('\nDiagnostics:\n  ' + problems.join('\n  '));
}

// ---------------------------------------------------------------------------
async function video() {
  // A video with an ev-claims block must match its live page before it can become an MP4.
  const claims = await checkClaims(htmlFile, { browser });
  if (claims.misses.length) { console.error(`\nRefusing to export: ${claims.misses.length} claim(s) not on the live page (see above).`); process.exitCode = 1; return; }
  const probe = await openVideo(browser, htmlFile, { captions });
  const { info } = probe;
  const fps = Number(o.fps || info.fps || 30);
  const from = Math.max(0, Number(o.from || 0));
  const to = Math.min(info.duration, Number(o.to || info.duration));
  const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
  const total = f1 - f0;
  const workers = Math.max(1, Math.min(Number(o.workers || Math.max(1, Math.min(4, Math.floor(os.cpus().length / 2)))), Math.ceil(total / 60)));
  const crf = String(o.crf || 18);
  const outFile = path.resolve(o.out || path.join(outDir, `${name}${from > 0 || to < info.duration ? `-${Math.round(from)}-${Math.round(to)}` : ''}.mp4`));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'evx-'));
  const audio = info.audio ? path.resolve(htmlDir, info.audio) : null;
  if (audio && !fs.existsSync(audio)) console.warn(`! Voice-over file not found: ${audio} (exporting without sound)`);
  console.log(`Rendering ${fmt(to - from)} at ${fps} fps = ${total} frames, ${workers} worker(s)${captions ? '' : ', no burned-in captions'}${info.voiced ? '' : '  [no voice-over aligned yet]'}`);

  const t0 = Date.now();
  let done = 0, lastPct = -1;
  const tick = () => { done++; const pct = Math.floor((done / total) * 20) * 5; if (pct !== lastPct) { lastPct = pct; const el = (Date.now() - t0) / 1000; const eta = done ? (el / done) * (total - done) : 0; process.stdout.write(`\r  ${String(pct).padStart(3)}%  ${done}/${total} frames  ·  ${el.toFixed(0)}s elapsed, ~${eta.toFixed(0)}s left   `); } };

  const ranges = [];
  const per = Math.ceil(total / workers);
  for (let w = 0; w < workers; w++) { const a = f0 + w * per, b = Math.min(f1, a + per); if (b > a) ranges.push([a, b]); }
  const missingAt = new Set();

  const renderRange = async ([a, b], idx, v) => {
    const part = path.join(tmp, `part-${String(idx).padStart(2, '0')}.mp4`);
    const ff = spawn(ffmpegPath(), ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', '-r', String(fps), part], { stdio: ['pipe', 'inherit', 'inherit'] });
    const closed = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg failed on part ' + idx)))));
    for (let f = a; f < b; f++) {
      await v.seek(f / fps);
      if (f % fps === 0) { const m = await v.missing(); if (m.length) missingAt.add(`${fmt(f / fps)}: ${m.join(', ')}`); }
      const buf = await v.shot('jpeg', 92);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      tick();
    }
    ff.stdin.end();
    await closed;
    return part;
  };

  const pages = [probe];
  for (let i = 1; i < ranges.length; i++) pages.push(await openVideo(browser, htmlFile, { captions }));
  const parts = await Promise.all(ranges.map((r, i) => renderRange(r, i, pages[i])));
  process.stdout.write('\n');

  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const silent = path.join(tmp, 'video.mp4');
  await run(ffmpegPath(), ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
  const muxArgs = ['-y', '-hide_banner', '-loglevel', 'error', '-i', silent];
  if (audio && fs.existsSync(audio)) muxArgs.push('-ss', String(from), '-t', String(to - from), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-af', 'apad', '-t', String(to - from));
  else muxArgs.push('-c', 'copy');
  muxArgs.push('-movflags', '+faststart', outFile);
  await run(ffmpegPath(), muxArgs);
  const srt = await probe.page.evaluate(() => window.__EV.srt());
  const srtFile = outFile.replace(/\.mp4$/, '.srt');
  fs.writeFileSync(srtFile, srt);
  fs.rmSync(tmp, { recursive: true, force: true });
  const mb = (fs.statSync(outFile).size / 1048576).toFixed(1);
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${path.relative(process.cwd(), outFile)} (${mb} MB) + ${path.basename(srtFile)}`);
  const errs = [...new Set(pages.flatMap((p) => p.errors))];
  if (errs.length) console.log('Page errors:\n  ' + errs.join('\n  '));
  if (missingAt.size) console.log('Plan aimed at elements that were missing/hidden at:\n  ' + [...missingAt].slice(0, 20).join('\n  '));
}
