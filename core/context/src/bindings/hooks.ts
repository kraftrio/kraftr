import { BindingScope } from '../utils';
import { AddressValue, Binding } from '.';
import { getContext } from '../context';
import { KeyNotFound } from '../errors';
import { BindingAddress } from '.';

/**
 * Returns the value bound to the key
 * @param key BindingAddress
 */
export function inject<ValueType>(key: BindingAddress<ValueType>): ValueType;
/**
 * Returns the value of a property from the bound
 * @param key BindingAddress
 * @param property key of the bound value of BindingAddress
 */
export function inject<ValueType, ValueKey extends keyof ValueType>(
  key: BindingAddress<ValueType>,
  property: ValueKey | string | number | symbol
): ValueType[ValueKey];

export function inject<ValueType>(
  key: BindingAddress<ValueType>,
  property?: keyof ValueType
): unknown {
  const ctx = getContext();

  const bindValue = ctx.get<ValueType>(key);

  if (!bindValue) {
    throw new KeyNotFound(key);
  }

  if (property) {
    return bindValue.value()[property];
  }

  return bindValue.value();
}

/**
 * Returns a reference to a property in a bound value
 * @param key Binding address
 * @param property Property from the bound value of the key
 * @returns bind with property as source
 */
export function ref<Key extends BindingAddress, Property extends keyof AddressValue<Key>>(
  key: Key,
  property: Property
): Binding<AddressValue<Key>[Property]> {
  return provide(`${key}.$${property}`)
    .in(BindingScope.TRANSIENT)
    .with(() => inject(key, property))
    .memoize() as Binding<AddressValue<Key>[Property]>;
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
  let bind = ctx.get<BoundValue>(key);

  if (!bind) {
    bind = new Binding<BoundValue>(key);
  }
  ctx.add(bind as Binding);
  return bind;
}
