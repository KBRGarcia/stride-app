import type { ColorScheme, ThemeColors } from './types';

const darkColors: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  border: '#334155',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  primaryActive: '#1d4ed8',
  primaryText: '#ffffff',
  success: '#22c55e',
  successSurface: '#14532d33',
  successBorder: '#166534',
  danger: '#7f1d1d',
  dangerSurface: '#450a0a',
  dangerBorder: '#7f1d1d',
  dangerText: '#fca5a5',
  overlay: 'rgba(2, 6, 23, 0.72)',
  splashBackground: '#020617',
  headerBackground: '#0f172a',
  footerBackground: '#0f172a',
  inputBackground: '#1e293b',
  imagePlaceholder: '#1e293b',
};

const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSecondary: '#e2e8f0',
  border: '#cbd5e1',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  primary: '#2563eb',
  primaryActive: '#1d4ed8',
  primaryText: '#ffffff',
  success: '#16a34a',
  successSurface: '#dcfce7',
  successBorder: '#86efac',
  danger: '#b91c1c',
  dangerSurface: '#fef2f2',
  dangerBorder: '#fecaca',
  dangerText: '#b91c1c',
  overlay: 'rgba(15, 23, 42, 0.45)',
  splashBackground: '#ffffff',
  headerBackground: '#ffffff',
  footerBackground: '#ffffff',
  inputBackground: '#ffffff',
  imagePlaceholder: '#e2e8f0',
};

export function getThemeColors(colorScheme: ColorScheme): ThemeColors {
  return colorScheme === 'dark' ? darkColors : lightColors;
}
