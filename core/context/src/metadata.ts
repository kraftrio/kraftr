import deepmerge from 'deepmerge';
import { BindingAddress, BindingScope, provide } from './bindings';

export class Metadata<T extends object = Record<string, unknown>> {
  data: T = {} as T;
  extend(obj: Partial<T>) {
    this.data = deepmerge(this.data, obj);
  }
}

export function useMetadata<T extends Record<string, unknown>>(
  key: BindingAddress<Metadata<T>>
) {
  return provide(key, { policy: 'IF_NOT_EXIST' })
    .class()
    .in(BindingScope.METADATA)
    .with(Metadata)
    .value();
}
