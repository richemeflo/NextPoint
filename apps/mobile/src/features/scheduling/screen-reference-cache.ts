export type ReferenceLoadResult<T> = { ok: true; data: T } | { ok: false };

export type ScreenReferenceCache<T> = {
  get: (
    key: string,
    load: () => Promise<ReferenceLoadResult<T>>
  ) => Promise<ReferenceLoadResult<T>>;
};

export function createScreenReferenceCache<T>(): ScreenReferenceCache<T> {
  const values = new Map<string, T>();
  const requests = new Map<string, Promise<ReferenceLoadResult<T>>>();

  return {
    get(key, load) {
      if (values.has(key)) {
        return Promise.resolve({ ok: true, data: values.get(key) as T });
      }

      const pendingRequest = requests.get(key);
      if (pendingRequest) return pendingRequest;

      const request = load()
        .then((result) => {
          if (result.ok) values.set(key, result.data);
          return result;
        })
        .finally(() => {
          if (requests.get(key) === request) requests.delete(key);
        });
      requests.set(key, request);
      return request;
    },
  };
}
