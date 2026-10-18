#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const frame = require('../assets/frames.cjs');
function args(argv) {
 const r={hide:[]};
 const allowed=new Set(['--device','--provider','--url','--out','--width','--height','--title','--hide','--scroll-to','--background','--input']);
 for(let i=0;i<argv.length;i++){
  const k=argv[i];
  if(['--slide','--help'].includes(k)){r[k.slice(2)]=true;continue}
  if(!allowed.has(k))throw new Error('Unknown option '+k+'; use --help.');
  if(!k.startsWith('--') || !argv[i+1] || argv[i+1].startsWith('--'))throw new Error('Expected --option value; use --help.');
  const v=argv[++i]; if(k==='--hide')r.hide.push(v);else r[k.slice(2)]=v;
 }
 return r;
}
function loadPlaywright(){
 try{return require('playwright')}catch{}
 const candidates=[process.env.MOCKUP_NODE_MODULES,...(process.env.NODE_PATH||'').split(path.delimiter)].filter(Boolean);
 for(const root of candidates){try{return require(path.join(root,'playwright'))}catch{}}
 throw new Error('Playwright unavailable. Run npm ci in this skill folder, then npm run setup.');
}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function main(){
 const a=args(process.argv.slice(2));
 if(a.help){console.log('capture.cjs --device desktop|mobile --url URL --out DIRECTORY [--provider local|screenshotapi] [--width N --height N] [--title TEXT] [--hide CSS] [--scroll-to CSS] [--background CSS_COLOR] [--slide] [--input PNG]');return}
 const device=a.device||require('../package.json').mockupDevice,provider=a.provider||'local';
 if(!['desktop','mobile'].includes(device)||!['local','screenshotapi'].includes(provider))throw new Error('Invalid device or provider');
 if(!a.url)throw new Error('--url is required for the displayed address');
 const url=new URL(a.url);if(!['https:','http:'].includes(url.protocol))throw new Error('Use an HTTP or HTTPS URL');
 const width=Number(a.width||(device==='desktop'?1440:390)),height=Number(a.height||(device==='desktop'?900:760));
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<240||height<240||width>3840||height>4000)throw new Error('Viewport dimensions must be integers between 240 and 3840 wide / 4000 high');
 const out=path.resolve(a.out||path.join(os.homedir(),'Documents','website-mockups',url.hostname+'-'+device+'-'+Date.now()));
 fs.mkdirSync(out,{recursive:true});
 const {chromium}=loadPlaywright();
 let browser;
 try{browser=await chromium.launch({headless:true,...(process.env.MOCKUP_CHROME_CHANNEL?{channel:process.env.MOCKUP_CHROME_CHANNEL}:{})})}
 catch{throw new Error('Browser launch failed. Run npm run setup in this skill folder (Linux: npm run setup -- --with-deps). To use installed Chrome, set MOCKUP_CHROME_CHANNEL=chrome.');}
 const started=Date.now();let title=a.title||url.hostname,status=null;
 try{
  const source=path.join(out,'capture.png');
  if(a.input){const input=fs.readFileSync(path.resolve(a.input));if(!input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('--input requires a PNG screenshot.');fs.writeFileSync(source,input)}
  else if(provider==='local'){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:device==='mobile',hasTouch:device==='mobile',colorScheme:'light',reducedMotion:'reduce'});
   const page=await context.newPage();
   const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:60000});status=response?.status();
   if(status>=400)throw new Error('Target returned HTTP '+status);
   await page.waitForLoadState('networkidle',{timeout:10000}).catch(()=>{});
   await page.evaluate(async()=>Promise.race([Promise.all([document.fonts.ready,...Array.from(document.images).map(i=>i.decode().catch(()=>{}))]),new Promise(r=>setTimeout(r,8000))]));
   if(a['scroll-to'])await page.locator(a['scroll-to']).scrollIntoViewIfNeeded();
   await page.waitForTimeout(1000);
   if(a.hide.length)await page.addStyleTag({content:a.hide.map(s=>s+'{visibility:hidden!important}').join('\n')});
   title=a.title||await page.title()||url.hostname;
   await page.screenshot({path:source,animations:'disabled'});await context.close();
  }else{
   const token=process.env.SCREENSHOTAPI_TOKEN;if(!token)throw new Error('SCREENSHOTAPI_TOKEN must be available in the process environment.');
   const endpoint=new URL('https://shot.screenshotapi.net/screenshot');
   const options={token,url:url.href,width,height,output:'image',file_type:'png',fresh:'true',retina:'true',delay:2000};
   if(a.hide.length)options.remove_selector=a.hide.join(',');if(a['scroll-to'])options.scroll_to_element=a['scroll-to'];
   for(const[k,v]of Object.entries(options))endpoint.searchParams.set(k,String(v));
   const result=await fetch(endpoint,{signal:AbortSignal.timeout(120000)});status=result.status;
   if(!result.ok)throw new Error('ScreenshotAPI returned HTTP '+status);
   if(!result.headers.get('content-type')?.startsWith('image/'))throw new Error('ScreenshotAPI returned a non-image response');
   fs.writeFileSync(source,Buffer.from(await result.arrayBuffer()));
  }
  const check=await browser.newPage();
  await check.setContent('<html></html>');
  if(a.background && !await check.evaluate(c=>CSS.supports('color',c),a.background))throw new Error('--background must be a CSS color.');
  await check.close();
  const dataUri='data:image/png;base64,'+fs.readFileSync(source).toString('base64');
  const measure=await browser.newPage();
  await measure.setContent(`<img src="${dataUri}">`);
  const natural=await measure.locator('img').evaluate(async img=>{await img.decode();return {width:img.naturalWidth,height:img.naturalHeight}});await measure.close();
  if(Math.abs(natural.width/natural.height-width/height)>0.005)throw new Error('Screenshot aspect ratio differs from viewport. Set --width and --height to its intended CSS dimensions.');
  const rendered=frame({dataUri,title:escape(title),hostname:escape(url.hostname),device,width,height});
  const page=await browser.newPage({viewport:{width:Math.max(width+100,1920),height:1080},deviceScaleFactor:2});
  const html=`<!doctype html><html><head><meta charset="utf-8"><style>${rendered.css}body{background:${escape(a.background||'transparent')}}.tab span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:235px}</style></head><body>${rendered.body}</body></html>`;
  const htmlPath=path.join(out,'mockup.html'),png=path.join(out,'mockup.png');
  fs.writeFileSync(htmlPath,html);await page.setContent(html);await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  const box=await page.locator(rendered.selector).boundingBox();
  await page.locator(rendered.selector).screenshot({path:png,omitBackground:!a.background});
  let slide=null;
  if(a.slide){
   const scale=Math.min(1728/box.width,936/box.height);
   await page.setViewportSize({width:1920,height:1080});
   await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${rendered.css}.canvas{width:1920px;height:1080px;background:${escape(a.background||'#f3f3f0')};position:relative}.object{position:absolute;left:${(1920-box.width*scale)/2}px;top:${(1080-box.height*scale)/2}px;transform:scale(${scale});transform-origin:top left}</style></head><body><div class="canvas"><div class="object">${rendered.body}</div></div></body></html>`);
   await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));slide=path.join(out,'slide.png');await page.locator('.canvas').screenshot({path:slide});
  }
  const meta={url:url.href,device,provider:a.input?'existing-image':provider,viewport:{width,height},title,status,capturedAt:new Date().toISOString(),seconds:(Date.now()-started)/1000,hiddenSelectors:a.hide,scrollTo:a['scroll-to']||null,files:{source,png,html:htmlPath,slide},notes:device==='mobile'?'Illustrative iPhone frame and Safari controls; source is mobile Chromium emulation.':'Illustrative Chrome frame; page pixels preserved.'};
  fs.writeFileSync(path.join(out,'metadata.json'),JSON.stringify(meta,null,2));console.log(JSON.stringify(meta,null,2));
 }finally{await browser.close()}
}
main().catch(e=>{const token=process.env.SCREENSHOTAPI_TOKEN;const message=token?e.message.split(token).join('[redacted]'):e.message;console.error(message);process.exitCode=1});
