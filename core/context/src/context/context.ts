import { BindingScope } from '../utils';
import type { BindingAddress, Binding } from '../bindings';
import { EventEmitter } from 'tsee';

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

  find<ValueType>(filter: (bind: Binding) => boolean): Binding<ValueType>[] | undefined {
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
   * Check if a key is in the context or its ancestors
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
    return undefined;
  }

  /**
   * Check if this context is visible (same or ancestor) to the given one
   * @param ctx - Another context object
   */
  isVisibleTo(ctx: Context): boolean {
    let current: Context | undefined = ctx;
    while (current !== undefined) {
      if (current === this) return true;
      current = current._parent;
    }
    return false;
  }

  /**
   * Locate the resolution context for the given binding. Bindings in the
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
      typeof keyOrBinding === 'object' && 'key' in keyOrBinding
        ? keyOrBinding.key
        : (keyOrBinding as BindingAddress);

    if (this.contains(key)) {
      if (typeof keyOrBinding !== 'string') {
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
    return undefined;
  }

  get<ValueType>(key: BindingAddress<ValueType>): Binding<ValueType> | undefined {
    const binding = this.registry.get(key.toString());

    if (!binding && this._parent) {
      return this._parent.get(key.toString());
    }
    return binding as Binding<ValueType>;
  }
}
