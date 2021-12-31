// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface TypedMap<Shape extends Record<string, any>>
  extends Map<string, unknown> {
  delete(key: keyof Shape): boolean;
  has(key: keyof Shape): boolean;
  forEach(
    callbackfn: (
      value: Shape[keyof Shape],
      key: Exclude<keyof Shape, number | symbol>,
      map: TypedMap<Shape>
    ) => void,
    thisArg?: unknown
  ): void;
  get<Key extends keyof Shape>(key: Key): Shape[Key];
  set<Key extends keyof Shape>(key: Key, value: Shape[Key]): this;
}

export type AnyObject = Record<string, unknown>;
export type isAnyObject<T, True, False = T> = AnyObject extends T ? True : False;
export type isBoolean<T, True, False = T> = T extends boolean ? True : False;
export type isAny<T, True, False = T> = unknown extends T ? True : False;
export type isString<T, True, False = T> = string extends T ? True : False;

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

export type NoInfer<A extends any> = [A][A extends any ? 0 : never];
