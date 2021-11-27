export enum BindingScope {
  TRANSIENT = 'Transient',
  SINGLETON = 'Singleton',
  SERVER = 'Server',
  APPLICATION = 'Application'
}

/**
 * Representing a value or promise. This type represent results of
 * synchronous/asynchronous resolution of values.
 *
 * Note that we are using PromiseLike instead of native Promise to describe
 * the asynchronous variant. This allows producers of async values to use
 * any Promise implementation (e.g. Bluebird) instead of native Promises
 * provided by JavaScript runtime.
 */
export type ValueOrPromise<T> = T | PromiseLike<T>;

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
