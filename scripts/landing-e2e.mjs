#!/usr/bin/env node
/**
 * E2E básico de la landing (Playwright + serve).
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = Number(process.env.LANDING_E2E_PORT || 3099);
const BASE = `http://127.0.0.1:${PORT}`;
const ASSET_V = process.env.LANDING_ASSET_VERSION || '20250926';

async function waitForHttp(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await delay(250);
  }
  throw new Error(`No responde ${url}`);
}

function startServe() {
  return spawn(
    'npx',
    ['--yes', 'serve', 'landing', '-l', String(PORT), '--no-clipboard'],
    { stdio: 'inherit', shell: false },
  );
}

async function runChecks(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${BASE}/index.html?v=${ASSET_V}`, { waitUntil: 'networkidle', timeout: 20_000 });
  await page.waitForTimeout(1200);

  if (!(await page.locator('.hero h1').isVisible())) {
    throw new Error('Hero h1 no visible en index');
  }
  if ((await page.locator('#download-lite').textContent())?.trim() !== 'Descargar') {
    throw new Error('Botón descarga no habilitado en index');
  }

  await page.goto(`${BASE}/productos.html?v=${ASSET_V}`, { waitUntil: 'networkidle' });
  if (!(await page.locator('#download-lite-productos').isVisible())) {
    throw new Error('Botón descarga productos no visible');
  }

  await page.goto(`${BASE}/privacidad.html?v=${ASSET_V}`, { waitUntil: 'networkidle' });
  if (!(await page.locator('h1').first().isVisible())) {
    throw new Error('privacidad.html sin h1');
  }

  await page.goto(`${BASE}/index.html?v=${ASSET_V}`);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  const footerVisible = await page.locator('#pie').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  });
  if (!footerVisible) {
    throw new Error('Footer no visible tras scroll en móvil');
  }

  if (errors.length) {
    throw new Error(`Errores JS: ${errors.join('; ')}`);
  }
}

async function main() {
  const { chromium } = await import('playwright-core');
  const serve = startServe();
  let exitCode = 0;

  try {
    await waitForHttp(`${BASE}/index.html`);
    const browser = await chromium.launch({
      channel: process.env.PLAYWRIGHT_CHROME_CHANNEL || 'chrome',
      headless: true,
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await runChecks(page);
    await browser.close();
    console.log('landing-e2e: OK');
  } catch (error) {
    console.error('landing-e2e: FALLO —', error.message);
    exitCode = 1;
  } finally {
    serve.kill('SIGTERM');
    process.exit(exitCode);
  }
}

main();
