import { inject } from '@kraftr/core';
import { finished } from 'node:stream/promises';
import { RestBindings } from '../bindings';

export type Body<B> = {
  value: Promise<B>;
};
export function defineBody<B>(): Body<B> {
  return {
    get value() {
      const stream = inject(RestBindings.Http.BODY);

      return finished(stream).then(() => stream.read());
    }
  };
}
