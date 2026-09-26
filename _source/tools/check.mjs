// Page health check across widths: console/network errors, broken images, horizontal overflow,
// reveal animations completed, and the face check (every Alex photo balanced, never under hero text).
// usage: node _source/tools/check.mjs [page ...]     (default: every built page)
import { readdirSync } from "node:fs";
import { openEdge, sleep } from "./edge.mjs";

const SITE = new URL("../../", import.meta.url);
const pages = process.argv.slice(2).length ? process.argv.slice(2)
  : readdirSync(SITE).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));
const WIDTHS = [[1440, 900], [1024, 768], [768, 1024], [390, 844]];

const FACECHECK = `(async()=>{
  const faces = await (await fetch('/assets/img/alex/faces.json')).json();
  const out = { checked: 0, fails: [], heroOverlap: [] };
  for (const img of document.querySelectorAll('img')) {
    const src = img.currentSrc || img.src; if (!src.includes('/alex/')) continue;
    const f = faces[src.split('/').pop().replace('.webp','')]; if (!f) continue;
    const r = img.getBoundingClientRect(); if (r.width < 20 || r.height < 20 || img.closest('.mega,.mobile-menu') || !img.naturalWidth) continue;
    const [px, py] = getComputedStyle(img).objectPosition.split(' ').map(v => parseFloat(v) / 100);
    const w = img.clientWidth, h = img.clientHeight, s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const rw = img.naturalWidth * s, rh = img.naturalHeight * s;
    const fx = ((w - rw) * px + f.face[0] * rw) / w, fy = ((h - rh) * py + f.face[1] * rh) / h;
    out.checked++;
    if (!(fx >= .38 && fx <= .62 && fy >= .12 && fy <= .48)) out.fails.push({ src: src.split('/').pop(), fx: +fx.toFixed(2), fy: +fy.toFixed(2) });
    if (img.closest('.hero__media')) {
      const vx = r.left + fx * r.width, vy = r.top + fy * r.height;
      for (const el of img.closest('.hero').querySelectorAll('.hero__title, .lead, .btn-row, .hero__meta, .eyebrow')) {
        const b = el.getBoundingClientRect();
        if (vx > b.left - 24 && vx < b.right + 24 && vy > b.top - 24 && vy < b.bottom + 24) out.heroOverlap.push(el.className);
      }
    }
  }
  return out; })()`;

let failed = 0;
// a fresh Edge per page: one tab navigated through many pages gets throttled and reports false "hidden" results
for (const page of pages) {
  const e = await openEdge();
  try { for (const [w, h] of WIDTHS) {
    e.logs.length = 0;
    await e.go(page + ".html", w, h, 4200);
    const top = await e.ev(FACECHECK);
    const H = await e.ev("document.documentElement.scrollHeight");
    for (let y = 0; y < H; y += 260) { await e.ev(`scrollTo(0, ${y})`); await sleep(40); }
    await sleep(1600);
    const r = await e.ev(`(()=>{const imgs=[...document.images];return {
      hScroll: document.documentElement.scrollWidth > innerWidth,
      broken: imgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src.split('/').pop()),
      hidden: [...document.querySelectorAll('[data-reveal],[data-hero]')].filter(e=>+getComputedStyle(e).opacity<0.5).length }})()`);
    const end = await e.ev(FACECHECK);
    const issues = Object.fromEntries(Object.entries({ hScroll: r.hScroll, broken: r.broken, hidden: r.hidden, faceFails: end.fails, heroOverlap: top.heroOverlap, logs: [...new Set(e.logs)] })
      .filter(([, v]) => (Array.isArray(v) ? v.length : v)));
    if (Object.keys(issues).length) failed++;
    console.log(`${Object.keys(issues).length ? "FAIL" : "ok  "} ${page.padEnd(34)} ${String(w).padStart(4)}  faces ${end.checked}`, Object.keys(issues).length ? JSON.stringify(issues) : "");
  } } finally { e.close(); }
}
process.exit(failed ? 1 : 0);
