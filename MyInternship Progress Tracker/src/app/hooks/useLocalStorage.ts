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

      // Attempt to serialize. If this throws (e.g. circular reference), bail early
      // since there's nothing useful to write to storage.
      let nextValueRaw: string;
      try {
        nextValueRaw = serialize(nextValue);
      } catch {
        return;
      }

      // Best-effort backup: write the previous value to the backup key before
      // overwriting the primary key. Any failure here must NOT block the primary
      // write below, so it gets its own isolated try-catch.
      if (backupKey) {
        try {
          const previousValueRaw = window.localStorage.getItem(key);
          if (previousValueRaw !== null && previousValueRaw !== nextValueRaw) {
            try {
              deserialize(previousValueRaw);
              window.localStorage.setItem(backupKey, previousValueRaw);
            } catch {
              // backup write failed — that's OK, continue to primary write
            }
          }
        } catch {
          // reading the previous value failed — skip backup, continue to primary write
        }
      }

      // Primary write: this is the critical operation. A failure here means the
      // value won't survive a page reload, but the in-memory state is already
      // updated above so the UI remains consistent for the current session.
      try {
        window.localStorage.setItem(key, nextValueRaw);
      } catch {
        // primary write failed (e.g. QuotaExceededError, SecurityError)
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