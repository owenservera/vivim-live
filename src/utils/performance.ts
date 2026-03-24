export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300
): T {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;

  return ((...args: any[]) => {
    lastArgs = args;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 100
): T {
  let inThrottle = false;
  let lastResult: any;

  return ((...args: any[]) => {
    if (inThrottle) {
      return lastResult;
    }

    inThrottle = true;
    const result = fn(...args);
    lastResult = result;

    setTimeout(() => {
      inThrottle = false;
    }, limit);

    return result;
  }) as T;
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: any[]) => string
): T {
  const cache = new Map<string, any>();

  return ((...args: any[]) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
