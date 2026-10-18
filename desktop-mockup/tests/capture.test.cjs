const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { PNG } = require('pngjs');
const device = require('../package.json').mockupDevice;
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pesty-mockup-test-'));
const script = path.join(__dirname, '../scripts/capture.cjs');
let server, url, first;
function run(args, env = {}) {
 return new Promise(resolve => {
  const child = spawn(process.execPath, [script, ...args], { env: { ...process.env, SCREENSHOTAPI_TOKEN: '', ...env } });
  let stdout = '', stderr = '';
  child.stdout.on('data', b => stdout += b);
  child.stderr.on('data', b => stderr += b);
  child.on('close', code => resolve({ code, stdout, stderr }));
 });
}
const png = file => PNG.sync.read(fs.readFileSync(file));
before(async () => {
 server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Client &lt;Team&gt; &amp; Co</title><style>body{margin:0;background:#14532d;color:white;font:24px Arial}.obstruction{position:fixed;inset:0;background:magenta;z-index:5}#target{margin-top:1000px;height:1000px;background:#ef4444}</style><div class="obstruction">Overlay</div><h1>Website preview</h1><section id="target">Selected section</section>');
 });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 url = `http://127.0.0.1:${server.address().port}/`;
});
after(async () => {
 await new Promise(resolve => server.close(resolve));
 fs.rmSync(root, { recursive: true, force: true });
});
test('standalone default device captures real pixels and exports transparent mockup and 4K slide', async () => {
 const out = path.join(root, 'default');
 const result = await run(['--url', url, '--out', out, '--hide', '.obstruction', '--slide']);
 assert.equal(result.code, 0, result.stderr);
 first = JSON.parse(result.stdout);
 assert.equal(first.device, device);
 assert.equal(first.status, 200);
 const source = png(first.files.source), framed = png(first.files.png), slide = png(first.files.slide);
 assert.equal(source.width, first.viewport.width * 2);
 assert.equal(source.height, first.viewport.height * 2);
 assert.deepEqual([...source.data.subarray(0, 3)], [20, 83, 45], 'overlay was hidden without replacing page pixels');
 assert.equal(framed.data[3], 0, 'transparent frame margin');
 assert.ok(framed.width > source.width || device === 'mobile');
 assert.deepEqual([slide.width, slide.height], [3840, 2160]);
 assert.equal(slide.data[3], 255);
 const html = fs.readFileSync(first.files.html, 'utf8');
 assert.ok(html.includes('127.0.0.1'));
 assert.ok(html.includes('data:image/png;base64,'));
 if(device === 'desktop')assert.ok(html.includes('Client &lt;Team&gt; &amp; Co'));
});
test('custom viewport and selected section keep page proportions with an opaque background', async () => {
 const result = await run(['--url', url, '--out', path.join(root, 'section'), '--width', '400', '--height', '600', '--hide', '.obstruction', '--scroll-to', '#target', '--background', 'white']);
 assert.equal(result.code, 0, result.stderr);
 const meta = JSON.parse(result.stdout), source = png(meta.files.source), framed = png(meta.files.png);
 assert.deepEqual([source.width, source.height], [800, 1200]);
 assert.deepEqual([...source.data.subarray(0, 3)], [239, 68, 68]);
 assert.equal(framed.data[3], 255);
});
test('existing PNG is preserved and a mismatched aspect ratio is rejected', async () => {
 const result = await run(['--url', url, '--input', first.files.source, '--out', path.join(root, 'existing')]);
 assert.equal(result.code, 0, result.stderr);
 const meta = JSON.parse(result.stdout);
 assert.equal(meta.provider, 'existing-image');
 assert.deepEqual(fs.readFileSync(meta.files.source), fs.readFileSync(first.files.source));
 const bad = await run(['--url', url, '--input', first.files.source, '--out', path.join(root, 'bad-ratio'), '--width', '300', '--height', '300']);
 assert.notEqual(bad.code, 0);
 assert.match(bad.stderr, /aspect ratio/);
});
test('invalid options and absent hosted credentials fail with actionable errors', async () => {
 const unknown = await run(['--typo', 'value']);
 assert.notEqual(unknown.code, 0);assert.match(unknown.stderr, /Unknown option/);
 const token = await run(['--url', url, '--out', path.join(root, 'hosted'), '--provider', 'screenshotapi']);
 assert.notEqual(token.code, 0);assert.match(token.stderr, /SCREENSHOTAPI_TOKEN/);
 const help = await run(['--help']);assert.equal(help.code, 0);
});
