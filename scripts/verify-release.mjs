#!/usr/bin/env node
/**
 * Verificación previa a despliegue.
 * Uso:
 *   node scripts/verify-release.mjs
 *   node scripts/verify-release.mjs --require-apk
 *   node scripts/verify-release.mjs --require-apk --require-release-signing
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const root = join(import.meta.dirname, '..');
const requireApk = process.argv.includes('--require-apk');
const requireReleaseSigning = process.argv.includes('--require-release-signing');
const MIN_APK_BYTES = 500_000;

const requiredLanding = [
  'landing/index.html',
  'landing/productos.html',
  'landing/privacidad.html',
  'landing/css/styles.css',
  'landing/js/theme-init.js',
  'landing/js/download.js',
  'landing/js/splash.js',
  'landing/js/theme.js',
  'landing/assets/images/Stride-logo-light.png',
  'landing/assets/images/man-woman-body-gym.png',
  'landing/assets/images/logo-kbr-light.png',
  'landing/assets/images/logo-kbr-dark.png',
  'landing/downloads/.htaccess',
];

const requiredAppAssets = [
  'assets/icon.png',
  'assets/android-icon-foreground.png',
  'eas.json',
  'app.json',
  'plugins/withAndroidReleaseSigning.js',
  'credentials/keystore.properties.example',
];

let failed = false;

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failed = true;
}

function findApksigner() {
  const home = process.env.ANDROID_HOME || join(process.env.HOME || '', 'Android/Sdk');
  const buildTools = join(home, 'build-tools');
  if (!existsSync(buildTools)) {
    return null;
  }
  const versions = execSync(`ls -1 "${buildTools}"`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)
    .sort();
  const latest = versions.at(-1);
  if (!latest) return null;
  const bin = join(buildTools, latest, 'apksigner');
  return existsSync(bin) ? bin : null;
}

function verifyApkSigning(apkPath) {
  const apksigner = findApksigner();
  if (!apksigner) {
    if (requireReleaseSigning) {
      fail('No se encontró apksigner (ANDROID_HOME). No se puede validar firma release.');
    } else {
      console.log('  ⚠ apksigner no disponible; omitiendo comprobación de firma.');
    }
    return;
  }

  let output = '';
  try {
    output = execSync(`"${apksigner}" verify --print-certs "${apkPath}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = error.stderr?.toString() || error.message;
    fail(`APK no verificable con apksigner: ${stderr.trim()}`);
    return;
  }

  if (output.includes('Android Debug')) {
    if (requireReleaseSigning) {
      fail('APK firmado con certificado Android Debug — usa npm run build:apk:local con keystore release.');
    } else {
      console.log('  ⚠ APK firmado con certificado Debug (solo pruebas internas).');
    }
    return;
  }

  ok('Firma release (no Debug)');
}

console.log('Verificando archivos de la landing…');
for (const rel of requiredLanding) {
  const path = join(root, rel);
  if (existsSync(path)) ok(rel);
  else fail(`Falta: ${rel}`);
}

for (const file of ['landing/index.html', 'landing/productos.html', 'landing/privacidad.html']) {
  const html = readFileSync(join(root, file), 'utf8');
  if (!html.includes('privacidad.html')) {
    fail(`${file} no enlaza a privacidad.html`);
  } else {
    ok(`${file} → enlace privacidad`);
  }
  if (!html.includes('og:title') || !html.includes('og:image')) {
    fail(`${file} sin meta Open Graph básicas`);
  } else {
    ok(`${file} → Open Graph`);
  }
}

const htaccess = readFileSync(join(root, 'landing/downloads/.htaccess'), 'utf8');
if (htaccess.includes('Content-Disposition')) {
  ok('.htaccess Content-Disposition APK');
} else {
  fail('.htaccess sin Content-Disposition para APK');
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
    verifyApkSigning(apkPath);
  } else {
    fail(`stride-lite.apk existe pero es demasiado pequeño (${size} bytes)`);
  }
} else if (requireApk) {
  fail('No existe landing/downloads/stride-lite.apk — ejecuta: npm run build:apk:local');
} else {
  console.log('  ⚠ Sin APK. Antes de producción: npm run build:apk:local o build:apk:production');
}

if (failed) {
  process.exit(1);
}

console.log('\nVerificación de archivos completada.');
