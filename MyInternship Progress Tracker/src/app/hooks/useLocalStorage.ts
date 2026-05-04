import { useCallback, useEffect, useRef, useState } from 'react';

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

  const initialValueRef = useRef(initialValue);

  const readValue = useCallback(() => {
    const fallbackValue = resolveInitialValue(initialValueRef.current);

    if (typeof window === 'undefined') {
      return fallbackValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : fallbackValue;
    } catch {
      return fallbackValue;
    }
  }, [deserialize, key]);

  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  // NOTE: No effect to re-read storage here. The useState initializer above
  // already reads from localStorage on first mount. Adding an effect that
  // calls setStoredValue(readValue()) would create a new array reference
  // (JSON.parse always returns a new object) and trigger a spurious re-render
  // on every mount, which cascades into dependent hooks and components.

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        return;
      }

      // Compute the next value first. If this throws (e.g. a bad updater function),
      // it's a programmer error and should propagate.
      const nextValue = value instanceof Function ? value(readValue()) : value;

      // Always update React state immediately so the UI reflects the change,
      // regardless of whether the localStorage write succeeds.
      setStoredValue(nextValue);

      // Attempt to persist to localStorage as a best-effort operation.
      // If the write fails (e.g. QuotaExceededError), the value is still
      // available in memory for the current session.
      try {
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
      } catch {
        // localStorage write failed; the value is updated in memory for this session
        // but will not persist across page reloads.
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
    setStoredValue(resolveInitialValue(initialValueRef.current));
  }, [backupKey, key]);

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