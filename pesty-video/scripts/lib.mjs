// Shared helpers for the explainer-video scripts.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function need(pkg) {
  try { return require(pkg); } catch (e) {
    const dir = path.dirname(new URL(import.meta.url).pathname);
    console.error(`\nMissing dependency "${pkg}". Run once:\n  cd "${dir}" && npm install\n`);
    process.exit(1);
  }
}

export function ffmpegPath() {
  const p = need('ffmpeg-static');
  if (!p || !fs.existsSync(p)) {
    const dir = path.dirname(new URL(import.meta.url).pathname);
    console.error(`ffmpeg-static did not download its binary (npm may have blocked its install script). Run:\n  cd "${dir}" && node node_modules/ffmpeg-static/install.js`);
    process.exit(1);
  }
  return p;
}

export function run(bin, args, { input, quiet } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve({ out, err }) : reject(new Error(`${path.basename(bin)} exited ${code}\n${quiet ? '' : err.slice(-3000)}`))));
    if (input) p.stdin.end(input); else p.stdin.end();
  });
}

// --- the JSON blocks inside video.html ------------------------------------
const blockRe = (id) => new RegExp(`(<script[^>]*id=["']${id}["'][^>]*>)([\\s\\S]*?)(</script>)`);
export function readBlock(html, id, fallback) {
  const m = html.match(blockRe(id));
  if (!m || !m[2].trim()) return fallback;
  try { return JSON.parse(m[2]); } catch (e) { throw new Error(`Invalid JSON in <script id="${id}">: ${e.message}`); }
}
// two levels of keys on their own lines, everything deeper compact
function pretty(v) {
  const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
  if (!isObj(v)) return JSON.stringify(v);
  return '{\n' + Object.entries(v).map(([k, x]) => ' ' + JSON.stringify(k) + ': ' + (isObj(x)
    ? '{\n' + Object.entries(x).map(([k2, y]) => '  ' + JSON.stringify(k2) + ': ' + JSON.stringify(y)).join(',\n') + '\n }'
    : JSON.stringify(x))).join(',\n') + '\n}';
}
export function writeBlock(html, id, value) {
  const json = '\n' + pretty(value) + '\n';
  if (blockRe(id).test(html)) return html.replace(blockRe(id), (_, a, __, c) => a + json + c);
  const tag = `<script id="${id}" type="application/json">${json}</script>\n`;
  return html.replace(/(<script[^>]*id=["']ev-script["'][^>]*>[\s\S]*?<\/script>\s*)/, `$1${tag}`);
}
export function readVideo(file) {
  const html = fs.readFileSync(file, 'utf8');
  const scenes = readBlock(html, 'ev-scenes', []);
  const script = readBlock(html, 'ev-script', {});
  const vo = readBlock(html, 'ev-vo', null);
  if (!scenes.length) throw new Error('No scenes found in <script id="ev-scenes">.');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || path.basename(file, '.html');
  return { html, scenes, script, vo, title };
}
export const countWords = (s) => (String(s).replace(/\[[^\]]*\]/g, ' ').trim().match(/\S+/g) || []).length;
export const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

export function args(argv) {
  const pos = [], o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) o[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) o[k] = argv[++i];
      else o[k] = true;
    } else pos.push(a);
  }
  return { pos, o };
}

// --- a headless browser: the installed Google Chrome first ----------------
export async function launchBrowser() {
  const { chromium } = need('playwright-core');
  const tries = [{ channel: 'chrome' }, { channel: 'msedge' }, {}];
  let last;
  for (const t of tries) {
    try { return await chromium.launch(Object.assign({ headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] }, t)); } catch (e) { last = e; }
  }
  console.error('Could not start a browser. Install Google Chrome, or run: npx playwright install chromium');
  throw last;
}
export async function openVideo(browser, file, { captions = true, scale = 1 } = {}) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve(file) + '?export=1' + (captions ? '' : '&captions=0');
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  try {
    await page.waitForFunction(() => window.__EV && window.__EV.seek, null, { timeout: 60000 });
  } catch (e) {
    throw new Error('The video did not start. Page errors:\n' + errors.join('\n'));
  }
  await page.evaluate(() => window.__EV.ready);
  // Brand fonts must be loaded, or every frame silently falls back to a system font.
  const fontsOk = await page.evaluate(async () => {
    const want = ['700 64px Epilogue', '500 32px Montserrat'];
    await Promise.all(want.map((f) => document.fonts.load(f).catch(() => null)));
    await document.fonts.ready;
    return want.filter((f) => !document.fonts.check(f) || ![...document.fonts].some((ff) => f.includes(ff.family.replace(/["']/g, '')) && ff.status === 'loaded'));
  });
  if (fontsOk.length && !process.env.PESTY_VIDEO_ALLOW_FALLBACK_FONTS) {
    throw new Error(`Brand fonts did not load: ${fontsOk.join(', ')}. Check the Google Fonts <link> (Epilogue + Montserrat) and the network. Refusing to render with a fallback font.`);
  }
  const info = await page.evaluate(() => ({ duration: window.__EV.duration, fps: window.__EV.fps, audio: window.__EV.audio, items: window.__EV.items, scenes: window.__EV.scenes, voiced: window.__EV.voiced }));
  const cdp = await page.context().newCDPSession(page);
  async function shot(format = 'jpeg', quality = 92) {
    const { data } = await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? quality : undefined, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, optimizeForSpeed: true, captureBeyondViewport: false });
    return Buffer.from(data, 'base64');
  }
  return { page, info, errors, shot, seek: (t) => page.evaluate((x) => window.__EV.seek(x), t), missing: () => page.evaluate(() => window.__EV.activeMissing ? window.__EV.activeMissing() : []) };
}
