const STORAGE_KEY = 'stride-landing-theme';

function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);

  const isDark = theme === 'dark';
  document.querySelectorAll('[data-logo-icon]').forEach((img) => {
    img.src = isDark
      ? 'assets/images/Stride-logo-dark.png'
      : 'assets/images/Stride-logo-light.png';
  });
  document.querySelectorAll('[data-logo-name]').forEach((img) => {
    img.src = isDark
      ? 'assets/images/Stride-name-dark.png'
      : 'assets/images/Stride-name-light.png';
  });

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
    );
  }
}

function initTheme() {
  applyTheme(getPreferredTheme());

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

initTheme();
