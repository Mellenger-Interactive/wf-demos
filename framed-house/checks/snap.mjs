// Standard screenshots of the framed-house page, plus a JSON summary.
//   node checks/snap.mjs [baseUrl] [outDir] [--select <productId>]
// Defaults: http://localhost:5173/ and checks/snaps/ (gitignored). Exits 1 on a page error, a
// failed request or horizontal overflow at 390 px.
// Shots (1440×900): 01-100, 02-floors (20%), 03-walls (73%), 04-roof (85%), 05-explode,
// 06-select-<id>; 07-mobile (390×844, full page).
import { mkdirSync } from 'node:fs';

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  ({ chromium } = await import('playwright'));
}
const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const pos = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const base = pos[0] ?? 'http://localhost:5173/';
const out = pos[1] ?? 'checks/snaps';
const pick = flag('--select', 'owt');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const errors = [],
  failed = [];
async function open(viewport) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('requestfailed', (r) => failed.push(r.url()));
  await page.goto(base);
  await page.waitForFunction(() => window.houseExplorer?.parts > 0, null, { timeout: 120000 });
  return page;
}
// Settle by rendered frames, not wall time (damping and explode are frame-based).
const frames = (page, n = 40) =>
  page.evaluate(
    (n) =>
      new Promise((r) => {
        let i = 0;
        const f = () => (++i >= n ? r() : requestAnimationFrame(f));
        requestAnimationFrame(f);
      }),
    n,
  );
const scrub = (page, v) =>
  page.evaluate((v) => {
    const el = document.querySelector('#progress');
    el.value = v;
    el.dispatchEvent(new Event('input'));
  }, v);

const page = await open({ width: 1440, height: 900 });
await frames(page);
await page.screenshot({ path: `${out}/01-100.png` });
for (const [name, v] of [
  ['02-floors', 20],
  ['03-walls', 73],
  ['04-roof', 85],
]) {
  await scrub(page, v);
  await frames(page, 10);
  await page.screenshot({ path: `${out}/${name}.png` });
}
await scrub(page, 100);
await page.click('#explode');
await frames(page, 60);
await page.screenshot({ path: `${out}/05-explode.png` });
await page.click('#explode');
await frames(page, 60);
await page.click(`[data-id="${pick}"]`);
await frames(page, 10);
await page.screenshot({ path: `${out}/06-select-${pick}.png` });
const fps = await page.evaluate(
  () =>
    new Promise((r) => {
      let n = 0;
      const t0 = performance.now();
      const f = () => (performance.now() - t0 > 2000 ? r(n / 2) : (n++, requestAnimationFrame(f)));
      requestAnimationFrame(f);
    }),
);
const parts = await page.evaluate(() => window.houseExplorer.parts);
await page.close();

const mobile = await open({ width: 390, height: 844 });
await frames(mobile);
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
);
await mobile.screenshot({ path: `${out}/07-mobile.png`, fullPage: true });
await browser.close();

const summary = { parts, fps, overflow, errors, failedRequests: failed };
console.log(JSON.stringify(summary, null, 2));
process.exit(errors.length || failed.length || overflow ? 1 : 0);
