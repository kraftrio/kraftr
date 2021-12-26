import { inject, Middleware, provide } from '@kraftr/core';
import destr from 'destr';
import { Transform } from 'node:stream';
import { RestBindings } from '..';
import { useHeaders } from '../composition/headers';
import { HttpResponse } from '../http-errors';

export const jsonSerializer: Middleware<void> = async (_, next) => {
  const headers = useHeaders();
  const request = inject(RestBindings.Http.REQUEST);

  const transform = new Transform({
    transform(chunk: Buffer, encoding, callback) {
      const value = chunk.toString('utf-8');
      const parsed = destr(value);

      // destr handle parsing error returning the same string
      if (parsed !== value) {
        callback(null, parsed);
      } else {
        callback(HttpResponse.UnprocessableEntity(), null);
      }
    },
    objectMode: true
  });
  const streamed = request.pipe(transform);
  provide(RestBindings.Http.BODY).with(streamed);

  await next();

  const response = inject(RestBindings.Http.RESPONSE);
  const returnValue = inject(RestBindings.Operation.RETURN_VALUE);

  if (returnValue === undefined || returnValue === null) {
    return;
  }
  for (const accept of headers.accept) {
    if (accept.essence === 'application/json') {
      provide(RestBindings.Operation.RETURN_VALUE).with(JSON.stringify(returnValue));
      response.setHeader('Content-Type', accept.essence);
      return;
    }
  }

  provide(RestBindings.Operation.RETURN_VALUE).with(String(returnValue));

  return;
};
