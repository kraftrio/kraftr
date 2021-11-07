/* eslint-disable unicorn/prevent-abbreviations */
import { ErrorCtor, TSError, Return } from './types';

const unhadleErrors = new Set<Err<Error>>();

export function guard(unSafeFunction: () => undefined): Return<undefined, Error>;
export async function guard<E>(app: () => Promise<E>): Promise<Return<E, Error>>;
export function guard<E>(app: () => E): Return<E, Error>;

export function guard<E>(
  app: (() => Promise<E>) | (() => E)
): Return<Promise<E> | E, Error> {
  const value = app();
  const errors = [...unhadleErrors];
  unhadleErrors.clear();
  if (errors.length > 0) {
    for (const error of errors) {
      throw error.error;
    }
  }
  return value;
}

/**
 * @public
 * Value without error wrapped
 */
export type Ok<V> = Result<V, null>;
/**
 * @public
 * Value with the error wrapped
 */
export type Err<E extends Error = Error, V = unknown> = Result<null, E> & {
  valueOr: (a: V) => V;
};

/**
 * Sugar type for Promise<Ok<Value> | Err<Error>>
 */
export type OkErrPromise<O, E extends Error> = Promise<Ok<O> | Err<E, O>>;
export type OkErr<O, E extends Error> = Ok<O> | Err<E, O>;

/**
 * @public
 * Helper type to allow wrapped and unwrapped values
 */
export type MayResult<T> = OkErr<T, Error> | T;

/**
 * @class
 * @public
 */
export class Result<Value, E extends Error | null> {
  private _valid = true;

  constructor(private _value: Value, private _error: E) {
    if (_error !== null) {
      this._valid = false;
      unhadleErrors.add(this as never);
    }
    Object.freeze(this)!;
  }

  /**
   * @public
   * Check result don't contain errors
   */
  get isOk(): E extends Error ? false : true {
    unhadleErrors.delete(this as never);
    return this._valid as E extends Error ? false : true;
  }

  /**
   * @public
   * Use this to know if an error was throw
   */
  get isErr(): E extends Error ? true : false {
    unhadleErrors.delete(this as never);
    return !this._valid as E extends Error ? true : false;
  }

  /**
   * @public
   * Wrapped error
   */
  get error(): E {
    unhadleErrors.delete(this as never);
    return this._error;
  }

  /**
   * @public
   * Rethrow caught error
   */
  release(): Return<void, E extends Error ? E : never> {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      throw this.error;
    }
  }

  valueOr(onError: Value): Value {
    if (this.isErr) {
      unhadleErrors.delete(this as never);
      return onError;
    }
    return this.value() as Value;
  }

  /**
   * @public
   * Could throw an exception for safe use check first with isOk
   */
  value(): E extends Error ? Return<never, E> : Value {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      // eslint-disable-next-line @kraftr/returns-throw
      throw this.error;
    }
    return this._value as E extends Error ? Return<never, E> : Value;
  }
}

export function Ok<V extends Ok<unknown>>(value: V): V;
export function Ok<V>(value: V): Ok<V>;

/**
 * Function used to mark a value as valid without errors
 *
 * @public
 * @param value The object to wrap into a Result
 * @returns Ok result without errors
 */
export function Ok<V>(value: V | Ok<V>): Ok<V> {
  if (typeof value === 'object' && 'isOk' in value) {
    return value;
  }
  return new Result(value, null);
}

/**
 * Return the same result if is Err
 *
 * @public
 * @param reslt Err
 * @returns Err
 */
export function Err<N extends Err<Error>>(result: N): N;

/**
 * Create a default error with a name and message
 *
 * @public
 * @param name Error name
 * @param message to show
 * @returns An Err result with the error wrapped
 */
export function Err<N extends string, M extends string>(
  name: N,
  message?: M
): Err<TSError<N, M>>;
/**
 * Create a default error with a name and message
 *
 * @public
 * @param name Error name
 * @param message show
 * @returns An Err result with the error wrapped
 */
export function Err<E extends ErrorCtor, M extends string>(
  error: E,
  message?: M
): Err<TSError<E, M>>;

/**
 * Wrap an error to allow typechecking
 * @public
 * @param error Instance error to wrap
 * @returns An Err result with the error wrapped
 */
export function Err<E extends Error>(error: E): Err<E>;

export function Err(
  errorOrNameOrError: Error | string | ErrorCtor | Err<Error>,
  message?: string
): Err<Error> {
  let error: Error;
  if (typeof errorOrNameOrError === 'string') {
    error = new Error(message);
    error.name = errorOrNameOrError;
  } else if ('isErr' in errorOrNameOrError) {
    return errorOrNameOrError;
  } else if (errorOrNameOrError instanceof Error) {
    error = errorOrNameOrError;
  } else {
    error = new errorOrNameOrError(message);
  }

  return new Result(null, error) as Err;
}
