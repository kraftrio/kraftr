export type ErrorCtor = new (message?: string) => Error;

/**
 * Error instance with name a message typed
 * @public
 */
export type TSError<N extends string | ErrorCtor, M extends string> = N extends ErrorCtor
  ? { message: M } & InstanceType<N>
  : { name: N; message: M } & Error;

declare const errors: unique symbol;

export type Throws<T extends Error = Error> = {
  [errors]?: T;
};

export type ValueMetadata<T> = T extends infer V & Throws<Error> ? V : T;
export type ErrorMetadata<T> = T extends Throws<infer E> ? E : Error;
