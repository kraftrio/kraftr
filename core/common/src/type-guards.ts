export function hasProperty<T>(obj: unknown, key: keyof T): obj is T {
  return (obj as T)[key] !== undefined;
}

export function isAsyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return (
    !!obj &&
    typeof obj === 'object' &&
    (obj as AsyncIterable<unknown>)[Symbol.asyncIterator] !== undefined
  );
}

export function isSyncIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return (
    !!obj &&
    typeof obj === 'object' &&
    (obj as Iterable<unknown>)[Symbol.iterator] !== undefined
  );
}

export function isIterable<T>(obj: unknown): obj is AsyncIterable<T> {
  return isAsyncIterable(obj) || isSyncIterable(obj);
}

/**
 * Check whether a value is a Promise-like instance.
 * Recognizes both native promises and third-party promise libraries.
 *
 * @param value - The value to check.
 */
export function isPromiseLike<T>(value: T | Promise<T> | undefined): value is Promise<T> {
  if (!value) return false;
  if (typeof value !== 'object' && typeof value !== 'function') return false;
  return typeof (value as Promise<T>).then === 'function';
}

export function isFunction(value: unknown): value is () => unknown {
  return typeof value === 'function';
}
