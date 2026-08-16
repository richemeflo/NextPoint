import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PUSH_INSTALLATION_ID_STORAGE_KEY =
  '@nextpoint/notifications/push-installation-id';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let installationIdRequest: Promise<string> | null = null;

async function loadOrCreatePushInstallationId() {
  const storedInstallationId = await AsyncStorage.getItem(
    PUSH_INSTALLATION_ID_STORAGE_KEY
  );

  if (storedInstallationId && UUID_PATTERN.test(storedInstallationId)) {
    return storedInstallationId;
  }

  const installationId = Crypto.randomUUID();
  await AsyncStorage.setItem(
    PUSH_INSTALLATION_ID_STORAGE_KEY,
    installationId
  );

  return installationId;
}

export function getPushInstallationId() {
  if (!installationIdRequest) {
    installationIdRequest = loadOrCreatePushInstallationId().catch((error) => {
      installationIdRequest = null;
      throw error;
    });
  }

  return installationIdRequest;
}
