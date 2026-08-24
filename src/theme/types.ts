export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryActive: string;
  primaryText: string;
  success: string;
  successSurface: string;
  successBorder: string;
  danger: string;
  dangerSurface: string;
  dangerBorder: string;
  dangerText: string;
  overlay: string;
  splashBackground: string;
  headerBackground: string;
  footerBackground: string;
  inputBackground: string;
  imagePlaceholder: string;
}

export interface ThemeImages {
  logoIcon: number;
  logoName: number;
  splashLogo: number;
}
