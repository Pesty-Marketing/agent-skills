/* ==========================================================================
   Pesty Explainer Video — engine.js  (v1)
   A deterministic timeline engine for 1920x1080 explainer / SOP videos.

   THE MODEL: the whole video is ONE React tree rendered as a pure function of
   one clock, T (seconds). Nothing is driven by wall-clock time, CSS
   animations, CSS transitions or setTimeout. That is what makes the video
   scrubbable, frame-exact and exportable to MP4.

   Load order (see template.html): React 18 UMD -> ReactDOM -> engine.js ->
   kit.js -> your composition (<script type="text/babel">).

   Everything is exported on window.EV. Read references/engine-api.md.
   ========================================================================== */
(function () {
  'use strict';
  const React = window.React, ReactDOM = window.ReactDOM;
  if (!React || !ReactDOM) { console.error('[EV] Load React and ReactDOM before engine.js'); return; }
  const h = React.createElement;
  const W = 1920, H = 1080;
  const INK = '#002330', RED = '#D90429';

  // ------------------------------------------------------------------------
  // Math, easing, the motion helpers
  // ------------------------------------------------------------------------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
    easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    easeOutExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  };
  const ramp = (T, a, b) => clamp((T - a) / Math.max(b - a, 1e-6), 0, 1);

  // Use ONLY these for motion. Same curves everywhere = one coherent video.
  const M = {
    // element arrives: fade + small rise. Returns a style object.
    enter(T, at, dur = 0.45, dy = 14) {
      if (at == null || isNaN(at)) return {};
      const e = Easing.easeOutCubic(ramp(T, at, at + dur));
      return { opacity: e, transform: e >= 1 ? 'none' : `translateY(${((1 - e) * dy).toFixed(2)}px)` };
    },
    // element arrives with a little overshoot (badges, numbers, icons). Style object.
    pop(T, at, dur = 0.5) {
      if (at == null || isNaN(at)) return {};
      const p = ramp(T, at, at + dur);
      const s = p >= 1 ? 1 : 0.6 + 0.4 * Easing.easeOutBack(p);
      return { opacity: Math.min(1, p * 2.5), transform: p >= 1 ? 'none' : `scale(${s.toFixed(4)})` };
    },
    // a value travels from -> to between times a and b (camera, cursor, counters, widths)
    glide(T, a, b, from, to, ease) {
      return from + (to - from) * (ease || Easing.easeInOutCubic)(ramp(T, a, b));
    },
    // visibility window with soft edges: 0 before a, 1 inside, 0 after b. Returns 0..1
    fade(T, a, b, f = 0.35) {
      if (a == null || isNaN(a)) return 0;
      return Math.min(ramp(T, a, a + f), b == null || b === Infinity ? 1 : 1 - ramp(T, b - f, b));
    },
    // 0..1 progress for things that draw on (lines, bars, rings)
    draw(T, a, b) { return Easing.easeInOutCubic(ramp(T, a, b)); },
  };
  const typed = (T, at, text, cps = 18) => (at == null || T < at ? '' : String(text).slice(0, Math.max(0, Math.floor((T - at) * cps))));
  const typedEnd = (at, text, cps = 18) => at + String(text).length / cps;
  const count = (T, a, b, to, from = 0) => Math.round(M.glide(T, a, b, from, to));
  const lastAt = (list, T) => { let r = null; for (const e of list) if (e[0] <= T) r = e; return r; };
  const stagger = (at, i, step = 0.12) => at + i * step;

  // keyframe track: hold each value, glide to the next one over kf[durIdx] seconds
  function track(T, kfs, resolve, durIdx, dDefault = 0.9) {
    if (!kfs.length) return null;
    let i = -1;
    for (let j = 0; j < kfs.length; j++) if (kfs[j][0] <= T) i = j;
    if (i < 0) return resolve(kfs[0]);
    const cur = resolve(kfs[i]);
    if (i === 0) return cur;
    const prev = resolve(kfs[i - 1]);
    const a = kfs[i][0], d = typeof kfs[i][durIdx] === 'number' ? kfs[i][durIdx] : dDefault;
    const out = {};
    for (const k in cur) out[k] = M.glide(T, a, a + d, prev[k], cur[k]);
    return out;
  }

  // ------------------------------------------------------------------------
  // Timeline: scenes + script (+ measured voice-over times) -> cues
  // ------------------------------------------------------------------------
  const WPS = 2.6, LEAD = 0.5, TAIL = 0.7;
  const words = (s) => (String(s).replace(/\[[^\]]*\]/g, ' ').trim().match(/\S+/g) || []).length;
  const MISSING = new Set();
  function guard(obj, label) {
    return new Proxy(obj, {
      get(t, k) {
        if (typeof k !== 'string' || k in t || k === 'toJSON' || k === 'then' || k.startsWith('$$')) return t[k];
        if (!MISSING.has(label + '.' + k)) { MISSING.add(label + '.' + k); console.warn(`[EV] Unknown ${label} key "${k}"`); }
        return NaN;
      },
    });
  }
  function readJSON(id, fallback) {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const txt = el.textContent.trim();
    if (!txt) return fallback;
    try { return JSON.parse(txt); } catch (e) { console.error(`[EV] Invalid JSON in #${id}`, e); return fallback; }
  }
  function buildTimeline(scenesIn, script, vo) {
    const fixed = (vo && vo.times) || null, durs = (vo && vo.durs) || {};
    const scenes = [], items = [], V = {}, VE = {};
    let acc = 0, chapter = '';
    for (const s of scenesIn) {
      const chunks = (script && script[s.name]) || [];
      const wsum = chunks.reduce((a, c) => a + words(c[1]), 0);
      const est = chunks.length ? LEAD + wsum / WPS + 0.3 * (chunks.length - 1) + TAIL : 4;
      const dur = +(durs[s.name] != null ? durs[s.name] : s.dur != null ? s.dur : est);
      if (s.chapter) chapter = s.chapter;
      scenes.push({ name: s.name, chapter, desc: s.desc || '', tone: s.tone || '', start: acc, dur, est });
      const wts = chunks.map((c) => words(c[1]) + 0.6);
      const wt = wts.reduce((a, b) => a + b, 0) || 1;
      const avail = Math.max(0.5, dur - LEAD - TAIL);
      let t = acc + LEAD;
      chunks.forEach(([id, text], i) => {
        const d = (avail * wts[i]) / wt;
        let at = t, until = t + d - 0.12;
        if (fixed && fixed[id]) { at = fixed[id][0]; until = fixed[id][1]; }
        V[id] = at; VE[id] = until;
        items.push({ id, scene: s.name, text, at, until });
        t += d;
      });
      acc += dur;
    }
    items.sort((a, b) => a.at - b.at);
    const CUES = {};
    scenes.forEach((s) => { if (!(s.name in CUES)) CUES[s.name] = s.start; });
    return { scenes, items, V: guard(V, 'V'), VE: guard(VE, 'VE'), CUES: guard(CUES, 'CUES'), duration: acc, voiced: !!fixed };
  }
  const fmt = (t) => { t = Math.max(0, t); const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
  function srtTime(t) {
    const ms = Math.max(0, Math.round(t * 1000));
    const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000), ss = Math.floor((ms % 60000) / 1000), mmm = ms % 1000;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(mmm).padStart(3, '0')}`;
  }
  const toSRT = (items) => items.map((it, i) => `${i + 1}\n${srtTime(it.at)} --> ${srtTime(it.until)}\n${it.text}\n`).join('\n');

  // ------------------------------------------------------------------------
  // The plan: every camera move, spotlight, callout, click and state change
  // ------------------------------------------------------------------------
  const FRAME_INSET = {
    none: { t: 0, r: 0, b: 0, l: 0 },
    window: { t: 0, r: 0, b: 0, l: 0 },
    browser: { t: 52, r: 0, b: 0, l: 0 },
    ipad: { t: 26, r: 26, b: 26, l: 26 },
    phone: { t: 16, r: 16, b: 16, l: 16 },
  };
  function makePlan() {
    const P = { layers: {}, cams: {}, spots: [], callouts: [], clicks: [], taps: [], states: {}, cursorWin: [] };
    const api = {
      P,
      layer(id, cfg) {
        const c = Object.assign({ mode: 'inside', frame: 'none', radius: null }, cfg);
        const rect = c.rect || c.box || { x: 48, y: 88, w: 1824, h: 868 };
        const ins = FRAME_INSET[c.frame] || FRAME_INSET.none;
        c.rect = rect;
        c.box = c.box || { x: rect.x + ins.l, y: rect.y + ins.t, w: rect.w - ins.l - ins.r, h: rect.h - ins.t - ins.b };
        P.layers[id] = c; P.cams[id] = P.cams[id] || [];
        return api;
      },
      cam(id, at, key, zoom = 1, dur) { (P.cams[id] = P.cams[id] || []).push([at, key || null, zoom, dur]); return api; },
      spot(a, b, keys, opts) { P.spots.push([a, b, [].concat(keys), opts || {}]); return api; },
      callout(a, b, keys, text, side, opts) { P.callouts.push([a, b, [].concat(keys), text, side || null, opts || {}]); return api; },
      click(at, key) { P.clicks.push([at, key, true]); return api; },
      hover(at, key) { P.clicks.push([at, key, false]); return api; },
      tap(at, key) { P.taps.push([at, key]); return api; },
      set(name, at, value) { (P.states[name] = P.states[name] || []).push([at, value]); return api; },
      cursor(a, b) { P.cursorWin.push([a, b]); return api; },
    };
    return api;
  }
  function finalizePlan(P) {
    const byT = (a, b) => a[0] - b[0];
    for (const id in P.cams) P.cams[id].sort(byT);
    P.spots.sort(byT); P.callouts.sort(byT); P.clicks.sort(byT); P.taps.sort(byT); P.cursorWin.sort(byT);
    for (const n in P.states) P.states[n].sort(byT);
    // state readers
    P.get = (name, T, fallback) => { const l = P.states[name]; const e = l && lastAt(l, T); return e ? e[1] : fallback; };
    P.since = (name, T) => { const l = P.states[name]; const e = l && lastAt(l, T); return e ? T - e[0] : Infinity; };
    P.entry = (name, T) => { const l = P.states[name]; return (l && lastAt(l, T)) || null; };
    // auto cursor windows: clicks closer than 6s belong to one run
    if (!P.cursorWin.length && P.clicks.length) {
      let a = P.clicks[0][0], b = a;
      for (const c of P.clicks) { if (c[0] - b > 6) { P.cursorWin.push([a - 1.1, b + 1.4]); a = c[0]; } b = c[0]; }
      P.cursorWin.push([a - 1.1, b + 1.4]);
    }
    // every key referenced by the plan (checked against the layout for diagnostics)
    const keys = new Set();
    for (const id in P.cams) P.cams[id].forEach((k) => k[1] && keys.add(k[1]));
    P.spots.forEach((s) => s[2].forEach((k) => keys.add(k)));
    P.callouts.forEach((s) => s[2].forEach((k) => keys.add(k)));
    P.clicks.forEach((s) => keys.add(s[1])); P.taps.forEach((s) => keys.add(s[1]));
    P.keys = [...keys];
    return P;
  }

  // keys the plan is aiming at right now (for the "missing element" diagnostics)
  function activeKeys(P, T) {
    const out = new Set();
    for (const id in P.cams) { const e = lastAt(P.cams[id], T); if (e && e[1] && T - e[0] < 1.2) out.add(e[1]); }
    P.spots.forEach(([a, b, keys]) => { if (T >= a + 0.3 && T < b) keys.forEach((k) => out.add(k)); });
    P.callouts.forEach(([a, b, keys]) => { if (T >= a + 0.3 && T < b) keys.forEach((k) => out.add(k)); });
    P.clicks.forEach(([at, k]) => { if (T >= at - 0.05 && T < at + 0.2) out.add(k); });
    P.taps.forEach(([at, k]) => { if (T >= at - 0.05 && T < at + 0.2) out.add(k); });
    return [...out];
  }

  // ------------------------------------------------------------------------
  // Element registry + transform-free layout measurement
  // ------------------------------------------------------------------------
  const REG = {}, REFS = {};
  const reg = (k) => REFS[k] || (REFS[k] = (el) => { if (el) REG[k] = el; else delete REG[k]; });
  function measureEl(el) {
    if (!el.isConnected || (el.offsetWidth === 0 && el.offsetHeight === 0 && !el.offsetParent)) return null;
    let x = 0, y = 0, n = el;
    while (n) {
      if (n !== el && n.dataset && n.dataset.evLayer) return { layer: n.dataset.evLayer, x, y, w: el.offsetWidth, h: el.offsetHeight };
      x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent;
    }
    return null;
  }
  function measureAll() {
    const out = {};
    for (const k in REG) { const m = measureEl(REG[k]); if (m) out[k] = m; }
    return out;
  }

  // ------------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------------
  // 'whole' layers (a device that zooms as one piece) live in the band between
  // the chapter label and the captions, so neither is ever covered
  const wholeView = (cfg) => cfg.view || { x: 0, y: 72, w: W, h: 888 };
  function camAt(P, id, T, L) {
    const cfg = P.layers[id], box = cfg.box;
    const root = L['layer:' + id];
    const cw = (cfg.content && cfg.content.w) || box.w;
    const ch = Math.max((cfg.content && cfg.content.h) || 0, root ? root.h : 0, 1);
    const base = box.w / cw;
    const view = cfg.mode === 'whole' ? wholeView(cfg) : box;
    const rest = { s: base, x: box.x, y: box.y };
    const resolve = (kf) => {
      const key = kf[1], z = kf[2] || 1;
      const r = key ? L[key] : null;
      const usable = r && r.layer === id;
      if (!usable && z <= 1) return rest;
      let s = base * z;
      if (usable) {
        const pad = 36;
        const maxS = Math.min(view.w / (r.w + pad * 2), view.h / (r.h + pad * 2));
        if (s > maxS) s = Math.max(base, maxS);
      }
      const fx = usable ? r.x + r.w / 2 : cw / 2;
      const fy = usable ? r.y + r.h / 2 : (box.h / base) / 2;
      const cwS = cw * s, chS = ch * s;
      let x = view.x + view.w / 2 - s * fx, y = view.y + view.h / 2 - s * fy;
      const xa = view.x + view.w - cwS, xb = view.x, ya = view.y + view.h - chS, yb = view.y;
      x = cwS >= view.w || cfg.mode === 'whole' ? clamp(x, Math.min(xa, xb), Math.max(xa, xb)) : box.x + (box.w - cwS) / 2;
      y = chS >= view.h || cfg.mode === 'whole' ? clamp(y, Math.min(ya, yb), Math.max(ya, yb)) : box.y;
      return { s, x, y };
    };
    // the camera rests until its first keyframe, then glides into it
    const kfs = [[-1e9, null, 1, 0]].concat(P.cams[id] || []);
    const v = track(T, kfs, resolve, 3, 1.0) || rest;
    return { s: v.s, x: v.x, y: v.y, base, cw, ch };
  }

  // ------------------------------------------------------------------------
  // Context + hooks
  // ------------------------------------------------------------------------
  const Ctx = React.createContext(null);
  const useVideo = () => React.useContext(Ctx);
  const OPTS = { current: null };

  // Re-renders only while `on`; frozen otherwise (keeps off-screen trees cheap)
  const Hold = React.memo(function Hold(p) { return p.render(p.T); }, (a, b) => !a.on && !b.on);

  // A full-stage section, visible from `from` until `to`, fading in over `fade`.
  // The later Scene in the tree paints on top, so a hard cut / crossfade is just
  // two Scenes whose windows touch. render(T, op) is only called while visible.
  function Scene(props) {
    const { T } = useVideo();
    const { from = 0, to = Infinity, fade = 0.45, out = 0, bg, render, style, children } = props;
    const on = T >= from - 0.001 && T < to + fade + out;
    const opIn = from <= 0 ? 1 : Easing.easeOutCubic(ramp(T, from, from + fade));
    const opOut = out > 0 ? 1 - ramp(T, to, to + out) : 1;
    return h('div', {
      style: Object.assign({ position: 'absolute', inset: 0, overflow: 'hidden', opacity: on ? Math.min(opIn, opOut) : 0, visibility: on ? 'inherit' : 'hidden', background: bg }, style),
    }, h(Hold, { on, T, render: (t) => (render ? render(t, opIn) : children) }));
  }

  // A camera layer: content you can zoom/pan into with p.cam(...)
  function Layer({ id, children, op = 1, style, contentStyle }) {
    const v = useVideo();
    const cfg = v.P.layers[id];
    if (!cfg) { console.warn(`[EV] <Layer id="${id}"> has no p.layer('${id}', ...) in the plan`); return null; }
    const cam = v.cams[id];
    const content = h('div', {
      ref: reg('layer:' + id), 'data-ev-layer': id,
      style: Object.assign({ position: 'relative', width: cam.cw, minHeight: cfg.content && cfg.content.h ? cfg.content.h : undefined }, contentStyle),
    }, children);
    const vis = op > 0 ? 'inherit' : 'hidden';
    if (cfg.mode === 'whole') {
      const vw = wholeView(cfg);
      return h('div', { style: Object.assign({ position: 'absolute', left: vw.x, top: vw.y, width: vw.w, height: vw.h, overflow: 'hidden', opacity: op, visibility: vis, pointerEvents: 'none' }, style) },
        h('div', { style: { position: 'absolute', left: 0, top: 0, transform: `translate(${cam.x - vw.x}px, ${cam.y - vw.y}px) scale(${cam.s})`, transformOrigin: '0 0' } },
          cfg.frame && cfg.frame !== 'none' ? h(DeviceBezel, { kind: cfg.frame, w: cam.cw, h: cam.ch }) : null,
          h('div', { style: { position: 'relative', borderRadius: cfg.frame === 'ipad' ? 22 : cfg.frame === 'phone' ? 34 : 0, overflow: 'hidden', background: cfg.bg || '#fff' } }, content)));
    }
    const b = cfg.box;
    return h('div', { style: Object.assign({ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: op, visibility: vis }, style) },
      cfg.frame && cfg.frame !== 'none' ? h(WindowFrame, { cfg }) : null,
      h('div', { style: { position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, overflow: 'hidden', background: cfg.bg || '#fff', borderRadius: frameInnerRadius(cfg) } },
        h('div', { style: { position: 'absolute', left: 0, top: 0, transform: `translate(${cam.x - b.x}px, ${cam.y - b.y}px) scale(${cam.s})`, transformOrigin: '0 0' } }, content)));
  }
  function frameInnerRadius(cfg) {
    if (cfg.radius != null) return cfg.radius;
    if (cfg.frame === 'browser') return '0 0 16px 16px';
    if (cfg.frame === 'window') return 16;
    if (cfg.frame === 'ipad') return 22;
    if (cfg.frame === 'phone') return 34;
    return 0;
  }
  function WindowFrame({ cfg }) {
    const r = cfg.rect, kind = cfg.frame;
    const dark = cfg.frameTone === 'dark';
    if (kind === 'browser' || kind === 'window') {
      return h('div', { style: { position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 16, background: dark ? '#0E1417' : '#fff', boxShadow: '0 30px 70px rgba(0,35,48,0.18), 0 0 0 1px rgba(0,35,48,0.08)' } },
        kind === 'browser' ? h('div', { style: { position: 'absolute', left: 0, top: 0, right: 0, height: 52, display: 'flex', alignItems: 'center', gap: 18, padding: '0 20px', borderBottom: '1px solid rgba(0,35,48,0.08)', background: dark ? '#141C20' : '#F6F8F9', borderRadius: '16px 16px 0 0' } },
          h('div', { style: { display: 'flex', gap: 8 } }, ['#FF5F57', '#FEBC2E', '#28C840'].map((c) => h('span', { key: c, style: { width: 12, height: 12, borderRadius: 99, background: c } }))),
          h('div', { style: { flex: 1, maxWidth: 760, margin: '0 auto', height: 32, borderRadius: 10, background: dark ? '#0E1417' : '#fff', border: '1px solid rgba(0,35,48,0.1)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', fontFamily: 'Montserrat, system-ui, sans-serif', fontSize: 15, color: dark ? '#C3CBD0' : '#4E5B62' } },
            h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' }, h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2 }), h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })),
            cfg.url || ''),
          h('div', { style: { width: 60 } })) : null);
    }
    if (kind === 'ipad' || kind === 'phone') {
      const rad = kind === 'ipad' ? 48 : 58;
      return h('div', { style: { position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: rad, background: '#0E1417', boxShadow: '0 40px 80px rgba(0,35,48,0.35), inset 0 0 0 2px #2A3338' } });
    }
    return null;
  }
  function DeviceBezel({ kind, w, h: hh }) {
    const pad = kind === 'ipad' ? 26 : 16, rad = kind === 'ipad' ? 48 : 52;
    return h('div', { style: { position: 'absolute', left: -pad, top: -pad, width: w + pad * 2, height: hh + pad * 2, borderRadius: rad, background: '#0E1417', boxShadow: '0 40px 80px rgba(0,35,48,0.35), inset 0 0 0 2px #2A3338' } });
  }

  // An invisible target over part of an image/screenshot, so the camera,
  // spotlight, callouts and cursor can aim at it: <Hotspot k="btn.save" x y w h/>
  function Hotspot({ k, x, y, w, h: hh, debug }) {
    return h('div', { ref: reg(k), style: { position: 'absolute', left: x, top: y, width: w, height: hh, pointerEvents: 'none', outline: debug ? '2px dashed #D90429' : 'none' } });
  }

  // ------------------------------------------------------------------------
  // Overlays: spotlight, callouts, cursor, taps
  // ------------------------------------------------------------------------
  function glideRect(T, a, b, r0, r1) {
    return { x: M.glide(T, a, b, r0.x, r1.x), y: M.glide(T, a, b, r0.y, r1.y), w: M.glide(T, a, b, r0.w, r1.w), h: M.glide(T, a, b, r0.h, r1.h) };
  }
  function Spotlight({ dim = 0.38, color = RED, radius = 14 }) {
    const v = useVideo(), T = v.T, P = v.P;
    let spot = null;
    P.spots.forEach(([a, b, keys, o], i) => {
      if (T < a || T >= b) return;
      const prev = P.spots[i - 1], next = P.spots[i + 1];
      const contPrev = prev && Math.abs(prev[1] - a) < 0.08, contNext = next && Math.abs(next[0] - b) < 0.08;
      let r = v.union(keys, o.pad != null ? o.pad : 10);
      if (contPrev && r) { const pr = v.union(prev[2], prev[3].pad != null ? prev[3].pad : 10); if (pr) r = glideRect(T, a, a + 0.5, pr, r); }
      const op = Math.min(contPrev ? 1 : ramp(T, a, a + 0.3), contNext ? 1 : 1 - ramp(T, b - 0.3, b));
      spot = { r, op, o, keys };
    });
    if (!spot || !spot.r || spot.op <= 0) return null;
    const first = v.L[spot.keys[0]];
    const cfg = first && v.P.layers[first.layer];
    const clip = spot.o.clip || (cfg ? (cfg.mode === 'whole' ? wholeView(cfg) : cfg.box) : { x: 0, y: 0, w: W, h: H });
    const r = spot.r;
    return h('div', { style: { position: 'absolute', left: clip.x, top: clip.y, width: clip.w, height: clip.h, overflow: 'hidden', pointerEvents: 'none', opacity: spot.op, borderRadius: cfg ? frameInnerRadius(cfg) : 0 } },
      h('div', { style: { position: 'absolute', left: r.x - clip.x, top: r.y - clip.y, width: r.w, height: r.h, borderRadius: spot.o.radius != null ? spot.o.radius : radius, boxShadow: `0 0 0 3px ${spot.o.color || color}, 0 0 0 4000px rgba(0,35,48,${spot.o.dim != null ? spot.o.dim : dim})` } }));
  }

  const SAFE_TOP = 76, SAFE_BOTTOM = H - 132;
  function CalloutBox({ rect, text, op, dark, side: want, avoid, accent = RED }) {
    if (!rect || op <= 0) return null;
    const w = Math.round(String(text).length * 12.6 + 46), hh = 48;
    const place = (sd) => {
      if (sd === 'right') return [rect.x + rect.w + 64, rect.y + rect.h / 2 - hh / 2];
      if (sd === 'left') return [rect.x - 64 - w, rect.y + rect.h / 2 - hh / 2];
      const lx = Math.min(W - 40 - w, Math.max(40, rect.x + rect.w / 2 - w / 2));
      return sd === 'top' ? [lx, rect.y - hh - 44] : [lx, rect.y + rect.h + 44];
    };
    const hit = (x, y, r) => r && x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + hh > r.y;
    const fits = ([x, y]) => x >= 40 && x + w <= W - 40 && y >= SAFE_TOP && y + hh <= SAFE_BOTTOM && !hit(x, y, avoid);
    const order = want ? [want, 'right', 'left', 'bottom', 'top'] : ['right', 'left', 'bottom', 'top'];
    const side = order.find((sd) => fits(place(sd))) || order[0];
    let [lx, ly] = place(side);
    lx = clamp(lx, 40, W - 40 - w); ly = clamp(ly, SAFE_TOP, SAFE_BOTTOM - hh);
    const ax = side === 'right' ? rect.x + rect.w + 6 : side === 'left' ? rect.x - 6 : rect.x + rect.w / 2;
    const ay = side === 'top' ? rect.y - 6 : side === 'bottom' ? rect.y + rect.h + 6 : rect.y + rect.h / 2;
    const bx = side === 'right' ? lx : side === 'left' ? lx + w : Math.min(lx + w - 24, Math.max(lx + 24, ax));
    const by = side === 'top' ? ly + hh : side === 'bottom' ? ly : ly + hh / 2;
    const e = Easing.easeOutCubic(op);
    return h('div', { style: { position: 'absolute', inset: 0, opacity: op, pointerEvents: 'none' } },
      h('svg', { width: W, height: H, style: { position: 'absolute', left: 0, top: 0, overflow: 'visible' } },
        h('line', { x1: ax, y1: ay, x2: ax + (bx - ax) * e, y2: ay + (by - ay) * e, stroke: accent, strokeWidth: 3, strokeLinecap: 'round' }),
        h('circle', { cx: ax, cy: ay, r: 6, fill: accent, stroke: '#fff', strokeWidth: 2.5 })),
      h('div', { style: { position: 'absolute', left: lx, top: ly, height: hh, padding: '0 22px', display: 'flex', alignItems: 'center', borderRadius: 999, background: dark ? '#fff' : INK, color: dark ? INK : '#fff', fontFamily: "Epilogue, 'Segoe UI', system-ui, sans-serif", fontWeight: 600, fontSize: 22, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,35,48,0.28)', transform: `translateY(${((1 - e) * 6).toFixed(2)}px)` } }, text));
  }
  function Callouts({ dark }) {
    const v = useVideo(), T = v.T;
    if (!v.showCallouts) return null;
    return h(React.Fragment, null, v.P.callouts.filter(([a, b]) => T >= a - 0.01 && T < b).map(([a, b, keys, text, side, o], i) =>
      h(CalloutBox, { key: i + ':' + text, rect: v.union(keys, 4), text, side, op: M.fade(T, a, b, 0.35), dark: o.dark != null ? o.dark : typeof dark === 'function' ? dark(T) : dark, avoid: o.avoid ? v.union([].concat(o.avoid), 8) : null, accent: o.accent })));
  }
  function Pointer({ x, y, press, op }) {
    return h('div', { style: { position: 'absolute', left: x - 4, top: y - 2, width: 32, height: 36, opacity: op, transform: `scale(${press})`, transformOrigin: '4px 2px', pointerEvents: 'none', filter: 'drop-shadow(0 3px 6px rgba(0,35,48,0.35))' } },
      h('svg', { viewBox: '0 0 24 28', width: 32, height: 36 }, h('path', { d: 'M3 2 L3 22 L8.2 17.2 L11.6 25 L15 23.5 L11.7 15.9 L18.6 15.6 Z', fill: '#fff', stroke: INK, strokeWidth: 1.6, strokeLinejoin: 'round' })));
  }
  function Ripple({ x, y, p, color = RED }) {
    if (p <= 0 || p >= 1) return null;
    const r = 10 + 26 * Easing.easeOutCubic(p);
    return h('div', { style: { position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `3px solid ${color}`, opacity: 0.7 * (1 - p), pointerEvents: 'none' } });
  }
  function Cursor() {
    const v = useVideo(), T = v.T, pts = v.P.clicks;
    if (!pts.length) return null;
    const win = v.P.cursorWin.find(([a, b]) => T >= a && T < b);
    if (!win) return null;
    let op = M.fade(T, win[0], win[1], 0.35);
    const pos = (e) => { const r = v.rectOf(e[1]); return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null; };
    let i = -1; for (let j = 0; j < pts.length; j++) if (pts[j][0] <= T) i = j;
    const next = pts[i + 1];
    const here = i >= 0 && pts[i][0] >= win[0] ? pos(pts[i]) : null;
    const nextPos = next && next[0] < win[1] ? pos(next) : null;
    // the last target is gone (the click opened another page, or the camera moved
    // it out of view): hide the pointer instead of jumping, and bring it back
    // near the next target just before its glide
    if (i >= 0 && pts[i][0] >= win[0] && !here) {
      const back = nextPos ? ramp(T, next[0] - 1.05, next[0] - 0.8) : 0;
      if (back <= 0) return h(React.Fragment, null);
      op *= back;
    }
    const from = here || (nextPos ? { x: nextPos.x + 170, y: nextPos.y + 130 } : { x: W - 260, y: H - 240 });
    let cur;
    if (nextPos) {
      const a = Math.max(i >= 0 ? pts[i][0] + 0.2 : next[0] - 0.85, next[0] - 0.8);
      cur = { x: M.glide(T, a, next[0], from.x, nextPos.x), y: M.glide(T, a, next[0], from.y, nextPos.y) };
    } else cur = Object.assign({}, from);
    const ce = i >= 0 && pts[i][2] ? pts[i] : null;
    const press = ce && T - ce[0] < 0.16 ? 0.86 : 1;
    const rp = ce ? (T - ce[0]) / 0.45 : 0;
    const rpos = ce ? pos(ce) || cur : cur;
    return h(React.Fragment, null, ce ? h(Ripple, { x: rpos.x, y: rpos.y, p: rp }) : null, h(Pointer, { x: cur.x, y: cur.y, press, op }));
  }
  function Taps() {
    const v = useVideo(), T = v.T;
    const e = lastAt(v.P.taps, T + 0.3); if (!e) return null;
    const r = v.rectOf(e[1]); if (!r) return null;
    const t = T - e[0]; if (t < -0.3 || t > 0.7) return null;
    const x = r.x + r.w / 2, y = r.y + r.h / 2;
    const pre = ramp(t, -0.3, 0), post = ramp(t, 0, 0.7);
    const s = t < 0 ? 1.15 - 0.15 * pre : 1 + 0.6 * post;
    const op = t < 0 ? pre * 0.9 : 0.9 * (1 - post);
    return h('div', { style: { position: 'absolute', left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 99, background: 'rgba(255,255,255,0.55)', border: '3px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 18px rgba(0,35,48,0.35)', transform: `scale(${s.toFixed(3)})`, opacity: op, pointerEvents: 'none' } });
  }
  function Overlays(props) {
    return h(React.Fragment, null, h(Spotlight, props), h(Callouts, props), h(Taps), h(Cursor));
  }

  // ------------------------------------------------------------------------
  // Captions, chapter label, lower third
  // ------------------------------------------------------------------------
  function Captions({ y = 1014, maxWidth = 1560, variant = 'plain', dark, size = 32 }) {
    const v = useVideo(), T = v.T;
    if (!v.cc) return null;
    const its = v.items;
    let it = null, k = -1;
    for (let i = 0; i < its.length; i++) {
      const a = its[i].at, b = Math.max(its[i].until, its[i + 1] && its[i + 1].at - its[i].until < 0.7 ? its[i + 1].at : its[i].until);
      if (T >= a && T < b) { it = its[i]; k = i; }
    }
    if (!it) return null;
    const isDark = typeof dark === 'function' ? dark(T) : !!dark;
    const op = Math.min(ramp(T, it.at, it.at + 0.15), 1);
    const pill = variant === 'pill';
    return h('div', { style: { position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', opacity: op } },
      h('div', { key: k, style: { maxWidth, textAlign: 'center', fontFamily: 'Montserrat, system-ui, sans-serif', fontWeight: 500, fontSize: size, lineHeight: 1.3, color: pill || isDark ? '#fff' : INK, background: pill ? 'rgba(0,35,48,0.86)' : 'transparent', padding: pill ? '10px 24px' : 0, borderRadius: pill ? 14 : 0, textWrap: 'balance' } }, it.text));
  }
  const PESTY_MARK = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NiIgaGVpZ2h0PSI3MyIgdmlld0JveD0iMCAwIDY2IDczIiBmaWxsPSJub25lIj48cGF0aCBkPSJNNjUuMTYgMTQuNzgxOUM2MS4zNTEzIDE0IDU3LjE3MjcgMTUuMzk5OSA1My40NzMzIDE3LjI0OTZMNTMuNDIyOSAyMC4wNDUyQzU2Ljg2NTggMTguMTU3NiA2MC45ODk4IDE2LjQ1MDkgNjQuNTU4OSAxNy4xNzgxQzY2LjEzMTEgMTcuNTEwMiA2Ni43NDQ5IDE1LjExNCA2NS4xNiAxNC43ODE5WiIgZmlsbD0iI0Q5MDQyOSI+PC9wYXRoPjxwYXRoIGQ9Ik00Mi44Mzc2IDE0LjE2OEw0NS4yMDg2IDEyLjYxMjZDNDQuODg5MSA4LjQ3NjAxIDQzLjkyMjIgNC4xNjI4NSA0MS4yODIyIDEuMjk1ODNDNDAuMjAxOCAwLjEyMjk1MSAzOC40NjE0IDEuODgwMTYgMzkuNTM3NiAzLjA0ODgzQzQyLjAzODkgNS43NTE5MSA0Mi42ODYyIDEwLjIyMDYgNDIuODM3NiAxNC4xNjhaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PHBhdGggZD0iTTM3LjAxNTYgNTcuNDg1NUM0MS4yODI1IDYyLjU5NzQgNDguMzA3MiA3MC45OTY3IDQ5LjAwMDggNzEuODI5QzUwLjQyMTcgNzMuNTEwNiA1MS45NzI5IDczLjA0ODEgNTEuOTQzNSA3MC40ODhDNTEuOTQzNSA2OS45NzkzIDUxLjk0MzUgNTguMjI5NSA1MS45NDM1IDQ3LjU1MThDNDYuNTA3OSA1MS4xNzEzIDQxLjE0MzggNTQuNzQwNCAzNy4wMTU2IDU3LjQ4NTVaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PHBhdGggZD0iTTEuOTA0NDUgNDYuNTY3NEwyMC40ODU1IDQ4LjYxODlDMjAuNDg1NSA0My42NTg0IDIwLjQ4NTUgMzcuMjE4MSAyMC40ODU1IDMwLjY2ODVDMTEuNTk4NSAzNi41ODMzIDEuODE2MTcgNDMuMDg2NiAxLjM4NzM4IDQzLjM2ODNDLTAuNzUyMzg2IDQ0Ljc2NCAtMC4yODk5NjEgNDYuMzExIDEuOTA0NDUgNDYuNTY3NFoiIGZpbGw9IiNEOTA0MjkiPjwvcGF0aD48cGF0aCBkPSJNNTEuOTcyOSAxNS41MTM1QzUxLjk3MjkgMTMuNzE0MiA1MS41MTA1IDEyLjYwMDIgNTAuNzExNyAxMi4xMTY4QzQ5Ljg3MSAxMS42OTY0IDQ4LjY4MTMgMTEuOTQ0NCA0Ny4xODA1IDEyLjk1NzVMMjMuMjM1NCAyOC44NTIzQzIzLjIzNTQgNDEuMDQzNSAyMy4yMzU0IDUzLjY1NTEgMjMuMjM1NCA1Ny41OTgzQzIzLjIzNTQgNTkuNDAxNyAyMy42OTc4IDYwLjUxNTggMjQuNDk2NSA2MC45OTVDMjUuMzM3MyA2MS40MTU0IDI2LjUyNyA2MS4xNzE2IDI4LjAyNzcgNjAuMTU0MkMzMS4zMjc4IDU3Ljk2NCA0MS43OTk2IDUwLjk5NCA1MS45Njg3IDQ0LjI0MjZDNTEuOTY0NSAzMi4wNTU3IDUxLjk3MjkgMTkuNDczNSA1MS45NzI5IDE1LjUxMzVaIiBmaWxsPSIjRDkwNDI5Ij48L3BhdGg+PC9zdmc+';
  function PestyMarkSVG({ s = 22 }) {
    return h('img', { src: PESTY_MARK, width: s, height: Math.round((s * 73) / 66), alt: '', style: { display: 'block', flex: 'none' } });
  }
  function ChapterLabel({ x = 48, y = 30, dark, mark = true }) {
    const v = useVideo(), T = v.T;
    const sc = v.sceneAt(T); if (!sc || !sc.chapter) return null;
    let chStart = 0, prev = null;
    for (const s of v.scenes) { if (s.start > T) break; if (s.chapter !== prev) { chStart = s.start; prev = s.chapter; } }
    const op = chStart <= 0 ? 1 : ramp(T, chStart, chStart + 0.4);
    const isDark = typeof dark === 'function' ? dark(T) : !!dark;
    return h('div', { 'data-noclaim': '', style: { position: 'absolute', left: x, top: y, height: 40, display: 'flex', alignItems: 'center', gap: 12, opacity: op, fontFamily: "Epilogue, 'Segoe UI', system-ui, sans-serif", fontWeight: 600, fontSize: 21, color: isDark ? '#fff' : INK, pointerEvents: 'none' } },
      mark ? h(PestyMarkSVG, { s: 24 }) : null, h('span', null, sc.chapter));
  }
  function LowerThird({ x = 72, y = 884, state = 'lower', dark }) {
    const v = useVideo(), T = v.T;
    const e = v.P.entry(state, T);
    if (!e || !e[1]) return null;
    const op = Math.min(ramp(T, e[0], e[0] + 0.35));
    const isDark = typeof dark === 'function' ? dark(T) : !!dark;
    return h('div', { style: { position: 'absolute', left: x, top: y, height: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px 0 18px', borderRadius: 999, background: isDark ? '#fff' : INK, color: isDark ? INK : '#fff', fontFamily: "Epilogue, 'Segoe UI', system-ui, sans-serif", fontWeight: 600, fontSize: 21, boxShadow: '0 12px 30px rgba(0,35,48,0.28)', opacity: op, transform: `translateY(${((1 - Easing.easeOutCubic(op)) * 10).toFixed(2)}px)`, pointerEvents: 'none', whiteSpace: 'nowrap' } },
      h('span', { style: { width: 10, height: 10, borderRadius: 99, background: RED, flex: 'none' } }), e[1]);
  }

  // ------------------------------------------------------------------------
  // Voice-over: an <audio> element that follows the playhead (preview only;
  // the MP4 exporter muxes the same file in with ffmpeg)
  // ------------------------------------------------------------------------
  function VoiceTrack({ src, time, playing, muted }) {
    const ref = React.useRef(null);
    const lastFix = React.useRef(0);
    React.useEffect(() => {
      const el = ref.current; if (!el) return;
      if (playing) {
        if (el.paused) { try { el.currentTime = time; } catch (e) {} el.play().catch(() => {}); }
        else if (Math.abs(el.currentTime - time) > 0.25 && performance.now() - lastFix.current > 1000) { lastFix.current = performance.now(); el.currentTime = time; }
      } else {
        if (!el.paused) el.pause();
        if (Math.abs(el.currentTime - time) > 0.05) { try { el.currentTime = time; } catch (e) {} }
      }
    }, [time, playing]);
    return h('audio', { ref, src, preload: 'auto', muted });
  }

  // ------------------------------------------------------------------------
  // Player: clock, measurement, controls, export hooks
  // ------------------------------------------------------------------------
  const Q = new URLSearchParams(location.search);
  const EXPORT = Q.has('export');
  const PRESENT = Q.has('present');

  function Player({ Piece, tl, opts }) {
    const [time, setTime] = React.useState(() => clamp(parseFloat(Q.get('t')) || 0, 0, tl.duration));
    const [playing, setPlaying] = React.useState(false);
    const [started, setStarted] = React.useState(!!Q.get('t'));
    const [L, setL] = React.useState({});
    const [cc, setCC] = React.useState(Q.get('captions') !== '0');
    const [muted, setMuted] = React.useState(false);
    const [fit, setFit] = React.useState(1);
    const [idle, setIdle] = React.useState(false);
    const [, bump] = React.useState(0);
    const lastL = React.useRef('');
    const clock = React.useRef({ t0: 0, p0: 0 });
    const wrap = React.useRef(null);

    const P = React.useMemo(() => { const p = makePlan(); if (opts.plan) opts.plan(p, tl.V, tl.CUES, tl); return finalizePlan(p.P); }, [tl]);

    // measure after every commit; re-render only when the layout changed
    React.useLayoutEffect(() => {
      const m = measureAll(); const s = JSON.stringify(m);
      if (s !== lastL.current) { lastL.current = s; setL(m); }
    });
    React.useEffect(() => {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => bump((x) => x + 1));
      const t = setTimeout(() => bump((x) => x + 1), 1200);
      return () => clearTimeout(t);
    }, []);

    // playback clock
    React.useEffect(() => {
      if (!playing) return;
      clock.current = { t0: performance.now(), p0: time >= tl.duration - 0.05 ? 0 : time };
      let raf;
      const tick = () => {
        const t = clock.current.p0 + (performance.now() - clock.current.t0) / 1000;
        if (t >= tl.duration) { setTime(tl.duration); setPlaying(false); return; }
        setTime(t); raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [playing]);

    // fit the 1920x1080 stage into the window
    React.useEffect(() => {
      if (EXPORT) return;
      const onR = () => {
        const el = wrap.current; if (!el) return;
        const cw = el.clientWidth, chh = el.clientHeight;
        setFit(Math.min(cw / W, chh / H));
      };
      onR();
      const ro = new ResizeObserver(onR); if (wrap.current) ro.observe(wrap.current);
      return () => ro.disconnect();
    }, []);

    const seek = React.useCallback((t) => { const c = clamp(t, 0, tl.duration); clock.current = { t0: performance.now(), p0: c }; setTime(c); }, [tl]);
    const toggle = React.useCallback(() => { setStarted(true); setPlaying((p) => !p); }, []);

    // keyboard
    React.useEffect(() => {
      if (EXPORT) return;
      const onK = (e) => {
        if (e.target && /input|textarea/i.test(e.target.tagName)) return;
        const step = e.shiftKey ? 1 / 30 : 5;
        if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); toggle(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); seek(timeRef.current + step); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(timeRef.current - step); }
        else if (e.key === 'c') setCC((x) => !x);
        else if (e.key === 'm') setMuted((x) => !x);
        else if (e.key === 'f') { const el = document.documentElement; if (!document.fullscreenElement) el.requestFullscreen && el.requestFullscreen(); else document.exitFullscreen(); }
        else if (e.key === 'Home') seek(0);
      };
      window.addEventListener('keydown', onK);
      return () => window.removeEventListener('keydown', onK);
    }, [toggle, seek]);
    const timeRef = React.useRef(time); timeRef.current = time;

    // idle (hide controls while playing in present mode)
    React.useEffect(() => {
      if (EXPORT) return;
      let t; const onM = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 2200); };
      window.addEventListener('mousemove', onM); onM();
      return () => { window.removeEventListener('mousemove', onM); clearTimeout(t); };
    }, []);

    // export hooks
    React.useEffect(() => {
      const api = window.__EV;
      api.seek = (t) => new Promise((res) => {
        ReactDOM.flushSync(() => setTime(clamp(t, 0, tl.duration)));
        requestAnimationFrame(() => requestAnimationFrame(() => res(true)));
      });
      api.missingKeys = () => P.keys.filter((k) => !(k in lastLayout.current));
      api.resolveReady && api.resolveReady();
    }, []);
    const lastLayout = React.useRef({}); lastLayout.current = L;

    const T = time;
    const cams = {};
    for (const id in P.layers) cams[id] = camAt(P, id, T, L);
    const rectOf = (key) => {
      const r = L[key]; if (!r) return null;
      if (r.layer === '@stage') return { x: r.x, y: r.y, w: r.w, h: r.h };
      const c = cams[r.layer]; if (!c) return null;
      let o = { x: c.x + c.s * r.x, y: c.y + c.s * r.y, w: r.w * c.s, h: r.h * c.s };
      const cfg = P.layers[r.layer];
      {
        const b = cfg.mode === 'whole' ? wholeView(cfg) : cfg.box, x0 = Math.max(o.x, b.x), y0 = Math.max(o.y, b.y), x1 = Math.min(o.x + o.w, b.x + b.w), y1 = Math.min(o.y + o.h, b.y + b.h);
        if (x1 <= x0 || y1 <= y0) return null;
        o = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      }
      return o;
    };
    const union = (keys, pad = 8) => {
      const rs = keys.map(rectOf).filter(Boolean); if (!rs.length) return null;
      const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
      const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
      return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
    };
    const sceneAt = (t) => { let s = tl.scenes[0]; for (const x of tl.scenes) if (x.start <= t) s = x; return s; };
    window.__EV.activeMissing = () => activeKeys(P, T).filter((k) => !rectOf(k));
    const ctx = {
      T, time, playing, duration: tl.duration, V: tl.V, VE: tl.VE, CUES: tl.CUES, scenes: tl.scenes, items: tl.items,
      P, L, cams, rectOf, union, sceneAt, scene: sceneAt(T), cc, exporting: EXPORT, showCallouts: opts.callouts !== false, W, H,
    };

    const stageBg = typeof opts.bg === 'function' ? opts.bg(T) : opts.bg || '#EDF0F2';
    const stage = h('div', {
      className: 'ev-stage', 'data-ev-layer': '@stage',
      style: { position: 'relative', width: W, height: H, overflow: 'hidden', background: stageBg, fontFamily: 'Montserrat, system-ui, sans-serif', color: INK, transform: EXPORT ? 'none' : `scale(${fit})`, transformOrigin: '0 0' },
    }, h(Piece, null));

    if (EXPORT) return h(Ctx.Provider, { value: ctx }, stage);

    const hideUI = PRESENT && playing && idle;
    const missing = [...MISSING].concat(activeKeys(P, T).filter((k) => !rectOf(k)).map((k) => 'element "' + k + '"'));
    return h(Ctx.Provider, { value: ctx },
      h('div', { style: { position: 'fixed', inset: 0, background: '#0B1013', display: 'flex', flexDirection: 'column', cursor: hideUI ? 'none' : 'default' } },
        h('div', { ref: wrap, style: { flex: 1, position: 'relative', margin: PRESENT ? 0 : '16px 16px 0' } },
          h('div', { onClick: toggle, style: { position: 'absolute', left: '50%', top: '50%', width: W * fit, height: H * fit, transform: 'translate(-50%,-50%)', overflow: 'hidden', borderRadius: PRESENT ? 0 : 10, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } },
            stage,
            !started ? h('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,22,30,0.25)' } },
              h('div', { style: { width: 112, height: 112, borderRadius: 999, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(217,4,41,0.45)' } },
                h('svg', { viewBox: '0 0 24 24', width: 46, height: 46, fill: '#fff' }, h('path', { d: 'M8 5.5v13l11-6.5z' })))) : null)),
        h(Controls, { time, duration: tl.duration, playing, toggle, seek, scenes: tl.scenes, cc, setCC, muted, setMuted, hidden: hideUI, hasAudio: !!opts.audio }),
        missing.length ? h('div', { style: { position: 'fixed', top: 10, right: 10, maxWidth: 420, background: '#7A0019', color: '#fff', font: '12px/1.4 ui-monospace, monospace', padding: '8px 10px', borderRadius: 8, zIndex: 9 } }, 'Missing: ' + missing.slice(0, 8).join(', ') + (missing.length > 8 ? ` +${missing.length - 8}` : '')) : null,
        opts.audio ? h(VoiceTrack, { src: opts.audio, time, playing, muted }) : null));
  }

  function Controls({ time, duration, playing, toggle, seek, scenes, cc, setCC, muted, setMuted, hidden, hasAudio }) {
    const bar = React.useRef(null);
    const [hover, setHover] = React.useState(null);
    const drag = React.useRef(false);
    const tAt = (e) => { const r = bar.current.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * duration; };
    const chapters = []; scenes.forEach((s) => { if (!chapters.length || chapters[chapters.length - 1].chapter !== s.chapter) chapters.push({ chapter: s.chapter, start: s.start }); });
    const hoverCh = hover != null ? chapters.filter((c) => c.start <= hover).pop() : null;
    const btn = (label, onClick, on = true, title) => h('button', { onClick, title, style: { background: 'transparent', border: 0, color: on ? '#fff' : '#6C7A82', font: '600 13px Montserrat, system-ui, sans-serif', cursor: 'pointer', padding: '6px 8px', borderRadius: 6 } }, label);
    return h('div', { style: { height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', color: '#fff', font: '500 14px Montserrat, system-ui, sans-serif', opacity: hidden ? 0 : 1, transition: 'opacity .3s' } },
      h('button', { onClick: toggle, title: 'Play / pause (space)', style: { width: 40, height: 40, borderRadius: 999, border: 0, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none' } },
        h('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: '#fff' }, playing ? h('path', { d: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z' }) : h('path', { d: 'M8 5.5v13l11-6.5z' }))),
      h('span', { style: { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: '#C3CBD0' } }, `${fmt(time)} / ${fmt(duration)}`),
      h('div', {
        ref: bar, style: { flex: 1, minWidth: 140, height: 28, position: 'relative', cursor: 'pointer' },
        onMouseMove: (e) => { setHover(tAt(e)); if (drag.current) seek(tAt(e)); }, onMouseLeave: () => setHover(null),
        onMouseDown: (e) => { drag.current = true; seek(tAt(e)); const up = () => { drag.current = false; window.removeEventListener('mouseup', up); }; window.addEventListener('mouseup', up); },
      },
        h('div', { style: { position: 'absolute', left: 0, right: 0, top: 12, height: 4, borderRadius: 4, background: '#26323A' } }),
        h('div', { style: { position: 'absolute', left: 0, width: `${(time / duration) * 100}%`, top: 12, height: 4, borderRadius: 4, background: RED } }),
        chapters.slice(1).map((c) => h('div', { key: c.start, style: { position: 'absolute', left: `${(c.start / duration) * 100}%`, top: 9, width: 2, height: 10, background: '#0B1013' } })),
        h('div', { style: { position: 'absolute', left: `calc(${(time / duration) * 100}% - 7px)`, top: 7, width: 14, height: 14, borderRadius: 99, background: '#fff' } }),
        hover != null ? h('div', { style: { position: 'absolute', bottom: 30, left: `${(hover / duration) * 100}%`, transform: 'translateX(-50%)', background: '#fff', color: INK, padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap', font: '600 12px Montserrat, system-ui, sans-serif', pointerEvents: 'none' } }, `${fmt(hover)}${hoverCh && hoverCh.chapter ? ' · ' + hoverCh.chapter : ''}`) : null),
      btn('CC', () => setCC((x) => !x), cc, 'Captions (c)'),
      hasAudio ? btn(h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'block' } },
        h('path', { d: 'M11 5 6 9H2v6h4l5 4V5z' }), muted ? h('path', { d: 'm22 9-6 6M16 9l6 6' }) : h('path', { d: 'M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14' })), () => setMuted((x) => !x), !muted, 'Sound (m)') : null,
      btn(h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'block' } },
        h('path', { d: 'M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3' })), () => { const el = document.documentElement; if (!document.fullscreenElement) el.requestFullscreen && el.requestFullscreen(); else document.exitFullscreen(); }, true, 'Full screen (f)'));
  }

  // ------------------------------------------------------------------------
  // render(Piece, opts): reads the JSON blocks and mounts the player
  //   opts: { plan(p, V, CUES, tl), audio, bg, callouts, fps }
  // ------------------------------------------------------------------------
  function render(Piece, opts = {}) {
    const scenes = readJSON('ev-scenes', []);
    const script = readJSON('ev-script', {});
    const vo = readJSON('ev-vo', null);
    const tl = buildTimeline(scenes, script, vo);
    OPTS.current = opts;
    const audio = opts.audio !== undefined ? opts.audio : vo && vo.audio ? vo.audio : null;
    const o = Object.assign({}, opts, { audio });
    let resolveReady;
    const ready = new Promise((r) => { resolveReady = r; }).then(() => (document.fonts ? document.fonts.ready : null)).then(() => new Promise((r) => setTimeout(r, 300)));
    window.__EV = { duration: tl.duration, fps: opts.fps || 30, audio, items: tl.items, scenes: tl.scenes, voiced: tl.voiced, srt: () => toSRT(tl.items), ready, resolveReady, missing: () => [...MISSING], W, H };
    const el = document.getElementById('root');
    if (EXPORT) { document.documentElement.style.background = 'transparent'; document.body.style.margin = '0'; document.body.style.overflow = 'hidden'; }
    ReactDOM.createRoot(el).render(h(Player, { Piece, tl, opts: o }));
  }

  window.EV = {
    render, useVideo, Scene, Layer, Hold, Hotspot, Overlays, Spotlight, Callouts, Cursor, Taps, Captions, ChapterLabel, LowerThird, PestyMarkSVG,
    Easing, M, ramp, clamp, lerp, typed, typedEnd, count, lastAt, stagger, track, reg, words, toSRT, fmt, W, H,
  };
})();
