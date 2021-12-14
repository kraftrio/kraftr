import { Context, getContext } from '../context';
import { BindingScope } from '../utils';
import { BindingAddress } from '../bindings';
import { isFunction } from '../utils';
import { EventEmitter } from 'tsee';
import type { Return } from '@kraftr/errors';
import { ContextNotFound, LockError, SourceNotDefined } from '../errors';
// const debug = debugFactory('kraftr:context:binding');

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
  type: BindingType.FUNCTION;
  value: null;
};

export type BindingSource<T> =
  | ConstantBindingSource<T>
  | DynamicValueBindingSource<T>
  | (T extends Object ? ClassBindingSource<T> : never)
  | EmptyBindingSource;

type BindingEvents<T> = {
  change: (bindings: [T, T], changes: number) => void;
};

type Lock<T> = Omit<T, 'lock' | 'with'> & {
  unlock: () => T;
};

type WidenLiterals<T> = T extends boolean
  ? boolean
  : T extends string
  ? string
  : T extends number
  ? number
  : T;
type NoInfer<A> = [A][A extends any ? 0 : never];

export class Binding<BoundValue = unknown> extends EventEmitter<
  BindingEvents<BindingSource<BoundValue>>
> {
  public scope: string = BindingScope.TRANSIENT;
  public tagMap: Map<string, unknown> = new Map();

  private _memoized = false;
  private _cache: WeakMap<Context, BoundValue> = new WeakMap();
  private _source: BindingSource<BoundValue> = {
    type: BindingType.FUNCTION,
    value: null
  };
  private _changes = 0;
  private _locked = false;

  constructor(public key: BindingAddress<BoundValue>) {
    super();
  }

  /**
   * @throws LockError
   * @param value - to bind to the key
   * @returns this (chainable)
   */
  with(value: BindingSource<BoundValue>['value']): Return<this, LockError> {
    if (this._locked) {
      throw new LockError(this.key);
    }
    const oldSource = this._source;
    this._source.value = value;

    this.emit('change', [oldSource, this._source], this._changes);
    return this as never;
  }

  /**
   * Cache the result even with transient, recompute the value when dependencies changes  (inner binds)
   * @param value
   */
  memoize(value = true): this {
    this._memoized = value;
    return this;
  }

  lock(): Lock<this> {
    this._locked = true;
    const newBind = new Binding(this.key);
    Object.assign(newBind, this);
    Object.assign(newBind, {
      unlock: () => {
        this._locked = false;
      }
    });
    newBind._source.value = this._source.value;
    return newBind as unknown as Lock<this>;
  }

  constant(): this {
    this._source.type = BindingType.CONSTANT;
    return this;
  }

  dynamic(): this {
    this._source.type = BindingType.FUNCTION;
    return this;
  }

  class(): this {
    this._source.type = BindingType.CLASS;
    return this;
  }

  /**
   *
   * @param bindingScope context scope where attach this binding
   * @returns this
   */
  in(bindingScope: string): this {
    this.scope = bindingScope;
    return this;
  }

  /**
   * @throws SourceNotDefined | ContextNotFound
   * @param altCtx alternative provided context to use
   * @returns bound value
   */
  value(altCtx?: Context): Return<BoundValue, SourceNotDefined | ContextNotFound> {
    /* istanbul ignore if */
    // if (debug.enabled) {
    //   debug('Get value for binding %s', this.key);
    // }
    if (this._source.value === undefined) {
      throw new SourceNotDefined(this.key);
    }
    const ctx = getContext() ?? altCtx;

    const resolutionCtx = this.getResolutionContext(ctx);

    if (this._source.type === BindingType.CONSTANT) {
      return this._source.value;
    }

    const cache = this._cache.get(resolutionCtx);
    if (cache !== undefined && this.scope !== BindingScope.TRANSIENT) {
      return cache;
    }

    let value: BoundValue;

    if (this._source.type === BindingType.CLASS) {
      value = new this._source.value();
    } else if (isFunction(this._source.value)) {
      value = this._source.value();
    } else {
      value = this._source.value as BoundValue;
    }
    if (this.scope !== BindingScope.TRANSIENT) {
      this._cache.set(resolutionCtx, value);
    }
    return value;
  }

  /**
   * Locate and check for the resolution context
   * @throws ContextNotFound
   * @param ctx - Current context
   * @param options - Resolution options
   */
  private getResolutionContext(ctx: Context): Return<Context, ContextNotFound> {
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
}
