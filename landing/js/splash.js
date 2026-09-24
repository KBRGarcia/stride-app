const SPLASH_VISIBLE_MS = 1300;
const SPLASH_FADE_MS = 450;

function dismissSplash(splash) {
  if (!splash || splash.classList.contains('page-splash--hide')) return;

  splash.classList.add('page-splash--hide');

  const remove = () => {
    splash.remove();
  };

  splash.addEventListener('transitionend', remove, { once: true });
  window.setTimeout(remove, SPLASH_FADE_MS + 80);
}

function initSplash() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.getElementById('page-splash')?.remove();
    return;
  }

  const splash = document.getElementById('page-splash');
  if (!splash) return;

  window.setTimeout(() => dismissSplash(splash), SPLASH_VISIBLE_MS);
  window.setTimeout(() => dismissSplash(splash), SPLASH_VISIBLE_MS + SPLASH_FADE_MS + 200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplash);
} else {
  initSplash();
}
