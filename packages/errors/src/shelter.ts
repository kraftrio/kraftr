import { OkErr, Err, Ok, OkErrPromise } from './result';
import { ErrorMetadata, ValueMetadata } from './types';
import { isPromiseLike } from './utils';

/**
 * @internal
 * @param error instance
 * @returns Err instance
 */
function handleError(error: unknown): Err {
  if (error instanceof Error) {
    return Err(error as Error);
  }
  if (typeof error === 'string') {
    return Err(new Error(error));
  }
  return Err(TypeError, 'Threw error is not a valid Error instance');
}

/**
 * Wrap the error or result returned by the function
 * @public
 * @param unSafeFn Function which could throw an error
 * @returns the result of the function execution wrapped
 */
export function shelter(unSafeFn: () => undefined): OkErr<void, Error>;

export async function shelter<E>(
  unSafePromise: Promise<E>
): OkErrPromise<ValueMetadata<E>, ErrorMetadata<E>>;

export async function shelter<E>(
  unSafeFunction: () => Promise<E>
): OkErrPromise<ValueMetadata<E>, ErrorMetadata<E>>;

export function shelter<E>(unSafeFn: () => E): OkErr<ValueMetadata<E>, ErrorMetadata<E>>;

export function shelter<E>(
  unSafeFn: (() => E | Promise<E>) | Promise<E>
): OkErr<E, Error> | OkErrPromise<E, Error> {
  try {
    const value = isPromiseLike(unSafeFn) ? unSafeFn : unSafeFn();

    if (isPromiseLike(value)) {
      return value.then(Ok, handleError) as OkErrPromise<E, Error>;
    }

    return Ok(value);
  } catch (error) {
    return handleError(error) as Err<Error>;
  }
}
