import { isFunction } from '@kraftr/common';
import type { Return } from '@kraftr/errors';
import EventEmitter from 'node:events';
import { isPromise } from 'node:util/types';
import { BindingAddress } from '../bindings';
import { Context, getContext } from '../context';
import { ContextNotFound, SourceNotDefined } from '../errors';
import { BindingScope, BindingSource, BindingType } from './types';

export class Binding<BoundValue = unknown> extends EventEmitter {
  public scope: string = BindingScope.TRANSIENT;

  public tagMap?: Map<string, unknown>;

  // JS private properties (#) has some performance penalty

  private _cache: WeakMap<Context, BoundValue> = new WeakMap();
  private _source: BindingSource<BoundValue> = {
    type: BindingType.CONSTANT,
    value: null
  };
  private _initialized = false;
  isLocked = false;

  constructor(public key: BindingAddress<BoundValue>) {
    super();
  }

  get type() {
    return this._source.type;
  }

  /**
   * @throws LockError
   * @param value - to bind to the key
   * @returns this
   */
  with(value: BindingSource<BoundValue>['value']): Return<this, Error> {
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
    this._source.value = value;
    this._initialized = true;

    return this;
  }

  /**
   * Cache the result even with transient, recompute the value when dependencies changes  (inner binds)
   * @param value
   */
  memoize(value = true): this {
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
    this._source.type = BindingType.CONSTANT;
    return this;
  }

  /**
   * Mark this binding as dynamic, so if the source
   * is a function this will be called every time value() is called
   * @returns this
   */
  dynamic(): this {
    this._source.type = BindingType.FUNCTION;
    return this;
  }

  /**
   * Mark this binding as the source is newable object, so every call to
   * value() would return a new instance
   * @returns this
   */
  class(): this {
    this._source.type = BindingType.CLASS;
    return this;
  }

  tag(key: string, value?: unknown): this {
    value = value === undefined ? true : value;
    if (!this.tagMap) {
      this.tagMap = new Map();
    }
    this.tagMap.set(key, value);
    this.emit('tag', key, value);

    return this;
  }

  apply<Bind>(template: (bind: this) => Bind): Bind {
    return template(this);
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
    if (!this._initialized) {
      throw new SourceNotDefined(this.key);
    }
    let sourceValue = this._source.value as BoundValue;

    if (this._source.type === BindingType.CONSTANT) {
      return sourceValue;
    }

    const resolutionCtx = this.getResolutionContext();

    let value = this._cache.get(resolutionCtx);
    if (this.scope !== BindingScope.TRANSIENT && value !== undefined) {
      return value;
    }

    if (this._source.type === BindingType.CLASS) {
      value = new this._source.value();
    } else if (isFunction(this._source.value)) {
      value = this._source.value();
    } else {
      throw new TypeError(
        `bind ${this.key} is type ${this._source.type} but it's source is not callable/newable`
      );
    }

    if (this.scope !== BindingScope.TRANSIENT) {
      this._cache.set(resolutionCtx, value);
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

  override on(eventName: 'tag', listener: (key: string, value: unknown) => void): this;
  override on(
    eventName: 'source' | 'value',
    listener: (value: BindingSource<BoundValue>['value']) => void
  ): this;
  override on(eventName: 'scope', listener: (newScope: string) => void): this;
  override on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  override emit(eventName: 'tag', key: string, value: unknown): boolean;
  override emit(
    eventName: 'source' | 'value',
    value: BindingSource<BoundValue>['value']
  ): boolean;
  override emit(eventName: 'scope', scope: string): boolean;
  override emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }
}
