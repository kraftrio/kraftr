import { C, F, O } from 'ts-toolbelt';
import { Context, getContext, useContext } from './context';
import { BindingScope } from './utils';
import debugFactory from 'debug';
import { BindingAddress } from '.';
import { EventEmitter } from 'tsee';
import { Err } from '@kraftr/errors';
import { ContextNotFound, ScopeNotFound, SourceNotDefined } from './errors';
const debug = debugFactory('kraftr:context:binding');

function isFunction(value: unknown): value is F.Function {
  return typeof value === 'function';
}

/**
 * Type of the binding source
 */
export enum BindingType {
  /**
   * A fixed value
   */
  CONSTANT = 'Constant',
  /**
   * A function to get the value
   */
  DYNAMIC_VALUE = 'DynamicValue',
  /**
   * A class to be instantiated as the value
   */
  CLASS = 'Class'
}

export function useScope(
  scope: string,
  fnScoped: F.Function
): Err<ScopeNotFound> | undefined {
  const ctx = getContext();
  const resolvedCtx = ctx.value()?.getScopedContext(scope);
  if (!resolvedCtx) {
    return Err(ScopeNotFound);
  }
  useContext(resolvedCtx, fnScoped);
}

export type ConstantBindingSource<T> = {
  type: BindingType.CONSTANT | BindingType.DYNAMIC_VALUE;
  value: T;
};
export type DynamicValueBindingSource<T> = {
  type: BindingType.DYNAMIC_VALUE;
  value: F.Function<[], T>;
};
export type ClassBindingSource<T extends O.Object> = {
  type: BindingType.CLASS;
  value: C.Class<[], T>;
};
export type EmptyBindingSource = {
  type: BindingType.DYNAMIC_VALUE;
  value: null;
};

type BindingSource<T> =
  | ConstantBindingSource<T>
  | DynamicValueBindingSource<T>
  | (T extends O.Object ? ClassBindingSource<T> : never)
  | EmptyBindingSource;

type BindingEvents<T> = {
  change: (bindings: [T, T], changes: number) => void;
};

export class Binding<BoundValue = unknown> extends EventEmitter<
  BindingEvents<BindingSource<BoundValue>>
> {
  public scope: string = BindingScope.TRANSIENT;
  public tagMap: Map<string, unknown> = new Map();

  private _cache: WeakMap<Context, BoundValue> = new WeakMap();
  private _source: BindingSource<BoundValue> = {
    type: BindingType.DYNAMIC_VALUE,
    value: null
  };
  private _changes = 0;

  constructor(public key: BindingAddress<BoundValue>) {
    super();
  }

  with(value: BindingSource<BoundValue>['value']): this {
    const ctx = getContext();
    if (!ctx.value()!.contains(this.key)) {
      ctx.value()!.add(this as Binding);
    }
    const oldSource = this._source;
    this._source.value = value;

    this.emit('change', [oldSource, this._source], this._changes);
    return this;
  }

  constant(): this {
    this._source.type = BindingType.CONSTANT;
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

  value(providedCtx?: Context): BoundValue {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Get value for binding %s', this.key);
    }
    if (!this._source.value) {
      throw new SourceNotDefined(this.key);
    }
    const ctx = getContext() ?? providedCtx;

    const resolutionCtx = this.getResolutionContext(ctx);

    if (this._source.type === BindingType.CONSTANT) {
      return this._source.value;
    }

    const cache = this._cache.get(resolutionCtx);
    if (cache && this.scope !== BindingScope.TRANSIENT) {
      return cache;
    }

    let value: BoundValue;

    if (this._source.type === BindingType.CLASS) {
      value = new this._source.value();
    } else if (isFunction(this._source.value)) {
      value = this._source.value();
    } else {
      value = this._source.value;
    }
    if (this.scope !== BindingScope.TRANSIENT) {
      this._cache.set(resolutionCtx, value);
    }
    return value;
  }

  /**
   * Locate and validate the resolution context
   * @param ctx - Current context
   * @param options - Resolution options
   */
  private getResolutionContext(ctx: Context): Context {
    const resolutionCtx = ctx.getResolutionContext(this as Binding);
    if (!resolutionCtx) {
      throw new ContextNotFound();
    }
    if (this.scope !== BindingScope.TRANSIENT && !resolutionCtx) {
      const msg =
        `Binding "${this.key}" in context "${ctx.name}" cannot` +
        ` be resolved in scope "${this.scope}"`;
      throw new ContextNotFound(msg);
    }

    const ownerCtx = ctx.getOwnerContext(this.key);
    if (ownerCtx != null && !ownerCtx.isVisibleTo(resolutionCtx)) {
      const msg =
        `Resolution context "${resolutionCtx?.name}" does not have ` +
        `visibility to binding "${this.key} (scope:${this.scope})" in context "${ownerCtx.name}"`;
      throw new ContextNotFound(msg);
    }
    return resolutionCtx;
  }
}
