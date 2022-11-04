import { inject } from '@kraftr/core';
import { once } from 'node:events';
import { Readable } from 'node:stream';
import { HttpBindings } from '../bindings';
import { deserialize } from '../parsers';
import destr from 'destr';

export type Body<B> = {
  value: Promise<B>;
};

export async function process(stream: Readable) {
  const arr = [];
  for await (const chunk of stream) {
    arr.push(chunk);
  }
  const result = Buffer.concat(arr);

  return destr(result.toString('utf-8')); // empty body cases
}

export function defineBody<B>(): Body<B> {
  return {
    get value() {
      const stream = inject(HttpBindings.Request.INSTANCE);

      return process(stream);
    }
  };
}
