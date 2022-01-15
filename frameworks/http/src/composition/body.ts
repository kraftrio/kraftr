import { inject } from '@kraftr/core';
import { once } from 'node:events';
import { HttpBindings } from '../bindings';
import { json } from '../parsers';

export type Body<B> = {
  value: Promise<B>;
};
export function defineBody<B>(): Body<B> {
  return {
    get value() {
      const stream = inject(HttpBindings.Request.INSTANCE);

      return once(stream.pipe(json.deserialize()), 'data').then((data: B[]) => data[0]!);
    }
  };
}
