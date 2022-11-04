import { C, F, L } from '@kraftr/common';
import type { Binding } from './binding';

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
  /**
   * The binding provides a value that is calculated each time. This will be
   * the default scope if not set.
   *
   * For example, with the following context hierarchy:
   *
   * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * Now `'b1'` is resolved to a new value each time for `app` and its
   * descendants `req1` and `req2`:
   * - app.get('b1') ==> 0
   * - req1.get('b1') ==> 1
   * - req2.get('b1') ==> 2
   * - req2.get('b1') ==> 3
   * - app.get('b1') ==> 4
   */
  TRANSIENT = 'Transient',
  /**
   * Metadata scope
   *
   * @remarks
   * The binding provides an metadata-scoped value within the context
   * hierarchy. Resolved value for this binding will hared for
   * the same metadata context.
   *
   */
  METADATA = 'Metadata',
  /**
   * The binding provides a value as a singleton within the context hierarchy
   * (the owning context and its descendants). The value is calculated only
   * once for the owning context and cached for subsequential uses. Child
   * contexts share the same value as their ancestors.
   *
   * For example, with the following context hierarchy:
   *
   * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * 1. `0` is the singleton for `app` afterward
   * - app.get('b1') ==> 0 (always)
   *
   * 2. `'b1'` is resolved in `app`, reuse it for `req1`
   * - req1.get('b1') ==> 0 (always)
   *
   * 3. `'b1'` is resolved in `app`, reuse it for `req2`
   * - req2.get('b1') ==> 0 (always)
   */
  SINGLETON = 'Singleton',
  /**
   * Server scope
   *
   * @remarks
   * The binding provides an server-scoped value within the context hierarchy.
   * Resolved value for this binding will be cached and shared for the same
   * server context (denoted by its scope property set to
   * `BindingScope.SERVER`).
   *
   * It's possible that an application has more than one servers configured,
   * such as a `RestServer` and a `GrpcServer`. Both server contexts are created
   * with `scope` set to `BindingScope.SERVER`. Depending on where a binding
   * is resolved:
   * - If the binding is resolved from the RestServer or below, it will be
   * cached using the RestServer context as the key.
   * - If the binding is resolved from the GrpcServer or below, it will be
   * cached using the GrpcServer context as the key.
   *
   * The same binding can resolved/shared/cached for all servers, each of which
   * has its own value for the binding.
   */
  SERVER = 'Server',
  /**
   * Application scope
   *
   * @remarks
   * The binding provides an application-scoped value within the context
   * hierarchy. Resolved value for this binding will be cached and shared for
   * the same application context (denoted by its scope property set to
   * `BindingScope.APPLICATION`).
   *
   */
  APPLICATION = 'Application'
}

export type BindingTemplate<T extends Binding> = (bind: Binding) => T;
export type BindingValue<B> = B extends Binding<infer Value> ? Value : unknown;

export type ConstantBindingSource<T> = {
  type: BindingType.CONSTANT;
  value: T;
};

export type DynamicValueBindingSource<T> = {
  type: BindingType.FUNCTION;
  value: F.Function<L.List, T>;
};

export type ClassBindingSource<T extends Object> = {
  type: BindingType.CLASS;
  value: C.Class<L.List, T>;
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
