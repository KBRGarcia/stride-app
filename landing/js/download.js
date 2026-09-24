const LITE_APK_PATH = 'downloads/stride-lite.apk';
const LITE_APK_FILENAME = 'stride-lite.apk';

async function liteApkAvailable() {
  try {
    const head = await fetch(LITE_APK_PATH, { method: 'HEAD' });
    if (head.ok) return true;
  } catch {
    /* serve u otros hosts pueden no soportar HEAD */
  }
  try {
    const get = await fetch(LITE_APK_PATH, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    return get.ok || get.status === 206;
  } catch {
    return false;
  }
}

function configureDownloadButton(btn, available) {
  if (!btn) return;
  if (available) {
    btn.href = LITE_APK_PATH;
    btn.setAttribute('download', LITE_APK_FILENAME);
    btn.classList.remove('btn--unavailable');
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('title');
    btn.textContent = 'Descargar';
  } else {
    btn.href = LITE_APK_PATH;
    btn.removeAttribute('download');
    btn.classList.add('btn--unavailable');
    btn.setAttribute('aria-disabled', 'true');
    btn.title = 'Genera el APK: npm run build:apk:local o npm run build:apk:landing';
    btn.textContent = 'Descargar (pronto)';
  }
}

async function initDownloadButtons() {
  const liteBtn = document.getElementById('download-lite');
  const liteBtnProducts = document.getElementById('download-lite-productos');
  const available = await liteApkAvailable();

  [liteBtn, liteBtnProducts].forEach((btn) => {
    configureDownloadButton(btn, available);
    if (!btn) return;
    btn.addEventListener('click', (event) => {
      if (btn.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
      }
    });
  });
}

initDownloadButtons();
