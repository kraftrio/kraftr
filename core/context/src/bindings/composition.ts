import { BindingScope } from '../utils';
import { Binding } from './binding';
import { getContext } from '../context/index';
import { ContextNotFound, KeyNotFound } from '../errors';
import { BindingAddress } from './binding-utils';
import type { Return } from '@kraftr/errors';

/**
 * Returns the value bound to the key
 * @param key BindingAddress
 */
export function inject<ValueType>(
  key: BindingAddress<ValueType>
): Return<ValueType, KeyNotFound | ContextNotFound>;
/**
 * Returns the value of a property from the bound
 * @param key BindingAddress
 * @param property key of the bound value of BindingAddress
 */
export function inject<ValueType, ValueKey extends keyof ValueType>(
  key: BindingAddress<ValueType>,
  property: ValueKey | string | number | symbol
): Return<ValueType[ValueKey], KeyNotFound | ContextNotFound>;

export function inject<ValueType, ValueKey extends keyof ValueType>(
  key: BindingAddress<ValueType>,
  property?: ValueKey
): unknown {
  const ctx = getContext();

  const bindValue = ctx.get<ValueType>(key);

  if (!bindValue) {
    throw new KeyNotFound(key);
  }

  const value = bindValue.value() as ValueType;
  if (property) {
    return value[property];
  }

  return value;
}

/**
 * @public
 * Returns a reference to a property in a bound value
 * @param key Binding address
 * @param property from the bound value of the key
 * @returns bind with property as source
 */
export function ref<ValueType, Property extends keyof ValueType>(
  key: BindingAddress<ValueType>,
  property: Property
): Binding<ValueType[Property]> {
  return provide(`${key}.$${property}`)
    .with(() => inject(key, property))
    .in(BindingScope.TRANSIENT)
    .memoize() as Binding<ValueType[Property]>;
}

/**
 * Get or create a bind
 * @throws ContextNotFound
 * @returns Actual context
 */
export function provide<BoundValue>(
  key: BindingAddress<BoundValue>
): Return<Binding<BoundValue>, ContextNotFound> {
  const ctx = getContext();
  let bind = ctx.get<BoundValue>(key);

  if (!bind) {
    bind = new Binding<BoundValue>(key);
    ctx.add(bind as Binding);
  }
  return bind;
}
