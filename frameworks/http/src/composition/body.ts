import { inject } from '@kraftr/core';
import { once } from 'node:events';
import { HttpBindings } from '../bindings';

export type Body<B> = {
  value: Promise<B>;
};
export function defineBody<B>(): Body<B> {
  return {
    get value() {
      const stream = inject(HttpBindings.Request.INSTANCE);

      return once(stream, 'data').then((data) => data[0] as B);
    }
  };
}
