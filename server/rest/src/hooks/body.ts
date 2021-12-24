import { Binding, inject, provide, ref } from '@kraftr/core';
import { RestBindings } from '../bindings';
import { RestScope } from '../scopes';

export function defineBody<Body>(): Binding<Promise<Body>> {
  const reference = new Binding<Promise<Body>>('body')
    .dynamic()
    .memoize()
    .in(RestScope.REQUEST);

  return reference.with(async () => {
    const stream = inject(RestBindings.Http.BODY);

    const iterator = stream[Symbol.asyncIterator]() as AsyncIterableIterator<Body>;
    const result = await iterator.next();

    return result.value;
  });
}
