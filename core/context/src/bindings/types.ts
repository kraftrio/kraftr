import type { Binding } from './binding';

export type BindingTemplate<T extends Binding> = (bind: Binding) => T;
export type BindingTags<B> = B extends Binding<infer _, infer Tags> ? Tags : never;
export type BindingValue<B extends Binding> = B extends Binding<infer Value, infer _>
  ? Value
  : never;
