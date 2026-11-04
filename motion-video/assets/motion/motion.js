/* motion-video runtime. Turns data-* attributes into Web Animations, then exposes
   motion.seek(t) so render.py can pause everything and step frame by frame.

   Timing comes from timeline.js (window.MOTION_TIMELINE), which render.py writes from
   storyboard.json + narration timings. Inside a .scene, times are relative to that scene:
     data-in="0.4"        0.4 s after the scene starts
     data-in="@revenue"   when the narrator says "revenue" in this scene (+/- offset: "@revenue+0.2")
     data-in="@18.1#2"    the 2nd time "18.1" is said in this scene
   Outside a scene (persistent elements), times are absolute seconds.

   Opening video.html directly in a browser previews it (loops, with captions and counters);
   ?render=1 (used by render.py) turns the preview clock off. */
(() => {
  const TL = window.MOTION_TIMELINE || { scenes: [], total: 10, loop: false, cues: [], captions: [] };
  const SIZE = innerWidth > innerHeight ? '16x9' : innerWidth < innerHeight ? '9x16' : '1x1';
  const CAPTIONS = (TL.captions || []).includes(SIZE);
  if (CAPTIONS) document.body.classList.add('has-captions');
  const errors = [];
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const FADE = 0.35;

  const KF = {
    up: () => [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }],
    down: () => [{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'none' }],
    left: () => [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }],
    right: () => [{ opacity: 0, transform: 'translateX(60px)' }, { opacity: 1, transform: 'none' }],
    fade: () => [{ opacity: 0 }, { opacity: 1 }],
    pop: () => [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1.05)', offset: 0.7 }, { opacity: 1, transform: 'none' }],
    zoom: () => [{ opacity: 0, transform: 'scale(1.15)' }, { opacity: 1, transform: 'none' }],
    'grow-x': () => [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }],
    'grow-y': () => [{ transform: 'scaleY(0)', transformOrigin: '50% 100%' }, { transform: 'scaleY(1)', transformOrigin: '50% 100%' }],
    type: () => [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    wipe: () => [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    draw: (el) => {
      const len = el.getTotalLength ? el.getTotalLength() : 1000;
      el.style.strokeDasharray = len;
      return [{ strokeDashoffset: len }, { strokeDashoffset: 0 }];
    },
    strike: () => [{ backgroundSize: '0% 6px' }, { backgroundSize: '100% 6px' }],
    none: () => [{ opacity: 1 }, { opacity: 1 }],
  };
  const DUR = { type: 1.2, draw: 1.2, 'grow-x': 0.8, 'grow-y': 0.8, pop: 0.6, strike: 0.5 };

  const byId = {};
  TL.scenes.forEach((s) => (byId[s.id] = s));
  const desc = (el) => `<${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''}> "${(el.textContent || '').trim().slice(0, 30)}"`;
  const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9.%]/g, '').replace(/\.+$/, '');

  function sceneOf(el) {
    const sec = el.closest('.scene');
    return sec ? byId[sec.dataset.scene] : null;
  }

  /* "@word#n+off" | "@word-off" | "1.2" -> absolute seconds */
  function at(spec, scene, el) {
    spec = String(spec).trim();
    const base = scene ? scene.start : 0;
    if (!spec.startsWith('@')) return base + (parseFloat(spec) || 0);
    const m = spec.match(/^@(.+?)(?:#(\d+))?([+-](?:\d{1,2}(?:\.\d+)?|\.\d+))?$/);  // offset: +0.3 / -0.3 (hyphenated words like follow-up stay whole)
    if (!m) { errors.push(`bad time "${spec}" on ${desc(el)}`); return base; }
    const want = norm(m[1]), nth = parseInt(m[2] || '1', 10), off = parseFloat(m[3] || '0');
    if (!scene) { errors.push(`"${spec}" on ${desc(el)}: word cues only work inside a .scene`); return 0; }
    const hits = (scene.words || []).filter((w) => norm(w.w) === want);
    if (hits.length < nth) {
      errors.push(`"${spec}" on ${desc(el)}: "${m[1]}" is not said${nth > 1 ? ' ' + nth + ' times' : ''} in scene "${scene.id}"`);
      return base;
    }
    return hits[nth - 1].start + off;
  }

  function anim(el, kf, start, dur, opts = {}) {
    return el.animate(kf, { delay: start * 1000, duration: dur * 1000, fill: opts.fill || 'both', easing: opts.easing || EASE });
  }

  const counters = [], videos = [];

  function parseSteps(str) {
    return str.split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
      const o = { flags: [] };
      s.split(/\s+/).forEach((tok) => {
        const kv = tok.match(/^(\w+)=(.+)$/);
        if (kv) o[kv[1]] = kv[2]; else o.flags.push(tok);
      });
      return o;
    });
  }

  /* Camera: data-cam="t=0 s=1 x=50 y=50; t=@results s=1.8 x=72 y=35"
     x/y = point of the image (in %) to put at the centre, s = zoom. Edges never show. */
  function buildCam(cam) {
    const scene = sceneOf(cam);
    const box = cam.parentElement.getBoundingClientRect();
    const W = box.width, H = box.height;
    const steps = parseSteps(cam.dataset.cam).map((st) => ({ t: at(st.t || '0', scene, cam), s: parseFloat(st.s || '1'), x: parseFloat(st.x || '50') / 100, y: parseFloat(st.y || '50') / 100 }));
    steps.sort((a, b) => a.t - b.t);
    const tf = (st) => {
      const cw = W * st.s, ch = cam.offsetHeight * (W / cam.offsetWidth) * st.s;
      let tx = W / 2 - st.x * cw, ty = H / 2 - st.y * ch;
      tx = Math.min(0, Math.max(W - cw, tx));
      ty = Math.min(0, Math.max(Math.min(0, H - ch), ty));
      return `translate(${tx}px, ${ty}px) scale(${st.s * W / cam.offsetWidth})`;
    };
    cam.style.transformOrigin = '0 0';
    cam.style.transform = tf(steps[0]);
    for (let i = 1; i < steps.length; i++) {
      const a = steps[i - 1], b = steps[i];
      const d = Math.max(0.3, Math.min(1.2, b.t - a.t));
      anim(cam, [{ transform: tf(a), transformOrigin: '0 0' }, { transform: tf(b), transformOrigin: '0 0' }], b.t - d * 0.15, d, { fill: 'forwards', easing: 'cubic-bezier(.65,0,.35,1)' });
    }
  }

  /* Cursor: data-path="t=0.5 x=20 y=30; t=@click x=62 y=41 click" (x/y in % of the parent) */
  function buildCursor(cur) {
    const scene = sceneOf(cur);
    const steps = parseSteps(cur.dataset.path).map((st) => ({ t: at(st.t || '0', scene, cur), x: parseFloat(st.x), y: parseFloat(st.y), click: st.flags.includes('click') }));
    steps.sort((a, b) => a.t - b.t);
    const pos = (st) => ({ left: st.x + '%', top: st.y + '%' });
    Object.assign(cur.style, pos(steps[0]));
    anim(cur, KF.fade(), steps[0].t, 0.3);
    for (let i = 1; i < steps.length; i++) {
      const a = steps[i - 1], b = steps[i];
      const d = Math.max(0.35, Math.min(0.9, b.t - a.t));
      anim(cur, [pos(a), pos(b)], b.t - d, d, { fill: 'forwards', easing: 'cubic-bezier(.55,0,.25,1)' });
    }
    steps.filter((s) => s.click).forEach((s) => {
      const r = document.createElement('div');
      r.className = 'click';
      Object.assign(r.style, pos(s));
      cur.parentElement.appendChild(r);
      anim(r, [{ opacity: 0.9, transform: 'translate(-50%,-50%) scale(.2)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.6)' }], s.t, 0.6, { fill: 'both' });
      anim(cur, [{ transform: 'scale(1)' }, { transform: 'scale(.85)', offset: 0.4 }, { transform: 'scale(1)' }], s.t - 0.05, 0.3, { fill: 'none' });
    });
  }

  function fmt(v, c) {
    const s = v.toLocaleString('en-US', { minimumFractionDigits: c.dec, maximumFractionDigits: c.dec });
    return c.prefix + s + c.suffix;
  }

  function build() {
    const scenes = [...document.querySelectorAll('.scene')];
    const seen = new Set();
    scenes.forEach((sec, i) => {
      const s = byId[sec.dataset.scene];
      if (!s) { errors.push(`.scene "${sec.dataset.scene}" is not in storyboard.json`); return; }
      seen.add(s.id);
      const first = s.start === 0, last = s.start + s.dur >= TL.total - 0.01;
      if (first && !TL.loop) sec.style.opacity = 1; else anim(sec, KF.fade(), s.start, FADE);
      if (!(last && !TL.loop)) anim(sec, [{ opacity: 1 }, { opacity: 0 }], s.start + s.dur - FADE, FADE, { fill: 'forwards' });
    });
    TL.scenes.forEach((s) => { if (!seen.has(s.id)) errors.push(`storyboard scene "${s.id}" has no <section class="scene" data-scene="${s.id}">`); });

    document.querySelectorAll('[data-in]').forEach((el) => {
      const scene = sceneOf(el);
      const t = at(el.dataset.in, scene, el);
      const kind = el.dataset.anim || 'up';
      if (!KF[kind]) { errors.push(`unknown data-anim "${kind}" on ${desc(el)}`); return; }
      const d = parseFloat(el.dataset.dur || DUR[kind] || 0.5);
      if (scene && t > scene.start + scene.dur - 0.5) errors.push(`${desc(el)} starts at ${(t - scene.start).toFixed(1)}s, after scene "${scene.id}" (${scene.dur.toFixed(1)}s) is nearly over`);
      if (el.matches('video')) { videos.push({ el, t }); }
      if (el.dataset.count !== undefined) {
        const to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || '0');
        const dec = el.dataset.decimals !== undefined ? parseInt(el.dataset.decimals, 10) : ((el.dataset.count.split('.')[1] || '').length);
        const c = { el, t, d: parseFloat(el.dataset.dur || 1.4), from, to, dec, prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '' };
        counters.push(c);
        el.textContent = fmt(from, c);
        anim(el, KF.fade(), t, 0.3);
        return;
      }
      anim(el, KF[kind](el), t, d);
      if (el.dataset.out) anim(el, [{ opacity: 1 }, { opacity: 0 }], at(el.dataset.out, scene, el), 0.3, { fill: 'forwards' });
    });

    document.querySelectorAll('[data-cam]').forEach(buildCam);
    document.querySelectorAll('[data-path]').forEach(buildCursor);
    document.querySelectorAll('.progress').forEach((p) => anim(p, [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }], 0, TL.total, { easing: 'linear' }));
    const cap = document.querySelector('.captions');
    if (cap && !CAPTIONS) cap.style.display = 'none';
  }

  const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  let anims = [];
  async function seek(t) {
    for (const a of anims) a.currentTime = t * 1000;
    for (const c of counters) c.el.textContent = fmt(c.from + (c.to - c.from) * ease((t - c.t) / c.d), c);
    const cap = document.querySelector('.captions');
    if (cap && CAPTIONS) {
      const cue = (TL.cues || []).find((q) => t >= q.start && t < q.end);
      cap.textContent = cue ? cue.text : '';
      cap.style.opacity = cue ? 1 : 0;
    }
    await Promise.all(videos.map(({ el, t: t0 }) => {
      const want = Math.max(0, Math.min(el.duration || 0, t - t0));
      if (Math.abs(el.currentTime - want) < 0.001) return null;
      return new Promise((res) => { el.addEventListener('seeked', res, { once: true }); el.currentTime = want; });
    }));
  }

  function fontsOk() {
    const fams = getComputedStyle(document.documentElement).getPropertyValue('--motion-fonts').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    return fams.filter((f) => !document.fonts.check(`700 40px "${f}"`));
  }

  const ready = (async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => errors.push(`image failed to load: ${i.getAttribute('src')}`)))));
    await Promise.all([...document.querySelectorAll('video')].map((v) => v.readyState >= 1 ? null : new Promise((r) => { v.addEventListener('loadedmetadata', r, { once: true }); v.addEventListener('error', () => { errors.push(`video failed to load: ${v.getAttribute('src')}`); r(); }, { once: true }); })));
    document.querySelectorAll('video').forEach((v) => { v.muted = true; v.pause(); });
    build();
    anims = document.getAnimations();
    anims.forEach((a) => a.pause());
    await seek(0);
    return true;
  })();

  window.motion = { ready, seek, errors, fontsOk, timeline: TL };

  if (!/[?&]render=1/.test(location.search)) {
    ready.then(() => {
      const t0 = performance.now();
      const tick = () => { const t = ((performance.now() - t0) / 1000) % TL.total; seek(t); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      if (errors.length) console.warn('motion errors:\n' + errors.join('\n'));
    });
  }
})();
