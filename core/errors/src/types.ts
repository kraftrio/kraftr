/**
 * @public
 * Error constructor type
 */
export type ErrorCtor = new (message?: string) => Error;

/**
 * Error instance with name a message typed
 * @public
 */
export type TSError<N extends string | ErrorCtor, M extends string> = N extends ErrorCtor
  ? { message: M } & InstanceType<N>
  : { name: N; message: M } & Error;

declare const errors: unique symbol;

/**
 * @internal
 * Metadata type
 */
type MetaError<ErrorType extends Error> = {
  [errors]: ErrorType;
};

export type Cast<A1, A2> = [A1 extends A2 ? A1 : never] extends [never]
  ? A2
  : A1 extends A2
  ? A1
  : never;

type Any = {
  [k: string]: never;
  [k: number]: never;
  [k: symbol]: never;
};

/**
 *
 */
export type Throws<ErrorTypes extends Error> = MetaError<ErrorTypes> & Any;

/**
 * @public
 * Typed function return with error
 */
export type Return<ReturnTypes, ErrorTypes extends Error> =
  | ReturnTypes
  | Throws<ErrorTypes>;

/**
 * @public
 * Typed promises with errors
 */
export type ReturnAsync<ReturnTypes, ErrorTypes extends Error> = Promise<
  Return<ReturnTypes, ErrorTypes>
>;

/**
 * @public
 * Get the Ok part from a Return
 */
export type ValueMetadata<T> = Exclude<T, MetaError<Error>>;

/**
 * @public
 * Get the Error part from a Return
 */
export type ErrorMetadata<T> = Cast<T, MetaError<Error>> extends MetaError<infer E>
  ? E
  : never;
