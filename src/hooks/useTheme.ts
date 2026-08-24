import { useThemeStore } from '../stores/useThemeStore';
import { getThemeColors } from '../theme/colors';
import { getThemeImages } from '../theme/images';

export function useTheme() {
  const colorScheme = useThemeStore((state) => state.colorScheme);

  return {
    colorScheme,
    colors: getThemeColors(colorScheme),
    images: getThemeImages(colorScheme),
    isDark: colorScheme === 'dark',
    statusBarStyle: colorScheme === 'dark' ? ('light' as const) : ('dark' as const),
  };
}
