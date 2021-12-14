import { ErrorCtor, TSError, Return, Throws } from './types';

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
export type Err<E extends Error = Error> = Result<void, E>;

/**
 * @public
 * Sugar type for Promise<Ok<Value> | Err<Error>>
 */
export type OkErrPromise<O, E extends Error> = Promise<Ok<O> | Err<E>>;

/**
 * @public
 * Union type for Ok and Err
 */
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
  private readonly _valid;

  constructor(private readonly _value: Value, private readonly _error: E) {
    if (_error !== null) {
      this._valid = false;
      unhadleErrors.add(this as never);
    } else {
      this._valid = true;
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
  release(): E extends Error ? never : void {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      // eslint-disable-next-line @kraftr/returns-throw
      throw this.error;
    }
    return undefined as never;
  }
  /**
   * @public
   * @param onError return this as fallback on any error
   * @returns Value | Fallback
   */
  valueOr<T>(onError: T): T | Value {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      unhadleErrors.delete(this as never);
      return onError;
    }
    return this._value;
  }

  /**
   * @public
   * Could throw an exception for safe use check first with isOk
   */
  value(): E extends Error ? void | Throws<E> : Value {
    unhadleErrors.delete(this as never);
    if (this.isErr) {
      // eslint-disable-next-line @kraftr/returns-throw
      throw this.error;
    }
    return this._value as E extends Error ? void | Throws<E> : Value;
  }
}

/**
 * Return the same result if is Ok
 *
 * @public
 * @param reslt Ok
 * @returns Ok
 */
export function Ok<OkInstance extends Ok<unknown>>(value: OkInstance): OkInstance;

/**
 * Function used to mark a value as valid without errors
 *
 * @public
 * @param value The object to wrap into a Result
 * @returns Ok result without errors
 */
export function Ok<Value>(value: Value): Ok<Value>;

/**
 * Function used to mark a value as valid without errors
 *
 * @public
 * @param value The object to wrap into a Result
 * @returns Ok result without errors
 */
export function Ok<Value>(value: Value | Ok<Value>): Ok<Value> {
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
export function Err<ErrInstance extends Err<Error>>(result: ErrInstance): ErrInstance;

/**
 * This function create a Result instance as Err wrapping an Error with the message
 *
 * @public
 * @param message to show
 * @returns An Err result with the error wrapped
 */
export function Err<Msg extends string>(message: Msg): Err<TSError<'Error', Msg>>;

/**
 * Create a default error with a name and message
 *
 * @public
 * @param name Error name
 * @param message to show
 * @returns An Err result with the error wrapped
 */
export function Err<Name extends string, Msg extends string>(
  name: Name,
  message: Msg
): Err<TSError<Name, Msg>>;

/**
 * Create a default error with a name and message
 *
 * @public
 * @param name Error name
 * @param message show
 * @returns An Err result with the error wrapped
 */
export function Err<ErrorClass extends ErrorCtor, Msg extends string>(
  error: ErrorClass,
  message?: Msg
): Err<TSError<ErrorClass, Msg>>;

/**
 * Wrap an error to allow typechecking
 * @public
 * @param error Instance error to wrap
 * @returns An Err result with the error wrapped
 */
export function Err<ErrorInstance extends Error>(
  error: ErrorInstance
): Err<ErrorInstance>;

/**
 * Wrap an error to allow typechecking
 * @public
 * @param error Instance error to wrap
 * @returns An Err result with the error wrapped
 */
export function Err(
  errorOrNameOrClass: Error | string | ErrorCtor | Err<Error>,
  message?: string
): Err<Error> {
  let error: Error;
  if (typeof errorOrNameOrClass === 'string') {
    error = new Error(message ?? errorOrNameOrClass);
    error.name = message ? errorOrNameOrClass : 'Error';
  } else if ('isErr' in errorOrNameOrClass) {
    return errorOrNameOrClass;
  } else if (errorOrNameOrClass instanceof Error) {
    error = errorOrNameOrClass;
  } else {
    error = new errorOrNameOrClass(message);
  }

  return new Result(undefined, error) as Err;
}
