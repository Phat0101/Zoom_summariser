import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // After hydration, load from localStorage
  useEffect(() => {
    setIsHydrated(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Update localStorage when the value changes
  useEffect(() => {
    if (isHydrated) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue, isHydrated]);

  return [storedValue, setStoredValue] as const;
}
