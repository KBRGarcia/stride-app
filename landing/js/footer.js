const KBR_LOGO_PATH = 'assets/images/kbr-logo.png';

async function initDeveloperLogo() {
  const img = document.getElementById('kbr-logo');
  const placeholder = document.getElementById('kbr-placeholder');
  if (!img || !placeholder) return;

  try {
    const response = await fetch(KBR_LOGO_PATH, { method: 'HEAD' });
    if (!response.ok) return;

    img.src = KBR_LOGO_PATH;
    img.classList.add('is-visible');
    placeholder.classList.add('is-hidden');
    placeholder.setAttribute('aria-hidden', 'true');
  } catch {
    /* placeholder visible until logo is added */
  }
}

initDeveloperLogo();
