"""Quality gates for a motion-video render. render.py calls run_all(); each check returns
plain-English problems ("FAIL ...") an agent can act on. A video is not done until this list is empty.

  timing   every data-in time resolves (cue words are actually said) and lands inside its scene
  fonts    the theme's fonts loaded (no silent fallback to Arial)
  size     no visible text under the preset's minimum px (sampled every 0.5 s); mark deliberate
           exceptions (e.g. a checkmark glyph) with data-small-ok
  fit      at each scene's built moment, no visible text runs outside the frame or its own box
  qr       every <img data-qr="URL"> decodes to that URL when it is on screen
  seam     loops only: the last frame matches the first, so the loop has no visible jump
  pace     nothing sits still too long: inside each scene, something new starts at least every
           max_still seconds (story/walkthrough 3.0 s, loop 6 s; storyboard "max_still" overrides)
  read     every piece of on-screen text stays up long enough to read at read_wps words a second
           (default 3, about 180 words a minute; storyboard "read_wps" overrides). Simulates one
           viewer reading each text block in the order it appears; burned-in captions and
           [data-read-ok] are skipped. pace and read work together: pace wants a new beat every few
           seconds, read wants the words to stay up. Add beats; don't cut text early.
"""

READ_STEP = 0.1  # seconds between samples for the read gate

# For each block of text (nearest non-inline ancestor of a text node), how many of its words are
# visible now. A word is visible when every ancestor's opacity multiplies to >= 0.5 and it is on screen,
# so word-by-word reveals ("speak"/"words") count up as the words land.
READ_JS = """() => {
  const W = innerWidth, H = innerHeight, out = {};
  window.__readN = window.__readN || 0;
  // opacity = product of ancestors' opacity (animated); -1 = display:none / hidden (layout, never shown)
  const op = new Map();
  const opacity = (el) => {
    if (!el || el === document.documentElement) return 1;
    if (op.has(el)) return op.get(el);
    const cs = getComputedStyle(el), up = opacity(el.parentElement);
    const v = (up < 0 || cs.display === 'none' || cs.visibility === 'hidden') ? -1 : parseFloat(cs.opacity) * up;
    op.set(el, v); return v;
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode, words = n.textContent.trim().split(/\\s+/).filter((x) => /[\\p{L}\\p{N}]/u.test(x)).length;  // glyphs (✓ → •) aren't words
    if (!words) continue;
    const el = n.parentElement;
    if (el.closest('.captions, [data-read-ok], script, style') || opacity(el) < 0) continue;
    let blk = el;
    while (blk.parentElement && blk !== document.body && getComputedStyle(blk).display.startsWith('inline')) blk = blk.parentElement;
    if (!blk.dataset.readId) blk.dataset.readId = ++window.__readN;
    const k = blk.dataset.readId;
    const o = out[k] || (out[k] = { label: '', total: 0, vis: 0 });
    if (o.label.length < 50) o.label = (o.label + ' ' + n.textContent.trim().replace(/\\s+/g, ' ')).trim().slice(0, 50);
    o.total += words;
    if (opacity(el) >= 0.5) {
      const r = document.createRange(); r.selectNodeContents(n);
      const b = r.getBoundingClientRect();
      if (b.width && b.right > 0 && b.bottom > 0 && b.left < W && b.top < H) o.vis += words;
    }
  }
  return out;
}"""


def read_problems(pg, tl, wps=3.0):
    """One viewer reads each text block once, in the order blocks appear, at `wps` words a second.
    A block fails when it disappears before that viewer could have finished it."""
    total = tl["total"]
    blocks = {}  # id -> {label, words, appear, full, gone}
    n = int(total / READ_STEP)
    for i in range(n + 1):
        t = min(i * READ_STEP, total - 0.001)
        pg.seek(t)
        for k, b in pg.page.evaluate(READ_JS).items():
            s = blocks.setdefault(k, {"label": b["label"], "words": b["total"], "appear": None, "full": None, "gone": None})
            if s["gone"] is not None:
                continue  # first showing only
            s["words"] = max(s["words"], b["total"])
            if b["vis"] and s["appear"] is None:
                s["appear"] = t
            if s["appear"] is not None and s["full"] is None and b["vis"] >= b["total"]:
                s["full"] = t
            if s["full"] is not None and b["vis"] < b["total"]:
                s["gone"] = t
            elif s["appear"] is not None and s["full"] is None and not b["vis"]:
                s["gone"] = t  # vanished before every word was even shown
    scene_of = lambda t: next((s["id"] for s in tl["scenes"] if s["start"] <= t < s["start"] + s["dur"]), tl["scenes"][-1]["id"])
    out, reader = [], 0.0
    for s in sorted((b for b in blocks.values() if b["appear"] is not None), key=lambda b: b["appear"]):
        gone = s["gone"] if s["gone"] is not None else total
        if tl["loop"] and s["gone"] is None:
            continue  # on screen to the end of a loop: a viewer can catch it on the next pass
        start = max(reader, s["appear"])
        finish = max(start + s["words"] / wps, s["full"] if s["full"] is not None else gone + 1)
        if finish > gone + READ_STEP:
            need = finish - gone
            out.append(f"read: \"{s['label']}\" ({s['words']} words, scene {scene_of(s['appear'])}) is up "
                       f"{s['appear']:.1f}-{gone:.1f}s but needs {need:.1f}s more to read at {wps:g} words/s: "
                       f"hold it longer (raise the scene's \"dur\"), cut words, or stagger less text at once")
        reader = min(finish, gone)
    return out

TEXT_JS = """([min, mode]) => {
  const out = [];
  const W = innerWidth, H = innerHeight;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (w.nextNode()) {
    const n = w.currentNode, t = n.textContent.trim();
    if (!t) continue;
    const el = n.parentElement;
    if (seen.has(el)) continue; seen.add(el);
    let vis = true;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (parseFloat(cs.opacity) < 0.05 || cs.display === 'none' || cs.visibility === 'hidden') { vis = false; break; }
    }
    if (!vis) continue;
    const label = t.slice(0, 40);
    if (mode === 'size') {
      if (el.closest('[data-small-ok]')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < min) out.push(`${fs}px text "${label}"`);
    } else {
      const r = document.createRange(); r.selectNodeContents(n);
      const b = r.getBoundingClientRect();
      if (b.width && (b.left < -2 || b.top < -2 || b.right > W + 2 || b.bottom > H + 2))
        out.push(`text runs off the frame: "${label}"`);
      // Text wider than its own block (nowrap / long word), or a nowrap line pushing past its container.
      const own = el.getBoundingClientRect(), par = el.parentElement.getBoundingClientRect();
      if (!el.closest('.shot') && (b.right > own.right + 4 || b.right > par.right + 4))
        out.push(`text overflows its box: "${label}"`);
    }
  }
  return out;
}"""

QR_JS = """() => [...document.querySelectorAll('img[data-qr]')].map((img, i) => {
  let vis = true;
  for (let e = img; e; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) < 0.99) { vis = false; break; }
  const b = img.getBoundingClientRect();
  return { i, want: img.dataset.qr, vis: vis && b.width > 40 && b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight,
           box: { x: b.left, y: b.top, width: b.width, height: b.height } };
})"""


def run_all(pg, tl, times, min_px, fps, max_still=3.0, read_wps=3.0):
    page = pg.page
    problems = [f"timing: {e}" for e in page.evaluate("motion.errors")]
    problems += read_problems(pg, tl, read_wps)
    for d in page.evaluate("motion.deadAir()"):
        if d["gap"] > max_still:
            problems.append(f"pace: scene \"{d['id']}\" holds still for {d['gap']:.1f}s from {d['at']:.1f}s "
                            f"(max {max_still:g}s): add a beat (a word-timed reveal, pulse, camera move) or split the scene")
    missing = page.evaluate("motion.fontsOk()")
    if missing:
        problems.append(f"fonts: did not load {', '.join(missing)} (offline? wrong theme name?)")

    small = {}
    t = 0.0
    while t < tl["total"]:
        pg.seek(t)
        for s in page.evaluate(TEXT_JS, [min_px, "size"]):
            small.setdefault(s, t)
        t += 0.5
    problems += [f"size: {s} (first at {t0:.1f}s, minimum {min_px:g}px)" for s, t0 in small.items()]

    qr_ok, qr_seen = set(), {}
    fit = {}
    for sid, t in times:
        pg.seek(t)
        for s in page.evaluate(TEXT_JS, [0, "fit"]):
            fit.setdefault(s, sid)
        for q in page.evaluate(QR_JS):
            qr_seen.setdefault(q["i"], q["want"])
            if q["vis"] and q["i"] not in qr_ok:
                got = decode_qr(page.screenshot(clip=q["box"]))
                if got == q["want"]:
                    qr_ok.add(q["i"])
                else:
                    problems.append(f"qr: image #{q['i']} decodes to {got!r}, expected {q['want']!r} (scene {sid})")
                    qr_ok.add(q["i"])  # report once
    problems += [f"fit: {s} (scene {sid})" for s, sid in fit.items()]
    for i, want in qr_seen.items():
        if i not in qr_ok:
            problems.append(f"qr: image #{i} ({want}) is never fully on screen at a scene's built moment")

    if tl["loop"]:
        d = frame_diff(pg, 0.0, tl["total"] - 1.0 / fps)
        if d > 4.0:
            problems.append(f"seam: last frame differs from first (mean diff {d:.1f}, needs <= 4); end on the same state you start on")
    return problems


def decode_qr(png_bytes):
    import cv2
    import numpy as np
    im = cv2.imdecode(np.frombuffer(png_bytes, np.uint8), cv2.IMREAD_COLOR)
    im = cv2.copyMakeBorder(im, 40, 40, 40, 40, cv2.BORDER_CONSTANT, value=(255, 255, 255))
    val, _, _ = cv2.QRCodeDetector().detectAndDecode(im)
    return val or None


def frame_diff(pg, a, b):
    import cv2
    import numpy as np
    shots = []
    for t in (a, b):
        pg.seek(t)
        shots.append(cv2.imdecode(np.frombuffer(pg.page.screenshot(), np.uint8), cv2.IMREAD_GRAYSCALE).astype(float))
    return float(abs(shots[0] - shots[1]).mean())
