import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

/**
 * En Expo Go + Android, importar el barrel `expo-notifications` ejecuta
 * DevicePushTokenAutoRegistration y lanza error (push remoto no soportado).
 * Las notificaciones locales sí funcionan usando imports directos de submódulos.
 */
export function isExpoGoAndroid(): boolean {
  return isRunningInExpoGo() && Platform.OS === 'android';
}

/** El gestor de canales Android solo está disponible en development/production builds. */
export function shouldConfigureAndroidChannels(): boolean {
  return Platform.OS === 'android' && !isRunningInExpoGo();
}

export function canScheduleLocalNotifications(): boolean {
  return true;
}
