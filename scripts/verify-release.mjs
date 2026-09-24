#!/usr/bin/env node
/**
 * Verificación previa a despliegue.
 * Uso:
 *   node scripts/verify-release.mjs           # app + landing (APK opcional)
 *   node scripts/verify-release.mjs --require-apk  # falla si no hay APK
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const requireApk = process.argv.includes('--require-apk');
const MIN_APK_BYTES = 500_000;

const requiredLanding = [
  'landing/index.html',
  'landing/productos.html',
  'landing/css/styles.css',
  'landing/js/download.js',
  'landing/js/splash.js',
  'landing/js/theme.js',
  'landing/assets/images/Stride-logo-light.png',
  'landing/assets/images/man-woman-body-gym.png',
  'landing/assets/images/logo-kbr-light.png',
  'landing/assets/images/logo-kbr-dark.png',
];

const requiredAppAssets = [
  'assets/icon.png',
  'assets/android-icon-foreground.png',
  'eas.json',
  'app.json',
];

let failed = false;

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failed = true;
}

console.log('Verificando archivos de la landing…');
for (const rel of requiredLanding) {
  const path = join(root, rel);
  if (existsSync(path)) ok(rel);
  else fail(`Falta: ${rel}`);
}

console.log('\nVerificando assets de build Android (iconos cuadrados)…');
for (const rel of requiredAppAssets) {
  const path = join(root, rel);
  if (existsSync(path)) ok(rel);
  else fail(`Falta: ${rel}`);
}

const apkPath = join(root, 'landing/downloads/stride-lite.apk');
console.log('\nVerificando APK para descarga…');
if (existsSync(apkPath)) {
  const size = statSync(apkPath).size;
  if (size >= MIN_APK_BYTES) {
    ok(`stride-lite.apk (${(size / 1_048_576).toFixed(2)} MiB)`);
  } else {
    fail(`stride-lite.apk existe pero es demasiado pequeño (${size} bytes)`);
  }
} else if (requireApk) {
  fail('No existe landing/downloads/stride-lite.apk — ejecuta: npm run build:apk:landing');
} else {
  console.log('  ⚠ Sin APK (normal en desarrollo). Antes de producción: npm run build:apk:landing');
}

if (failed) {
  process.exit(1);
}

console.log('\nVerificación de archivos completada.');
