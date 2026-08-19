import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const svg = readFileSync('scripts/icon.svg', 'utf8');
mkdirSync('public/icons', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

async function render(size, file, padPct = 0) {
  // padPct: margen extra para maskable (zona segura)
  const inner = Math.round(size * (1 - padPct * 2));
  const html = `<html><body style="margin:0;background:transparent;display:grid;place-items:center;width:${size}px;height:${size}px">
    ${padPct > 0 ? `<div style="width:${size}px;height:${size}px;background:#120f1a;display:grid;place-items:center;border-radius:0">` : ''}
    <div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div>
    ${padPct > 0 ? '</div>' : ''}
  </body></html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: padPct === 0 });
  writeFileSync(file, buf);
  console.log('✓', file);
}

await render(512, 'public/icons/icon-512x512.png');
await render(192, 'public/icons/icon-192x192.png');
await render(512, 'public/icons/icon-maskable-512.png', 0.12);
await render(180, 'public/icons/apple-touch-icon.png', 0.02);
await browser.close();
