#!/usr/bin/env bash
# Build APK local (Gradle) y copia a landing/downloads/stride-lite.apk
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
APK_OUT="landing/downloads/stride-lite.apk"
GRADLE_APK="android/app/build/outputs/apk/release/app-release.apk"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "==> Generando iconos desde Stride-logo-background.png…"
node scripts/generate-app-icons.mjs

echo "==> Sincronizando proyecto Android (icono de la app)…"
CI=1 npx expo prebuild --platform android --no-install

echo "==> Compilando APK release…"
cd android
./gradlew assembleRelease --no-daemon
cd "$ROOT"

mkdir -p landing/downloads
cp "${GRADLE_APK}" "${APK_OUT}"

node "${ROOT}/scripts/verify-release.mjs" --require-apk
echo "==> APK listo: ${APK_OUT}"
