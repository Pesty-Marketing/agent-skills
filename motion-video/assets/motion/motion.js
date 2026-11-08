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
  const SPRING = 'cubic-bezier(.34,1.45,.64,1)';   // small overshoot: entrances land with a little snap
  const PRESET = (document.body.className.match(/preset-(\w+)/) || [])[1] || 'story';
  const FADE = 0.3;
  /* Scene transitions (data-trans on a .scene, default per preset): push | zoom | fade | cut */
  /* Pace: storyboard "pace": "punchy" -> hard cuts, 6-10 frame expo-out entrances, punch-ins, background motion. */
  const PUNCHY = TL.pace === 'punchy';
  const TRANS_DEFAULT = PUNCHY ? 'cut' : PRESET === 'loop' ? 'fade' : 'push';
  const EXPO = 'cubic-bezier(.16,1,.3,1)';
  const events = [];   // every animation start, for the pacing gate
  /* Sound cues for render.py: {t, kind, dur?}. Auto cues are motivated and sparse: a whoosh only when a cut
     changes the ground (white / ink / flood), a rolling count under every counter, a marker swipe under every
     highlight. Everything else (hits, stamp, riser, sting) is spotted by hand with data-sfx. */
  const sfx = [];
  const cue = (t, kind, dur) => sfx.push(dur ? { t: +t.toFixed(3), kind, dur: +dur.toFixed(3) } : { t: +t.toFixed(3), kind });
  const ground = (sec) => (sec.classList.contains('ink') ? 'ink' : sec.classList.contains('flood') ? 'flood' : 'plain');
  let prevGround = null;

  const KF = {
    up: () => [{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'none' }],
    down: () => [{ opacity: 0, transform: 'translateY(-60px)' }, { opacity: 1, transform: 'none' }],
    left: () => [{ opacity: 0, transform: 'translateX(-90px)' }, { opacity: 1, transform: 'none' }],
    right: () => [{ opacity: 0, transform: 'translateX(90px)' }, { opacity: 1, transform: 'none' }],
    slam: () => [{ opacity: 0, transform: 'scale(1.8)', filter: 'blur(12px)' }, { opacity: 1, transform: 'scale(.97)', filter: 'blur(0)', offset: 0.75 }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    blur: () => [{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(14px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    flip: () => [{ opacity: 0, transform: 'perspective(900px) rotateX(-80deg)', transformOrigin: '50% 100%' }, { opacity: 1, transform: 'perspective(900px) rotateX(0)', transformOrigin: '50% 100%' }],
    mark: () => [{ backgroundSize: '0% 38%' }, { backgroundSize: '100% 38%' }],
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
    none: () => [{ opacity: 0 }, { opacity: 1, offset: 0.001 }, { opacity: 1 }],  // hard cut in at data-in
  };
  const DUR = { type: 0.9, draw: 1.0, 'grow-x': 0.7, 'grow-y': 0.7, pop: 0.45, strike: 0.4, slam: 0.5, mark: 0.5, flip: 0.5 };
  const SPRINGY = new Set(['up', 'down', 'left', 'right', 'pop', 'flip']);

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
    if (opts.event !== false) events.push(start);
    return el.animate(kf, { delay: start * 1000, duration: dur * 1000, fill: opts.fill || 'both', easing: opts.easing || EASE, composite: opts.composite || 'replace' });
  }

  /* Split an element's text into word spans (keeps inline markup like <em>). */
  function splitWords(el) {
    if (el._words) return el._words;
    const out = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach((n) => {
      const parts = n.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        const w = document.createElement('span');
        w.className = 'w'; w.textContent = p;
        frag.appendChild(w); out.push(w);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return (el._words = out);
  }

  /* data-anim="words": words rise in one after another from data-in (data-stagger, default 0.07 s).
     data-anim="speak": each word appears as the narrator says it (falls back to a stagger). */
  function buildWords(el, scene, t, kind) {
    const ws = splitWords(el);
    const stag = parseFloat(el.dataset.stagger || '0.07');
    let times;
    if (kind === 'speak' && scene) {
      const said = (scene.words || []).filter((w) => w.start >= t - 0.05);
      let j = 0, last = t;
      times = ws.map((w) => {
        const want = norm(w.textContent);
        for (let k = j; k < Math.min(said.length, j + 4); k++) {
          if (norm(said[k].w) === want) { j = k + 1; last = said[k].start; return last; }
        }
        last += 0.12; return last;
      });
    } else {
      times = ws.map((_, i) => t + i * stag);
    }
    ws.forEach((w, i) => anim(w, [{ opacity: 0, transform: 'translateY(.45em) scale(.96)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], times[i], 0.32, { easing: SPRING, event: i === 0 || i % 3 === 0 }));
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
      const tr = sec.dataset.trans || TRANS_DEFAULT;
      const IN = {
        push: [{ opacity: 0, transform: 'translateX(160px)' }, { opacity: 1, transform: 'none' }],
        zoom: [{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'none' }],
        fade: KF.fade(),
        cut: [{ opacity: 0 }, { opacity: 1 }],
      }[tr] || KF.fade();
      const OUT = {
        push: [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-160px)' }],
        zoom: [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.12)' }],
        fade: [{ opacity: 1 }, { opacity: 0 }],
        cut: [{ opacity: 1 }, { opacity: 0 }],
      }[tr] || [{ opacity: 1 }, { opacity: 0 }];
      const td = tr === 'cut' ? 0.001 : FADE;
      /* data-cut-sfx="none" keeps the cut silent (e.g. a hush before a quote); any other value forces that sound */
      const g = ground(sec), forced = sec.dataset.cutSfx;
      if (!first && forced !== 'none' && (forced || g !== prevGround)) cue(s.start - (tr === 'cut' ? 0.12 : 0.05), forced || 'whoosh');
      prevGround = g;
      if (first && !TL.loop) sec.style.opacity = 1; else anim(sec, IN, s.start, td, { easing: 'cubic-bezier(.16,1,.3,1)' });
      if (!(last && !TL.loop)) anim(sec, OUT, s.start + s.dur - td, td, { fill: 'forwards', easing: tr === 'fade' ? EASE : 'cubic-bezier(.7,0,.84,0)', event: false });
      /* Ambient motion so no frame is ever frozen: the scene creeps forward, photos drift (Ken Burns).
         data-drift="off" on a scene turns it off. Added on top of the transition (composite add). */
      if (sec.dataset.drift !== 'off' && PRESET !== 'loop') {
        anim(sec, [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }], s.start, s.dur, { easing: 'linear', composite: 'add', event: false, fill: 'none' });
        sec.querySelectorAll('.photo img, img[data-kb]').forEach((img, k) => {
          const dir = k % 2 ? -1 : 1;
          anim(img, [{ transform: `scale(1.04) translateX(${-1.5 * dir}%)` }, { transform: `scale(1.16) translateX(${1.5 * dir}%)` }], s.start, s.dur, { easing: 'linear', event: false });
        });
      }
    });
    TL.scenes.forEach((s) => { if (!seen.has(s.id)) errors.push(`storyboard scene "${s.id}" has no <section class="scene" data-scene="${s.id}">`); });

    /* data-cards: children are shots shown one at a time; each hard-cuts out when the next one comes in. */
    document.querySelectorAll('[data-cards]').forEach((box) => {
      const kids = [...box.children].filter((k) => k.dataset.in !== undefined);
      const sc = sceneOf(box);
      kids.forEach((k, i) => { if (i + 1 < kids.length) k._cutAt = at(kids[i + 1].dataset.in, sc, kids[i + 1]); });
    });
    /* data-sfx="hit" plays at the element's data-in (on a counter: when it lands); "riser@@@pause-1" sets its own time.
       Several cues: "riser@@@in#2-1.85; stamp". Kinds: see scripts/sound.py SFX. */
    document.querySelectorAll('[data-sfx]').forEach((el) => {
      el.dataset.sfx.split(';').map((x) => x.trim()).filter(Boolean).forEach((spec) => {
        const [kind, when] = spec.split('@@');
        let t = at(when || el.dataset.in || '0', sceneOf(el), el);
        if (!when && el.dataset.count !== undefined) t += parseFloat(el.dataset.dur || 1.4) - 0.05;
        cue(t, kind);
      });
    });

    document.querySelectorAll('[data-in]').forEach((el) => {
      const scene = sceneOf(el);
      const t = at(el.dataset.in, scene, el);
      const kind = el.dataset.anim || 'up';
      if (kind === 'words' || kind === 'speak') {
        if (scene && t > scene.start + scene.dur - 0.5) errors.push(`${desc(el)} starts after scene "${scene.id}" is nearly over`);
        buildWords(el, scene, t, kind);
        if (el._cutAt !== undefined) { anim(el, [{ opacity: 1 }, { opacity: 0 }], el._cutAt, 0.001, { fill: 'forwards' }); }
        if (el.dataset.out) anim(el, [{ opacity: 1 }, { opacity: 0 }], at(el.dataset.out, scene, el), 0.25, { fill: 'forwards' });
        return;
      }
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
        anim(el, KF.pop(), t, 0.4, { easing: SPRING });
        anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.35 }, { transform: 'scale(1)' }], t + c.d - 0.05, 0.4, { fill: 'none', composite: 'add' });
        cue(t, 'count', c.d);
        if (el._cutAt !== undefined) anim(el, [{ opacity: 1 }, { opacity: 0 }], el._cutAt, 0.001, { fill: 'forwards' });
        return;
      }
      const dd = PUNCHY && !el.dataset.dur ? Math.min(d, kind === 'grow-y' || kind === 'grow-x' || kind === 'draw' ? 0.5 : 0.3) : d;
      anim(el, KF[kind](el), t, dd, { easing: SPRINGY.has(kind) ? SPRING : PUNCHY ? EXPO : EASE });
      if (kind === 'mark') cue(t, 'marker');
      if (el._cutAt !== undefined) { anim(el, [{ opacity: 1 }, { opacity: 0 }], el._cutAt, 0.001, { fill: 'forwards', event: true }); }
      if (el.dataset.out) anim(el, [{ opacity: 1 }, { opacity: 0 }], at(el.dataset.out, scene, el), 0.3, { fill: 'forwards' });
    });

    /* data-pulse="@word; @other" : a quick scale punch for emphasis (can repeat) */
    document.querySelectorAll('[data-pulse]').forEach((el) => {
      const scene = sceneOf(el);
      el.dataset.pulse.split(';').map((x) => x.trim()).filter(Boolean).forEach((spec) =>
        anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: 0.35 }, { transform: 'scale(1)' }], at(spec, scene, el), 0.45, { fill: 'none', composite: 'add' }));
    });

    /* Punch-in: data-punch="t=@18.1 s=1.25; t=@2025 s=1" on a scene or element. Hard step to scale s
       (around data-punch-origin, default centre), held until the next step or the scene's end. */
    document.querySelectorAll('[data-punch]').forEach((el) => {
      const scene = sceneOf(el);
      const end = scene ? scene.start + scene.dur : TL.total;
      if (el.dataset.punchOrigin) el.style.transformOrigin = el.dataset.punchOrigin;
      const steps = parseSteps(el.dataset.punch).map((st) => ({ t: at(st.t || '0', scene, el), s: parseFloat(st.s || '1.2') })).sort((a, b) => a.t - b.t);
      steps.forEach((st, i) => {
        const until = i + 1 < steps.length ? steps[i + 1].t : end;
        if (st.s === 1) return;
        anim(el, [{ transform: `scale(${st.s})` }, { transform: `scale(${st.s * 1.02})` }], st.t, Math.max(0.05, until - st.t), { fill: 'none', composite: 'add', easing: 'linear' });
      });
    });

    /* Background motion layer (punchy pace): soft shapes drifting behind every white scene. */
    if (PUNCHY && !document.querySelector('.bgfx')) {
      const fx = document.createElement('div');
      fx.className = 'bgfx';
      fx.innerHTML = '<i></i><i></i><i></i><b></b>';
      document.body.prepend(fx);
      const [a, b, c] = fx.querySelectorAll('i');
      const T = TL.total;
      anim(a, [{ transform: 'translate(-10%,-10%) rotate(0deg)' }, { transform: 'translate(30%,20%) rotate(160deg)' }], 0, T, { easing: 'linear', event: false });
      anim(b, [{ transform: 'translate(40%,60%) scale(1)' }, { transform: 'translate(-20%,10%) scale(1.4)' }], 0, T, { easing: 'linear', event: false });
      anim(c, [{ transform: 'translate(90%,-20%)' }, { transform: 'translate(50%,70%)' }], 0, T, { easing: 'linear', event: false });
      anim(fx.querySelector('b'), [{ backgroundPosition: '0 0' }, { backgroundPosition: `${T * 18}px ${T * 10}px` }], 0, T, { easing: 'linear', event: false });
    }

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

  /* Pacing: the longest stretch inside any scene with nothing new starting (scene start/end count). */
  function deadAir() {
    return TL.scenes.map((s) => {
      const ts = [s.start, ...events.filter((e) => e >= s.start && e < s.start + s.dur), s.start + s.dur].sort((a, b) => a - b);
      let gap = 0, at0 = s.start;
      for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > gap) { gap = ts[i] - ts[i - 1]; at0 = ts[i - 1]; }
      return { id: s.id, gap: +gap.toFixed(2), at: +(at0 - s.start).toFixed(2) };
    });
  }

  /* Shot list for the storyboard check: every moment the picture changes composition. */
  function shots() {
    const ts = [...new Set(events.map((e) => +e.toFixed(2)))].sort((a, b) => a - b);
    return ts;
  }
  function sfxList() {
    const order = { hit: 3, stamp: 3, sting: 3, riser: 3, whoosh: 2, count: 2, marker: 1, pop: 1, tick: 1 };
    const out = [];
    sfx.sort((a, b) => a.t - b.t).forEach((q) => {
      if (q.t < 0 || q.t > TL.total) return;
      const prev = out[out.length - 1];
      if (prev && q.t - prev.t < 0.15) { if (order[q.kind] > order[prev.kind]) out[out.length - 1] = q; return; }
      out.push(q);
    });
    return out;
  }

  window.motion = { ready, seek, errors, fontsOk, deadAir, shots, sfx: sfxList, timeline: TL };

  if (!/[?&]render=1/.test(location.search)) {
    ready.then(() => {
      const t0 = performance.now();
      const tick = () => { const t = ((performance.now() - t0) / 1000) % TL.total; seek(t); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      if (errors.length) console.warn('motion errors:\n' + errors.join('\n'));
    });
  }
})();
