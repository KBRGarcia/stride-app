#!/usr/bin/env bash
# Copia un APK ya generado a la ruta que usa la landing.
# Uso: bash scripts/install-apk-to-landing.sh /ruta/al/archivo.apk
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: bash scripts/install-apk-to-landing.sh <ruta-al.apk>"
  exit 1
fi

SRC="$(realpath "$1")"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${ROOT}/landing/downloads/stride-lite.apk"

if [[ ! -f "${SRC}" ]]; then
  echo "No se encontró: ${SRC}"
  exit 1
fi

mkdir -p "${ROOT}/landing/downloads"
cp "${SRC}" "${DEST}"
echo "APK instalado en: ${DEST}"
node "${ROOT}/scripts/verify-release.mjs" --require-apk
