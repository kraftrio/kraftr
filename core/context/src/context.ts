import { F } from 'ts-toolbelt';
import { Binding } from './binding';
import { BindingScope, isPromise } from './utils';
import { BindingAddress } from './injection';
import { EventEmitter } from 'tsee';
import { ContextNotFound } from './errors';

let currentContext: Context | undefined;

/**
 * Get the actual context can throw an exception since try running injection outside of context is undesirable
 * @returns Actual context
 */
export function getContext(): Context {
  if (!currentContext) {
    throw new ContextNotFound();
  }
  return currentContext;
}

export function setContext(ctx: Context): void {
  currentContext = ctx;
}

export function openContext(): void {
  currentContext = new Context();
}

export function closeContext(): void {
  currentContext = undefined;
}

export function useContext<T>(
  ctx: Context,
  fn: F.Function<[Context], Promise<T>>
): Promise<T>;
export function useContext<T>(ctx: Context, fn: F.Function<[Context], T>): T;

export function useContext<T>(
  ctx: Context,
  fn: F.Function | F.Function<[Context], Promise<T>>
): T | Promise<T> {
  const oldCtx = currentContext;
  currentContext = ctx;
  const result = fn(ctx);

  if (isPromise(result)) {
    return result.then((value) => {
      currentContext = oldCtx;
      return value;
    });
  }

  currentContext = oldCtx;
  return result;
}

type ContextEvents = {
  add: (bind: Binding) => void;
};

export class Context extends EventEmitter<ContextEvents> {
  constructor(parent?: Context) {
    super();
    this._parent = parent;
  }

  public scope: string = BindingScope.APPLICATION;
  public name = 'context';
  protected readonly registry: Map<string, Binding> = new Map();
  _parent?: Context;

  add(bind: Binding): void {
    this.emit('add', bind);
    this.registry.set(bind.key.toString(), bind);
  }

  find<ValueType>(filter: F.Function): Binding<ValueType>[] | undefined {
    const bindings: Binding[] = [];
    for (const bind of this.registry.values()) {
      if (filter(bind)) {
        bindings.push(bind);
      }
    }
    const parentBindings = this._parent?.find(filter) ?? [];
    return [
      ...bindings,
      ...parentBindings.filter(
        (p) => !bindings.some((c) => c.key.toString() === p.key.toString())
      )
    ] as Binding<ValueType>[];
  }

  /**
   * Check if a binding exists with the given key in the local context without
   * delegating to the parent context
   * @param key - Binding key
   */
  contains(key: BindingAddress): boolean {
    return this.registry.has(key.toString());
  }

  /**
   * Check if a key is bound in the context or its ancestors
   * @param key - Binding key
   */
  isBound(key: BindingAddress): boolean {
    if (this.contains(key)) return true;
    if (this._parent) {
      return this._parent.isBound(key);
    }
    return false;
  }
  /**
   * Get the context matching the scope
   * @param scope - Binding scope
   */
  getScopedContext(scope: string): Context | undefined {
    if (this.scope === scope) return this;
    if (this._parent) {
      return this._parent.getScopedContext(scope);
    }
  }

  /**
   * Check if this context is visible (same or ancestor) to the given one
   * @param ctx - Another context object
   */
  isVisibleTo(ctx: Context): boolean {
    let current: Context | undefined = ctx;
    while (current != null) {
      if (current === this) return true;
      current = current._parent;
    }
    return false;
  }

  /**
   * Locate the resolution context for the given binding. Only bindings in the
   * resolution context and its ancestors are visible as dependencies to resolve
   * the given binding
   * @param binding - Binding object
   */
  getResolutionContext(binding: Readonly<Binding<unknown>>): Context | undefined {
    switch (binding.scope) {
      case BindingScope.SINGLETON:
        return this.getOwnerContext(binding.key);
      case BindingScope.TRANSIENT:
        return this;
      default:
        // Use the scoped context
        return this.getScopedContext(binding.scope);
    }
  }

  /**
   * Get the owning context for a binding or its key
   * @param keyOrBinding - Binding object or key
   */
  getOwnerContext(
    keyOrBinding: BindingAddress | Readonly<Binding<unknown>>
  ): Context | undefined {
    const key: BindingAddress =
      keyOrBinding instanceof Binding
        ? keyOrBinding.key
        : (keyOrBinding as BindingAddress);

    if (this.contains(key)) {
      if (keyOrBinding instanceof Binding) {
        if (this.registry.get(key.toString()) === keyOrBinding) {
          return this;
        }
        return undefined;
      }
      return this;
    }

    if (this._parent) {
      return this._parent.getOwnerContext(key);
    }
  }

  get<ValueType>(key: BindingAddress<ValueType>): Binding<ValueType> | undefined {
    const binding = this.registry.get(key.toString());

    if (!binding && this._parent) {
      return this._parent.get(key.toString());
    }
    return binding as Binding<ValueType>;
  }
}

export function createContext<T>(fn: F.Function<[Context], Promise<T>>): Promise<T>;
export function createContext<T>(fn: F.Function<[Context], T>): T;

export function createContext<T>(
  fn: F.Function<[Context], Promise<T> | T>
): Promise<T> | T {
  return useContext(new Context(currentContext), fn);
}
