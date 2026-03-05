import { useCallback } from "react";

export function useSessionStorage<T>(key: string) {
  const set = useCallback(
    (value: T) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // QuotaExceededError / SecurityError — silent fail
      }
    },
    [key],
  );

  const get = useCallback((): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // SecurityError — silent fail
      }
      return null;
    }
  }, [key]);

  const remove = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // SecurityError — silent fail
    }
  }, [key]);

  return { get, set, remove };
}
