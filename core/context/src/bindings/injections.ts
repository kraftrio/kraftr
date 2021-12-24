import type { Return } from '@kraftr/errors';
import { LockError } from '..';
import { getContext } from '../context';
import { ContextNotFound, KeyNotFound } from '../errors';
import { Binding, BindingScope } from './binding';
import type { BindingAddress } from './key-creation';

export type InjectOptions = { optional?: boolean };

/**
 *
 * `inject` a value from a specific bind key
 *
 * @example
 *
 * ```
 * import { provide, inject } from '@kraftr/context'
 *
 * function install() {
 *    provide('key').with('value')
 *
 *    const injected = inject('key')
 *
 *    assert.equal(injected, 'value')
 * }
 * ```
 *
 *
 * @param {BindingAddress} key bind key to get the associated value
 * @returns bound value
 * @public
 *
 */
export function inject<ValueType>(
  key: BindingAddress<ValueType>
): Return<ValueType, KeyNotFound | ContextNotFound>;

/**
 *
 * `inject` an inner value from a specific bind key
 *
 * @example
 *
 * ```
 * import { provide, inject } from '@kraftr/context'
 *
 * function install() {
 *    const name = inject('key', { optional: true })
 *
 *    assert.equal(name, undefined)
 * }
 * ```
 *
 *
 * @param {BindingAddress} key bind key to get the associated value
 * @param {InjectOptions} options inject options to allow optional injection
 * @returns bound value
 * @public
 *
 */
export function inject<ValueType, Options extends InjectOptions>(
  key: BindingAddress<ValueType>,
  options: Options
): Return<
  Options extends { optional: true } ? ValueType | undefined : ValueType,
  KeyNotFound | ContextNotFound
>;

export function inject(key: BindingAddress, options?: InjectOptions) {
  const ctx = getContext();

  const bindValue = ctx.get(key);

  if (!bindValue && !options?.optional) {
    throw new KeyNotFound(key);
  }

  return bindValue?.value();
}

export namespace inject {
  /**
   *
   * `inject` an inner value from a specific bind key
   *
   * @example
   *
   * ```
   * import { provide, inject } from '@kraftr/context'
   *
   * function install() {
   *    const obj = { name: 'internalValue' }
   *    provide('key').with(obj)
   *
   *    const name = inject.deep('key', 'name')
   *
   *    assert.equal(name, 'internalValue')
   * }
   * ```
   *
   *
   * @param {BindingAddress} key bind key to get the associated value
   * @param {string} property nested value of the bound value
   * @returns bound value
   * @public
   *
   */
  export function deep<ValueType, ValueKey extends keyof ValueType>(
    key: BindingAddress<ValueType>,
    property: ValueKey
  ): Return<ValueType[ValueKey], KeyNotFound | ContextNotFound>;

  /**
   *
   * `inject` an inner value from a specific bind key
   *
   * @example
   *
   * ```
   * import { provide, inject } from '@kraftr/context'
   *
   * function install() {
   *    const obj = { name: 'internalValue' }
   *    provide('key').with(obj)
   *
   *    const name = inject.deep('key', 'name')
   *
   *    assert.equal(name, 'internalValue')
   * }
   * ```
   *
   *
   * @param {BindingAddress} key bind key to get the associated value
   * @param {string} property nested value of the bound value
   * @returns bound value
   * @public
   *
   */
  export function deep<ValueType, ValueKey extends keyof ValueType>(
    key: BindingAddress<ValueType>,
    property: string
  ): Return<unknown, KeyNotFound | ContextNotFound>;

  export function deep<ValueType, ValueKey extends keyof ValueType>(
    key: BindingAddress<ValueType>,
    property: ValueKey
  ): Return<ValueType[ValueKey], KeyNotFound | ContextNotFound> {
    const value = inject(key);
    return value[property as never];
  }

  /**
   *
   * `inject` a value from a specific bind key
   *
   * @example
   *
   * ```
   * import { provide, inject } from '@kraftr/context'
   *
   * function install() {
   *    const bind = provide('key').with('value')
   *
   *    const injected = inject.binding('key')
   *
   *    assert.equal(injected, bind)
   * }
   * ```
   *
   *
   * @param {BindingAddress} key
   * @returns bound value
   * @public
   *
   */
  export function binding<ValueType>(
    key: BindingAddress<ValueType>
  ): Return<Binding<ValueType>, ContextNotFound> {
    const ctx = getContext();

    const bindValue = ctx.get(key);

    if (!bindValue) {
      throw new KeyNotFound(key);
    }

    return bindValue;
  }

  /**
   *
   * `inject` the current context
   *
   * @example
   *
   * ```
   * import { inject } from '@kraftr/context'
   *
   * function install() {
   *    const context = inject.context()
   * }
   * ```
   *
   *
   * @returns current context
   * @public
   *
   */
  export function context() {
    return getContext();
  }
}

/**
 *
 * Behave similar to `provide()` but is used to reference internal properties in a bound value
 *
 * @example
 *
 * ```
 * import { provide, ref } from '@kraftr/context'
 *
 * function install() {
 *    const obj = { name: 'internalValue' }
 *    provide('key').with(obj)
 *
 *    const nameBind = ref('key', 'name')
 *
 *    assert.equal(nameBind.value(), 'internalValue')
 * }
 * ```
 *
 *
 * @param {BindingAddress} key bind key to get the associated value
 * @param property nested value of the bound value
 * @returns bind with property as source
 * @public
 *
 */
export function ref<ValueType, Property extends keyof ValueType>(
  key: BindingAddress<ValueType>,
  property: Property
): Binding<ValueType[Property]> {
  return provide(`${key}.$${property}`)
    .with(() => inject.deep(key, property))
    .in(BindingScope.TRANSIENT)
    .memoize() as Binding<ValueType[Property]>;
}

/**
 *
 * Creates a new `Binding()` for a specific key. this function
 * attach automatically the binding to the current context.
 *
 * @example
 *
 * ```
 * import { provide } from '@kraftr/context'
 *
 * function install() {
 *    provide('key')
 * }
 * ```
 *
 * @param {BindingAddress} key bind key to get the associated value
 * @returns Created binding
 * @throws ContextNotFound
 * @since v0.1.0
 * @public
 *
 */
export function provide<BoundValue>(
  key: BindingAddress<BoundValue>,
  options?: { policy: 'ALWAYS_CREATE' | 'IF_NOT_EXIST' }
): Return<Binding<BoundValue>, ContextNotFound | LockError> {
  const ctx = getContext();
  let binding: Binding<BoundValue> | undefined;

  if (options?.policy === undefined || options.policy === 'ALWAYS_CREATE') {
    binding = new Binding(key);
    ctx.add(binding as Binding);
    return binding;
  }

  binding = ctx.get(key);

  if (!binding) {
    binding = new Binding(key);
    ctx.add(binding as Binding);
  }

  return binding;
}
