import type { ImageSourcePropType } from 'react-native';

/**
 * Imagen por defecto mientras no existan PNG específicos por ejercicio.
 * Para añadir una imagen real, agrega la clave sin extensión:
 * `'jumping_jacks': require('../../assets/images/jumping_jacks.png')`
 */
export const Images: Record<string, ImageSourcePropType> = {
  default: require('../../assets/images/man-woman-body-gym.png'),
};

export function getExerciseImage(imagePlaceholder: string): ImageSourcePropType {
  const key = imagePlaceholder.replace(/\.png$/i, '');

  if (Images[key]) {
    return Images[key];
  }

  return Images.default;
}
