#!/usr/bin/env bash
# Prueba en Android real si hay dispositivo USB (adb). No falla si no hay dispositivo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK="${ROOT}/landing/downloads/stride-lite.apk"
ADB="${ANDROID_HOME:-$HOME/Android/Sdk}/platform-tools/adb"

if [[ ! -x "${ADB}" ]]; then
  echo "⚠ adb no encontrado; omite QA en dispositivo."
  exit 0
fi

if ! "${ADB}" get-state >/dev/null 2>&1; then
  echo "⚠ Ningún dispositivo Android conectado. Checklist manual: docs/QA-ANDROID.md"
  exit 0
fi

if [[ ! -f "${APK}" ]]; then
  echo "✗ Falta ${APK}"
  exit 1
fi

echo "==> Instalando APK en dispositivo…"
"${ADB}" install -r "${APK}"

echo "==> Abriendo com.stride.lite…"
"${ADB}" shell monkey -p com.stride.lite -c android.intent.category.LAUNCHER 1 >/dev/null

echo "✓ APK instalado y lanzado. Completa el flujo manual en docs/QA-ANDROID.md"
