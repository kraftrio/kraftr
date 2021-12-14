import deepmerge from 'deepmerge';
import { BindingAddress, provide } from './bindings';
import { BindingScope } from './utils';

export class Metadata<T extends object = Record<string, unknown>> {
  data: T = {} as T;
  extend(obj: Partial<T>) {
    this.data = deepmerge(this.data, obj);
  }
}

export function useMetadata<T extends Record<string, unknown>>(key: BindingAddress<T>) {
  return provide<Metadata<T>>(key)
    .class()
    .in(BindingScope.METADATA)
    .with(Metadata)
    .value();
}
