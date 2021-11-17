/**
 * @public
 * Error constructor type
 */
export type ErrorCtor = new (message?: string) => Error;
type NoString<T, Fallback> = string extends T ? Fallback : T;

/**
 * Type for error instances
 * @public
 */
export type TSError<
  Name extends string | ErrorCtor = string,
  Msg extends string = string
> = Name extends ErrorCtor
  ? {
      message: NoString<Msg, ''>;
    } & InstanceType<Name>
  : { name: NoString<Name, 'Error'>; message: NoString<Msg, ''> } & Error;

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
