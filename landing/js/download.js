const LITE_APK_PATH = 'downloads/stride-lite.apk';

async function liteApkAvailable() {
  try {
    const response = await fetch(LITE_APK_PATH, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function initDownloadButtons() {
  const liteBtn = document.getElementById('download-lite');
  const liteBtnProducts = document.getElementById('download-lite-productos');
  const available = await liteApkAvailable();

  [liteBtn, liteBtnProducts].forEach((btn) => {
    if (!btn) return;
    if (available) {
      btn.href = LITE_APK_PATH;
      btn.removeAttribute('aria-disabled');
      btn.textContent = 'Descargar';
    } else {
      btn.href = '#';
      btn.setAttribute('aria-disabled', 'true');
      btn.title = 'El APK se publicará aquí muy pronto';
      btn.textContent = 'Descargar (pronto)';
    }
  });
}

initDownloadButtons();
