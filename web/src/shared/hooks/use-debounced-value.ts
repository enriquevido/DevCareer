import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayInMilliseconds: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayInMilliseconds);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayInMilliseconds, value]);

  return debouncedValue;
}
