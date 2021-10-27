export type ErrorCtor = new (message?: string) => Error;

/**
 * Error instance with name a message typed
 * @public
 */
export type TSError<N extends string | ErrorCtor, M extends string> = N extends ErrorCtor
  ? { message: M } & InstanceType<N>
  : { name: N; message: M } & Error;
