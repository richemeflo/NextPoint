import { Platform } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import type { PushPermissionStatus, PushProvider } from '@nextpoint/shared';

export type ClientPushPermissionResult = {
  permissionStatus: PushPermissionStatus;
  provider: PushProvider;
  deviceId: string | null;
  token: string | null;
};

function webDeviceId() {
  if (typeof navigator === 'undefined') return 'web';

  return `web:${navigator.userAgent.slice(0, 100)}`;
}

function getExpoProjectId() {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    null
  );
}

function nativeDeviceId() {
  return [
    Platform.OS,
    Device.osBuildId,
    Device.modelId,
    Device.deviceName,
  ]
    .filter(Boolean)
    .join(':')
    .slice(0, 120);
}

async function requestNativePushPermission(): Promise<ClientPushPermissionResult> {
  if (!Device.isDevice) {
    return {
      permissionStatus: 'unavailable',
      provider: 'none',
      deviceId: Platform.OS,
      token: null,
    };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  const finalPermission =
    existingPermission.status === 'granted'
      ? existingPermission
      : await Notifications.requestPermissionsAsync();

  if (finalPermission.status !== 'granted') {
    return {
      permissionStatus: 'denied',
      provider: 'none',
      deviceId: nativeDeviceId(),
      token: null,
    };
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    return {
      permissionStatus: 'unavailable',
      provider: 'none',
      deviceId: nativeDeviceId(),
      token: null,
    };
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  return {
    permissionStatus: 'granted',
    provider: 'expo',
    deviceId: nativeDeviceId(),
    token: token.data,
  };
}

export async function requestClientPushPermission(): Promise<ClientPushPermissionResult> {
  if (Platform.OS !== 'web') {
    return requestNativePushPermission();
  }

  if (typeof globalThis.Notification === 'undefined') {
    return buildPushPreferenceWithoutToken('unavailable');
  }

  const permission =
    globalThis.Notification.permission === 'default'
      ? await globalThis.Notification.requestPermission()
      : globalThis.Notification.permission;

  return {
    permissionStatus: permission === 'granted' ? 'granted' : 'denied',
    provider: 'web',
    deviceId: webDeviceId(),
    token: null,
  };
}

export function buildPushRefusalPreference(): ClientPushPermissionResult {
  return buildPushPreferenceWithoutToken('denied');
}

function buildPushPreferenceWithoutToken(
  permissionStatus: PushPermissionStatus
): ClientPushPermissionResult {
  return {
    permissionStatus,
    provider: 'none',
    deviceId: Platform.OS,
    token: null,
  };
}
