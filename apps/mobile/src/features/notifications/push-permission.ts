import { Platform } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';

import type { PushPermissionStatus, PushProvider } from '@nextpoint/shared';

import { getPushInstallationId } from './push-installation-id';

export type ClientPushPermissionResult = {
  permissionStatus: PushPermissionStatus;
  provider: PushProvider;
  deviceId: string | null;
  token: string | null;
};

function getExpoProjectId() {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    null
  );
}

async function requestNativePushPermission(): Promise<ClientPushPermissionResult> {
  const Notifications = await import('expo-notifications');
  const deviceId = await getPushInstallationId();

  if (!Device.isDevice) {
    return {
      permissionStatus: 'unavailable',
      provider: 'none',
      deviceId,
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
      deviceId,
      token: null,
    };
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    return {
      permissionStatus: 'unavailable',
      provider: 'none',
      deviceId,
      token: null,
    };
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  return {
    permissionStatus: 'granted',
    provider: 'expo',
    deviceId,
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
    deviceId: null,
    token: null,
  };
}

export async function buildPushRefusalPreference(): Promise<ClientPushPermissionResult> {
  return buildPushPreferenceWithoutToken(
    'denied',
    Platform.OS === 'web' ? null : await getPushInstallationId()
  );
}

function buildPushPreferenceWithoutToken(
  permissionStatus: PushPermissionStatus,
  deviceId: string | null = null
): ClientPushPermissionResult {
  return {
    permissionStatus,
    provider: 'none',
    deviceId,
    token: null,
  };
}
