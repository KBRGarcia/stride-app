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

import { shouldConfigureAndroidChannels } from './notificationsSupport';

const REST_CHANNEL_ID = 'rest-timer';

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

async function ensureAndroidRestChannel(): Promise<string | undefined> {
  if (!shouldConfigureAndroidChannels()) {
    return undefined;
  }

  try {
    await setNotificationChannelAsync(REST_CHANNEL_ID, {
      name: 'Descanso',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    return REST_CHANNEL_ID;
  } catch (error) {
    console.warn('[notifications] No se pudo crear el canal Android:', error);
    return undefined;
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  configureNotificationHandler();

  if (Platform.OS === 'android') {
    await ensureAndroidRestChannel();
  }

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
    const channelId = await ensureAndroidRestChannel();

    return await scheduleNotificationAsync({
      content: {
        title: 'Descanso terminado',
        body: `Prepárate: ${nextExerciseName}`,
        sound: true,
        ...(channelId && { channelId }),
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
