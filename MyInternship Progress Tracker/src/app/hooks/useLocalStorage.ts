import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = T | ((currentValue: T) => T);

type UseLocalStorageOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  backupKey?: string;
};

function resolveInitialValue<T>(initialValue: T | (() => T)): T {
  return initialValue instanceof Function ? initialValue() : initialValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
) {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? ((value: string) => JSON.parse(value) as T);
  const backupKey = options.backupKey;

  const readValue = useCallback(() => {
    const fallbackValue = resolveInitialValue(initialValue);

    if (typeof window === 'undefined') {
      return fallbackValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : fallbackValue;
    } catch {
      return fallbackValue;
    }
  }, [deserialize, initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const nextValue = value instanceof Function ? value(readValue()) : value;
        const nextValueRaw = serialize(nextValue);
        const previousValueRaw = window.localStorage.getItem(key);
        let shouldBackupPreviousValue = false;

        if (backupKey && previousValueRaw !== null && previousValueRaw !== nextValueRaw) {
          try {
            deserialize(previousValueRaw);
            shouldBackupPreviousValue = true;
          } catch {
            shouldBackupPreviousValue = false;
          }
        }

        if (backupKey && shouldBackupPreviousValue && previousValueRaw !== null) {
          window.localStorage.setItem(backupKey, previousValueRaw);
        }

        window.localStorage.setItem(key, nextValueRaw);
        setStoredValue(nextValue);
      } catch {
        setStoredValue(readValue());
      }
    },
    [backupKey, deserialize, key, readValue, serialize],
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
    if (backupKey) {
      window.localStorage.removeItem(backupKey);
    }
    setStoredValue(resolveInitialValue(initialValue));
  }, [backupKey, initialValue, key]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, readValue]);

  return [storedValue, setValue, removeValue] as const;
}