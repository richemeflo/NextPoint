const storageVersion = 1;
const chunkSize = 1_800;
const maximumChunks = 64;

export type AsyncStringStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export type SecureStringStorage = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

type StorageMetadata = {
  version: typeof storageVersion;
  chunks: number;
};

function normalizeKey(key: string) {
  return [...key]
    .map((character) =>
      /[A-Za-z0-9.-]/.test(character)
        ? character
        : `_${character.codePointAt(0)?.toString(16)}_`
    )
    .join('');
}

function getMetadataKey(key: string) {
  return `nextpoint.secure.${normalizeKey(key)}.metadata`;
}

function getChunkKey(key: string, index: number) {
  return `nextpoint.secure.${normalizeKey(key)}.chunk.${index}`;
}

function parseMetadata(value: string | null): StorageMetadata | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StorageMetadata>;
    if (
      parsed.version !== storageVersion ||
      !Number.isInteger(parsed.chunks) ||
      !parsed.chunks ||
      parsed.chunks < 1 ||
      parsed.chunks > maximumChunks
    ) {
      return null;
    }

    return parsed as StorageMetadata;
  } catch {
    return null;
  }
}

async function readSecureValue(
  storage: SecureStringStorage,
  key: string
) {
  const metadata = parseMetadata(await storage.getItemAsync(getMetadataKey(key)));
  if (!metadata) return null;

  const chunks = await Promise.all(
    Array.from({ length: metadata.chunks }, (_, index) =>
      storage.getItemAsync(getChunkKey(key, index))
    )
  );

  return chunks.some((chunk) => chunk === null) ? null : chunks.join('');
}

async function writeSecureValue(
  storage: SecureStringStorage,
  key: string,
  value: string
) {
  const previousMetadata = parseMetadata(
    await storage.getItemAsync(getMetadataKey(key))
  );
  const chunks = value.match(new RegExp(`.{1,${chunkSize}}`, 'gs')) ?? [''];

  if (chunks.length > maximumChunks) {
    throw new Error('Secure storage value is too large');
  }

  await Promise.all(
    chunks.map((chunk, index) =>
      storage.setItemAsync(getChunkKey(key, index), chunk)
    )
  );
  await storage.setItemAsync(
    getMetadataKey(key),
    JSON.stringify({ version: storageVersion, chunks: chunks.length })
  );

  if (previousMetadata && previousMetadata.chunks > chunks.length) {
    await Promise.all(
      Array.from(
        { length: previousMetadata.chunks - chunks.length },
        (_, offset) =>
          storage.deleteItemAsync(getChunkKey(key, chunks.length + offset))
      )
    );
  }
}

async function deleteSecureValue(
  storage: SecureStringStorage,
  key: string
) {
  const metadata = parseMetadata(await storage.getItemAsync(getMetadataKey(key)));
  if (metadata) {
    await Promise.all(
      Array.from({ length: metadata.chunks }, (_, index) =>
        storage.deleteItemAsync(getChunkKey(key, index))
      )
    );
  }
  await storage.deleteItemAsync(getMetadataKey(key));
}

export function createSecureStorageAdapter({
  legacyStorage,
  secureStorage,
}: {
  legacyStorage: AsyncStringStorage;
  secureStorage: SecureStringStorage;
}): AsyncStringStorage {
  return {
    async getItem(key) {
      const secureValue = await readSecureValue(secureStorage, key);
      if (secureValue !== null) return secureValue;

      const legacyValue = await legacyStorage.getItem(key);
      if (legacyValue === null) return null;

      await writeSecureValue(secureStorage, key, legacyValue);
      await legacyStorage.removeItem(key);
      return legacyValue;
    },
    async setItem(key, value) {
      await writeSecureValue(secureStorage, key, value);
      await legacyStorage.removeItem(key);
    },
    async removeItem(key) {
      await Promise.all([
        deleteSecureValue(secureStorage, key),
        legacyStorage.removeItem(key),
      ]);
    },
  };
}
