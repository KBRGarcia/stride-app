jest.mock('expo', () => ({
  isRunningInExpoGo: jest.fn(() => false),
}));

jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn(),
}));

jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
}));

jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  setNotificationChannelAsync: jest.fn(async () => ({})),
}));

jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
}));

jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
}));
