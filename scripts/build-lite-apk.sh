#!/usr/bin/env bash
# Genera el APK de Stride Lite con EAS Build y lo deja en landing/downloads/stride-lite.apk
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
APK_OUT="landing/downloads/stride-lite.apk"

mkdir -p landing/downloads

if ! command -v eas >/dev/null 2>&1; then
  echo "Instala EAS CLI: npm install -g eas-cli"
  exit 1
fi

if ! eas whoami >/dev/null 2>&1; then
  echo "No hay sesión en Expo. Ejecuta: eas login"
  exit 1
fi

echo "==> Build Android APK (perfil: preview)..."
eas build --platform android --profile preview --wait --non-interactive

echo "==> Buscando último build finalizado..."
BUILD_ID="$(
  eas build:list --platform android --status finished --limit 1 --json --non-interactive \
    | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); const b=Array.isArray(d)?d[0]:d?.builds?.[0]; if(!b?.id){process.exit(1)} process.stdout.write(b.id)"
)"

if [[ -z "${BUILD_ID}" ]]; then
  echo "No se pudo obtener el ID del build. Descarga manual desde https://expo.dev"
  exit 1
fi

echo "==> Descargando build ${BUILD_ID}..."
eas build:download --build-id "${BUILD_ID}" --output "${APK_OUT}" --non-interactive

if [[ ! -s "${APK_OUT}" ]]; then
  echo "Error: no se generó ${APK_OUT}"
  exit 1
fi

APK_SIZE="$(stat -c%s "${APK_OUT}" 2>/dev/null || stat -f%z "${APK_OUT}")"
if [[ "${APK_SIZE}" -lt 500000 ]]; then
  echo "Error: el APK parece inválido (tamaño: ${APK_SIZE} bytes)"
  exit 1
fi

echo "==> Verificando release…"
node "${ROOT}/scripts/verify-release.mjs" --require-apk

echo "==> Listo: ${APK_OUT} ($(numfmt --to=iec "${APK_SIZE}" 2>/dev/null || echo "${APK_SIZE} bytes"))"
echo "    Prueba la landing: npm run landing"
