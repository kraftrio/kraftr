export type ErrorCtor = new (message?: string) => Error;

/**
 * Error instance with name a message typed
 * @public
 */
export type TSError<N extends string | ErrorCtor, M extends string> = N extends ErrorCtor
  ? { message: M } & InstanceType<N>
  : { name: N; message: M } & Error;

declare const errors: unique symbol;

type MetaError<ErrorType extends Error> = {
  [errors]: ErrorType;
};

export type Throws<ErrorType extends Error, ReturnType> = [ReturnType] extends [null]
  ? [null] extends [ReturnType]
    ? MetaError<ErrorType>
    : [ReturnType] extends [never]
    ? MetaError<ErrorType> & void
    : never
  : [ReturnType] extends [undefined]
  ? MetaError<ErrorType>
  : MetaError<ErrorType> & ReturnType;

export type Return<ReturnTypes, ErrorTypes extends Error> =
  | ReturnTypes
  | Throws<ErrorTypes, ReturnTypes>;

export type ValueMetadata<T> = Exclude<T, MetaError<any>>;

export type ErrorMetadata<T> = T extends MetaError<infer E> ? E : never;
