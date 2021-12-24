import hyperid from 'hyperid';

const generateUniqueId = hyperid({
  fixedLength: false,
  urlSafe: true
});

export namespace BindingKey {
  /**
   * Create a new key for a binding bound to a value of type `ValueType`.
   *
   * @example
   *
   * ```ts
   * BindingKey.create<string>('application.name');
   * BindingKey.create<number>('config#rest.port');
   * ```
   *
   * @param key - The binding key. When propertyPath is not provided, the key
   *   is allowed to contain propertyPath as encoded via `BindingKey#toString()`
   * @public
   */
  export function create<Value>(key: string): BindingAddress<Value>;

  /**
   * Create a new key for a binding bound to a value of type `ValueType`.
   *
   * @example
   *
   * ```ts
   * BindingKey.create<number>('config', 'rest.port);
   * ```
   *
   * @param key - The binding key. When propertyPath is not provided, the key
   *   is allowed to contain propertyPath as encoded via `BindingKey#toString()`
   * @param propertyPath - Optional path to a deep property of the bound value.
   * @public
   */
  /**
   * Create a new key for a binding bound to a value of type `ValueType`.
   *
   * @example
   *
   * ```ts
   * BindingKey.create<string>('application.name');
   * BindingKey.create<number>('config', 'rest.port);
   * BindingKey.create<number>('config#rest.port');
   * ```
   *
   * @param key - The binding key. When propertyPath is not provided, the key
   *   is allowed to contain propertyPath as encoded via `BindingKey#toString()`
   * @param propertyPath - Optional path to a deep property of the bound value.
   * @public
   */
  export function create<Value>(key: string, propertyPath: string): BindingAddress<Value>;

  export function create<Value>(
    key: string,
    propertyPath?: string
  ): BindingAddress<Value> {
    if (propertyPath) {
      key += '#' + propertyPath;
    }

    return key;
  }

  /**
   * Generate a universally unique binding key.
   *
   * Please note the format of they generated key is not specified, you must
   * not rely on any specific formatting (e.g. UUID style).
   *
   * @param namespace - Namespace for the binding
   * @public
   */
  export function generate<Value>(namespace = ''): BindingAddress<Value> {
    const prefix = namespace ? `${namespace}.` : '';
    const name = generateUniqueId();
    return BindingKey.create(`${prefix}${name}`);
  }
}
declare const type: unique symbol;

export type BindingAddress<T = unknown> =
  | string
  | ({
      [type]: T;
    } & string);

export type AddressValue<T> = T extends BindingAddress<infer V> ? V : never;
