import { ErrorCtor, TSError } from './types';

const unhadleErrors = new Set<Err<Error>>();

export function guard(unSafeFn: () => undefined): OkErr<null, Error>;
export async function guard<E>(app: () => Promise<E>): Promise<E>;
export function guard<E>(app: () => E): E;

export function guard<E>(app: (() => Promise<E>) | (() => E)): Promise<E> | E {
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
export type Err<E extends Error> = Result<null, E>;

/**
 * Sugar type for Promise<Ok<Value> | Err<Error>>
 */
export type OkErrPromise<O, E extends Error> = Promise<Ok<O> | Err<E>>;
export type OkErr<O, E extends Error> = Ok<O> | Err<E>;

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
   * Use this to know if value can be used safely
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
  release(): void {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      throw this.error;
    }
  }

  /**
   * @public
   * Could throw an exception for safe use check first with isOk
   */
  value(): E extends Error ? void : Value {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      throw this.error;
    }
    return this._value as E extends Error ? void : Value;
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
 * @param message Additional message to show
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
 * @param message Additional message to show
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
  errorOrNameOrErr: Error | string | ErrorCtor | Err<Error>,
  message?: string
): Err<Error> {
  let error: Error;
  if (typeof errorOrNameOrErr === 'string') {
    error = new Error(message);
    error.name = errorOrNameOrErr;
  } else if ('isErr' in errorOrNameOrErr) {
    return errorOrNameOrErr;
  } else if (errorOrNameOrErr instanceof Error) {
    error = errorOrNameOrErr;
  } else {
    error = new errorOrNameOrErr(message);
  }

  return new Result(null, error) as Result<null, Error>;
}
