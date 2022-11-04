import { EventEmitter } from 'tsee';
import type { Binding, BindingAddress } from '../bindings';
import { BindingFilter, BindingScope } from '../bindings';

type ContextEvents = {
  add: (bind: Binding) => void;
};

export class Context extends EventEmitter<ContextEvents> {
  public scope: string = BindingScope.APPLICATION;
  protected readonly registry: Map<string, Binding> = new Map();

  constructor(public name: string = 'context', public parent?: Context) {
    super();
  }

  add(bind: Binding<any>): void {
    this.registry.set(bind.key.toString(), bind);
    this.emit('add', bind);
  }

  find(filter: BindingFilter): Binding[] {
    const bindings: Binding[] = [];
    for (const bind of this.registry.values()) {
      if (filter(bind)) {
        bindings.push(bind);
      }
    }
    const parentBindings = this.parent?.find(filter) ?? [];

    return [
      ...bindings,
      ...parentBindings.filter(
        (p) => !bindings.some((c) => c.key.toString() === p.key.toString())
      )
    ] as Binding[];
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
    if (this.parent) {
      return this.parent.isBound(key);
    }
    return false;
  }
  /**
   * Get the context matching the scope
   * @param scope - Binding scope
   */
  getScopedContext(scope: string): Context | undefined {
    if (this.scope === scope) return this;
    if (this.parent) {
      return this.parent.getScopedContext(scope);
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
      current = current.parent;
    }
    return false;
  }

  /**
   * Locate the resolution context for the given binding. Bindings in the
   * resolution context and its ancestors are visible as dependencies to resolve
   * the given binding
   * @param binding - Binding object
   */
  getResolutionContext(binding: Binding): Context | undefined {
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
  getOwnerContext(keyOrBinding: BindingAddress | Binding): Context | undefined {
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

    if (this.parent) {
      return this.parent.getOwnerContext(key);
    }
    return undefined;
  }

  get<ValueType>(key: BindingAddress<ValueType>): Binding<ValueType> | undefined {
    const binding = this.registry.get(key) as Binding<ValueType> | undefined;

    if (!binding && this.parent) {
      return this.parent.get(key);
    }
    return binding;
  }
}
