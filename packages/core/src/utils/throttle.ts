export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      // Simple delay without setTimeout
      Promise.resolve().then(() => {
        const start = Date.now();
        while (Date.now() - start < limit) {
          // busy wait
        }
        inThrottle = false;
      });
    }
  }) as T;
}