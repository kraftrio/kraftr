import type { Return } from '@kraftr/errors';
import { getContext } from '../context';
import { ContextNotFound, KeyNotFound, LockError } from '../errors';
import { Binding } from './binding';
import { BindingFilter } from './binding-filter';
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
export function inject<ValueType>(
  key: BindingAddress<ValueType>,
  options: { optional: true }
): ValueType | undefined;

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

  export function filtered<Tags extends Record<string, unknown>>(
    filter: BindingFilter
  ): Binding<unknown>[] {
    return getContext().find(filter);
  }
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
    ctx.add(binding);
    return binding;
  }

  binding = ctx.get(key);

  if (!binding) {
    binding = new Binding(key);
    ctx.add(binding);
  }

  return binding;
}
