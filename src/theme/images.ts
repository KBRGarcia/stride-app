import type { ColorScheme, ThemeImages } from './types';

const SPLASH_LOGO = require('../../assets/images/Stride-logo.png');

const darkImages: ThemeImages = {
  logoIcon: require('../../assets/images/Stride-logo-dark.png'),
  logoName: require('../../assets/images/Stride-name-dark.png'),
  splashLogo: SPLASH_LOGO,
};

const lightImages: ThemeImages = {
  logoIcon: require('../../assets/images/Stride-logo-light.png'),
  logoName: require('../../assets/images/Stride-name-light.png'),
  splashLogo: SPLASH_LOGO,
};

export function getThemeImages(colorScheme: ColorScheme): ThemeImages {
  return colorScheme === 'dark' ? darkImages : lightImages;
}
