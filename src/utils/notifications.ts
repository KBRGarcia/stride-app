import { Platform } from 'react-native';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';

let isHandlerConfigured = false;

function configureNotificationHandler(): void {
  if (isHandlerConfigured) {
    return;
  }

  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  isHandlerConfigured = true;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  configureNotificationHandler();

  const { status: existingStatus } = await getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRestEndNotification(
  targetTime: number,
  nextExerciseName: string
): Promise<string | null> {
  configureNotificationHandler();

  try {
    if (Platform.OS === 'android') {
      await setNotificationChannelAsync('rest-timer', {
        name: 'Descanso',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    return await scheduleNotificationAsync({
      content: {
        title: 'Descanso terminado',
        body: `Prepárate: ${nextExerciseName}`,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'rest-timer' }),
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(targetTime),
      },
    });
  } catch (error) {
    console.warn('[notifications] No se pudo programar la notificación local:', error);
    return null;
  }
}

export async function cancelRestNotification(notificationId: string | null): Promise<void> {
  if (!notificationId) {
    return;
  }

  try {
    await cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('[notifications] No se pudo cancelar la notificación:', error);
  }
}

/** Solo para tests: reinicia el flag del handler. */
export function __resetNotificationHandlerForTests(): void {
  isHandlerConfigured = false;
}
