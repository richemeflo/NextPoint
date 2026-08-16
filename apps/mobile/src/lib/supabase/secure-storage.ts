import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { createSecureStorageAdapter } from './secure-storage-core';

export const secureStorage = createSecureStorageAdapter({
  legacyStorage: AsyncStorage,
  secureStorage: {
    getItemAsync(key) {
      return SecureStore.getItemAsync(key, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    },
    setItemAsync(key, value) {
      return SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    },
    deleteItemAsync(key) {
      return SecureStore.deleteItemAsync(key, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    },
  },
});
