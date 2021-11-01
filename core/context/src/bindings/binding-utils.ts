export namespace BindingKey {
  export function create<V>(key: string): BindingAddress<V> {
    return key;
  }
}
declare const type: unique symbol;

export type BindingAddress<T = unknown> = string & {
  [type]?: T;
};

export type AddressValue<T> = T extends BindingAddress<infer V> ? V : never;
