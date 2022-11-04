/**
 * Check whether a value is a Promise-like instance.
 * Recognizes both native promises and third-party promise libraries.
 *
 * @param value - The value to check.
 * @internal
 */
export function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  if (!value) return false;
  if (typeof value !== 'object' && typeof value !== 'function') return false;
  return typeof (value as PromiseLike<T>).then === 'function';
}
