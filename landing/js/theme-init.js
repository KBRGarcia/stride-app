(function () {
  const STORAGE_KEY = 'stride-landing-theme';
  const stored = localStorage.getItem(STORAGE_KEY);
  let theme = 'light';
  if (stored === 'light' || stored === 'dark') {
    theme = stored;
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
