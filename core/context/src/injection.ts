import { Binding } from './binding';
import { getContext } from './context';
import { KeyNotFound } from './errors';

export type InjetableValue = string;

export namespace BindingKey {
  export function create<V>(key: string): BindingAddress<V> {
    return key;
  }
}

export type BindingAddress<T = unknown> = string & {
  __Type__?: T;
};

export function inject<ValueType>(key: BindingAddress<ValueType>): ValueType {
  const ctx = getContext();

  const bindValue = ctx.get<ValueType>(key);

  if (!bindValue) {
    throw new KeyNotFound(key);
  }

  return bindValue.value();
}

/**
 * Get or create a bind can throw a ContextNotFound if is used outside of the app
 * @throws ContextNotFound
 * @returns Actual context
 */
export function provide<BoundValue>(
  key: BindingAddress<BoundValue>
): Binding<BoundValue> {
  const ctx = getContext();
  let bind = ctx.value()!.get(key);

  if (!bind) {
    bind = new Binding(key);
  }
  ctx.value()!.add(bind as Binding);
  return bind;
}
