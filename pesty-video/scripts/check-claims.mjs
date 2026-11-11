// Refuse a video whose claims aren't on the live page it is about.
//
// A video that states real numbers (a case study, a blog-article explainer) carries
//   <script type="application/json" id="ev-claims">{"page": "https://…", "evidence": ["…", "…"]}</script>
// This script then checks, against the live page's visible text:
//   1. every `evidence` string appears on the page (quotes, sentences);
//   2. every number shown on screen at any moment, or written in the narration,
//      appears on the page — so a typo or invented figure can't slip through
//      even if nobody wrote evidence for it.
// Chapter labels and the step tracker are ignored (they carry data-noclaim).
// SOP videos with fictional sample data have no ev-claims block and are skipped.
//
//   node check-claims.mjs video.html            -> exit 1 on any miss
//   node check-claims.mjs video.html --every 0.25
// export.mjs runs the same check before an MP4 and refuses to export on a miss.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, launchBrowser, openVideo, readVideo, readBlock } from './lib.mjs';

const NUM = /\$?\d[\d,.]*\+?%?/g;

export function norm(s) {
  return String(s)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/ /g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const numbersIn = (s) => (norm(s).match(NUM) || []).map((n) => n.replace(/[.,]+$/, '')).filter(Boolean);

async function livePageText(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    return norm(await page.innerText('body'));
  } finally { await page.close(); }
}

// Every number visible on the stage, sampled through the whole timeline.
async function shownText(browser, file, every) {
  const v = await openVideo(browser, file, { captions: false });
  const seen = new Map(); // text -> first time seen
  try {
    for (let t = 0; t <= v.info.duration; t += every) {
      await v.seek(t);
      const texts = await v.page.evaluate(() => {
        const out = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          const el = n.parentElement;
          if (!el || !n.nodeValue.trim()) continue;
          if (el.closest('[data-noclaim], script, style, button')) continue;
          if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true })) continue;
          out.push(n.nodeValue);
        }
        return out;
      });
      for (const s of texts) if (!seen.has(s)) seen.set(s, t);
    }
  } finally { await v.page.close(); }
  return seen;
}

export async function checkClaims(file, { browser, every = 0.5, log = console.log } = {}) {
  const { html, script } = readVideo(file);
  const claims = readBlock(html, 'ev-claims', null);
  if (!claims) return { skipped: true, misses: [] };
  if (!claims.page) throw new Error('ev-claims needs a "page" URL.');
  const own = !browser;
  browser = browser || await launchBrowser();
  const misses = [];
  try {
    const text = await livePageText(browser, claims.page);
    for (const e of claims.evidence || []) if (!text.includes(norm(e))) misses.push(`evidence not on page: ${JSON.stringify(e)}`);
    const flagged = new Set();
    const flag = (n, where) => { const k = n + '|' + where; if (!text.includes(n) && !flagged.has(k)) { flagged.add(k); misses.push(`number ${JSON.stringify(n)} ${where} is not on the page`); } };
    for (const [id, chunk] of Object.entries(script)) for (const n of numbersIn(chunk)) flag(n, `(narration ${id}: ${JSON.stringify(norm(chunk).slice(0, 70))})`);
    const shown = await shownText(browser, file, every);
    const shownMiss = new Set(); // report each on-screen number once (typing effects repeat it every frame)
    for (const [s, t] of shown) for (const n of numbersIn(s)) {
      if (text.includes(n) || shownMiss.has(n)) continue;
      shownMiss.add(n); misses.push(`number ${JSON.stringify(n)} (on screen at ${t.toFixed(1)}s: ${JSON.stringify(norm(s).slice(0, 70))}) is not on the page`);
    }
    log(`claims: ${claims.page}\n  ${(claims.evidence || []).length} evidence strings, ${shown.size} on-screen text runs checked · ${misses.length ? 'FAIL' : 'OK'}`);
    for (const m of misses) log('    ' + m);
  } finally { if (own) await browser.close(); }
  return { skipped: false, misses };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { pos, o } = args(process.argv.slice(2));
  if (!pos[0]) { console.error('Usage: node check-claims.mjs video.html [--every 0.5]'); process.exit(1); }
  const r = await checkClaims(path.resolve(pos[0]), { every: Number(o.every) || 0.5 });
  if (r.skipped) console.log('No <script id="ev-claims"> block: nothing to check (fine for an SOP with sample data).');
  process.exit(r.misses.length ? 1 : 0);
}
