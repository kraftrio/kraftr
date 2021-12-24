import type { Return } from '@kraftr/errors';
import EventEmitter from 'node:events';
import { isPromise } from 'node:util/types';
import { BindingAddress } from '../bindings';
import { Context, getContext } from '../context';
import { ContextNotFound, SourceNotDefined } from '../errors';
import { isAny, isAnyObject, isBoolean, isString } from '../types';
import { isFunction } from '../utils';

/**
 * Binding sources
 */
export enum BindingType {
  /**
   * A fixed value
   */
  CONSTANT = 'Constant',
  /**
   * A function to get the value
   */
  FUNCTION = 'Function',
  /**
   * Class constructor
   */
  CLASS = 'Class'
}

export enum BindingScope {
  TRANSIENT = 'Transient',
  METADATA = 'Metadata',
  SINGLETON = 'Singleton',
  SERVER = 'Server',
  APPLICATION = 'Application'
}

export type ConstantBindingSource<T> = {
  type: BindingType.CONSTANT | BindingType.FUNCTION;
  value: T;
};
export type DynamicValueBindingSource<T> = {
  type: BindingType.FUNCTION;
  value: () => T;
};
export type ClassBindingSource<T extends Object> = {
  type: BindingType.CLASS;
  value: new () => T;
};
export type EmptyBindingSource = {
  type: BindingType.CONSTANT;
  value: null;
};

export type BindingSource<T> =
  | ConstantBindingSource<T>
  | DynamicValueBindingSource<T>
  | (T extends Object ? ClassBindingSource<T> : never)
  | EmptyBindingSource;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface TagMap<Shape = Record<string, unknown>> extends Map<string, unknown> {
  delete(key: keyof Shape & string): boolean;
  has(key: keyof Shape & string): boolean;
  forEach(
    callbackfn: (
      value: Shape[keyof Shape],
      key: keyof Shape & string,
      map: TagMap<Shape>
    ) => void,
    thisArg?: unknown
  ): void;
  get<Key extends keyof Shape & string>(key: Key): Shape[Key];
  set<Key extends keyof Shape & string>(key: Key, value: Shape[Key]): this;
}

export class Binding<
  BoundValue = unknown,
  Tags extends Record<string, unknown> = Record<string, unknown>
> extends EventEmitter {
  public scope: string = BindingScope.TRANSIENT;
  public tagMap?: TagMap<Tags>;

  #memoized = false;
  #cache: WeakMap<Context, BoundValue> = new WeakMap();
  #source: BindingSource<BoundValue> = {
    type: BindingType.CONSTANT,
    value: null
  };
  #initialized = false;
  isLocked = false;

  constructor(public key: BindingAddress<BoundValue>) {
    super();
  }

  get type() {
    return this.#source.type;
  }

  /**
   * @throws LockError
   * @param value - to bind to the key
   * @returns this
   */
  with(value: BindingSource<BoundValue>['value']): this {
    if (isPromise(value)) {
      // Promises are a construct primarily intended for flow control:
      // In an algorithm with steps 1 and 2, we want to wait for the outcome
      // of step 1 before starting step 2.
      //
      // Promises are NOT a tool for storing values that may become available
      // in the future, depending on the success or a failure of a background
      // async task.
      //
      // Values stored in bindings are typically accessed only later,
      // in a different turn of the event loop or the Promise micro-queue.
      // As a result, when a promise is stored via `.with()` and is rejected
      // later, then more likely than not, there will be no error (catch)
      // handler registered yet, and Node.js will print
      // "Unhandled Rejection Warning".
      throw new Error(
        'Promise instances are not allowed for constant values ' +
          'Register an async getter function '
      );
    }
    this.emit('source', value);
    this.emit('value', value);
    this.#source.value = value;
    this.#initialized = true;

    return this;
  }

  /**
   * Cache the result even with transient, recompute the value when dependencies changes  (inner binds)
   * @param value
   */
  memoize(value = true): this {
    this.#memoized = value;
    return this;
  }

  /**
   * Mark this bind as locked so any change to the source is not allowed
   * @returns this
   */
  lock(): this {
    this.isLocked = true;
    return this;
  }

  /**
   * Mark this binding as constant, this way always the source is returned as is
   * @returns this
   */
  constant(): this {
    this.#source.type = BindingType.CONSTANT;
    return this;
  }

  /**
   * Mark this binding as dynamic, so if the source
   * is a function this will be called every time value() is called
   * @returns this
   */
  dynamic(): this {
    this.#source.type = BindingType.FUNCTION;
    return this;
  }

  /**
   * Mark this binding as the source is newable object, so every call to
   * value() would return a new instance
   * @returns this
   */
  class(): this {
    this.#source.type = BindingType.CLASS;
    return this;
  }

  tag<Key extends keyof Tags, Value extends isAny<Tags[Key], unknown, Tags[Key]>>(
    key: Key,
    value: isBoolean<Tags[Key], boolean | undefined, Value>
  ): Binding<
    BoundValue,
    {
      [key in Key | isString<keyof Tags, never, keyof Tags>]: (Tags &
        Record<Key, Value>)[key];
    }
  >;

  /**
   * set to a provided key a value
   * @param key
   * @param value to set to key
   */
  tag<Key extends string, Value extends Tags[Key]>(
    key: Key,
    value: Value
  ): Binding<
    BoundValue,
    {
      [key in Key | isString<keyof Tags, never, keyof Tags>]: (Tags &
        Record<Key, Value>)[key];
    }
  >;

  /**
   * Define this as true inside of tagMap
   * @param key set this tag to true
   */
  tag<Key extends string>(
    key: isAnyObject<Tags, Key, isBoolean<Tags[Key], Key, isAny<Tags[Key], Key, never>>>
  ): Binding<
    BoundValue,
    {
      [key in isAnyObject<Tags, Key, Key | keyof Tags>]: (Tags & Record<Key, true>)[key];
    }
  >;

  tag(key: unknown, value?: unknown): unknown {
    value = value === undefined ? true : value;
    if (!this.tagMap) {
      this.tagMap = new Map();
    }
    this.tagMap.set(key as never, value as never);
    this.emit('tag', key as never, value as never);

    return this;
  }

  apply<Bind>(template: (bind: Binding) => Bind): Bind {
    return template(this as Binding);
  }

  /**
   *
   * @param bindingScope context scope where attach this binding
   * @returns this
   */
  in(bindingScope: string): this {
    this.scope = bindingScope;
    this.emit('scope', this.scope);
    return this;
  }

  /**
   * @throws SourceNotDefined | ContextNotFound
   * @returns bound value
   */
  value(): Return<BoundValue, SourceNotDefined | ContextNotFound> {
    if (!this.#initialized) {
      throw new SourceNotDefined(this.key);
    }
    let sourceValue = this.#source.value as BoundValue;

    if (this.#source.type === BindingType.CONSTANT) {
      return sourceValue;
    }

    const resolutionCtx = this.getResolutionContext();

    let value = this.#cache.get(resolutionCtx);
    if (this.scope !== BindingScope.TRANSIENT && value !== undefined) {
      return value;
    }

    if (this.#source.type === BindingType.CLASS) {
      value = new this.#source.value();
    } else if (isFunction(this.#source.value)) {
      value = this.#source.value();
    } else {
      throw new TypeError(
        `bind ${this.key} is type ${
          this.#source.type
        } but it's source is not callable/newable`
      );
    }

    if (this.scope !== BindingScope.TRANSIENT) {
      this.#cache.set(resolutionCtx, value);
    }

    return value;
  }

  /**
   * Locate and check for the resolution context
   * @throws ContextNotFound
   */
  private getResolutionContext(): Return<Context, ContextNotFound> {
    const ctx = getContext();

    const resolutionCtx = ctx.getResolutionContext(this as Binding);

    if (!resolutionCtx && this.scope !== BindingScope.TRANSIENT) {
      const msg =
        `Binding "${this.key}" in context "${ctx.name}" cannot` +
        ` be resolved in scope "${this.scope}"`;
      throw new ContextNotFound(msg);
    }

    if (!resolutionCtx) {
      throw new ContextNotFound('Resolution context not found');
    }

    const ownerCtx = ctx.getOwnerContext(this.key);
    if (ownerCtx !== undefined && !ownerCtx.isVisibleTo(resolutionCtx)) {
      const msg =
        `Resolution context "${resolutionCtx?.name}" does not have ` +
        `visibility to binding "${this.key} (scope:${this.scope})" in context "${ownerCtx.name}"`;
      throw new ContextNotFound(msg);
    }

    return resolutionCtx;
  }

  override on(
    eventName: 'tag',
    listener: (key: keyof Tags, value: Tags[keyof Tags]) => void
  ): this;
  override on(
    eventName: 'source' | 'value',
    listener: (value: BindingSource<BoundValue>['value']) => void
  ): this;
  override on(eventName: 'scope', listener: (newScope: string) => void): this;
  override on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  override emit(eventName: 'tag', key: keyof Tags, value: Tags[keyof Tags]): boolean;
  override emit(
    eventName: 'source' | 'value',
    value: BindingSource<BoundValue>['value']
  ): boolean;
  override emit(eventName: 'scope', scope: string): boolean;
  override emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }
}
