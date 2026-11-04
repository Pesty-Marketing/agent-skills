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
"""

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


def run_all(pg, tl, times, min_px, fps, max_still=3.0):
    page = pg.page
    problems = [f"timing: {e}" for e in page.evaluate("motion.errors")]
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
