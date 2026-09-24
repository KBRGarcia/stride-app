#!/usr/bin/env bash
# Crea keystore de release en credentials/ (no se sube a git).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRED_DIR="${ROOT}/credentials"
KEYSTORE="${CRED_DIR}/stride-release.keystore"
PROPS="${CRED_DIR}/keystore.properties"

STORE_PASS="${STRIDE_KEYSTORE_PASSWORD:-}"
KEY_PASS="${STRIDE_KEY_PASSWORD:-}"

mkdir -p "${CRED_DIR}"

if [[ -z "${STORE_PASS}" || -z "${KEY_PASS}" ]]; then
  if [[ -f "${PROPS}" ]]; then
    echo "==> Usando credentials/keystore.properties existente."
    exit 0
  fi
  echo "Define contraseñas seguras antes del primer build de producción:"
  echo "  export STRIDE_KEYSTORE_PASSWORD='...'"
  echo "  export STRIDE_KEY_PASSWORD='...'"
  echo "Luego vuelve a ejecutar este script o npm run build:apk:local"
  exit 1
fi

if [[ ! -f "${KEYSTORE}" ]]; then
  echo "==> Generando keystore de release en credentials/stride-release.keystore"
  keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore "${KEYSTORE}" \
    -alias stride-release \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "${STORE_PASS}" \
    -keypass "${KEY_PASS}" \
    -dname "CN=Stride Lite, OU=Mobile, O=KBRGarcia, L=Latam, ST=NA, C=ES"
fi

cat > "${PROPS}" <<EOF
storeFile=stride-release.keystore
storePassword=${STORE_PASS}
keyAlias=stride-release
keyPassword=${KEY_PASS}
EOF

echo "==> credentials/keystore.properties actualizado (no commitear)."
