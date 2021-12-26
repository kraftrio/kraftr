import { inject, Middleware } from '@kraftr/core';
import { Duplex } from 'node:stream';
import { RestBindings } from '../bindings';
import { HttpResponse } from '../http-errors';

export const sendResponse: Middleware<void> = async (_, next) => {
  const res = inject(RestBindings.Http.RESPONSE);

  let returnValue: unknown;

  try {
    await next();
    returnValue = inject(RestBindings.Operation.RETURN_VALUE);
  } catch (error) {
    if (!(error instanceof HttpResponse)) {
      const message = error instanceof Error ? error.stack : '';
      console.log(error);

      HttpResponse.InternalServerError().apply(res);
      res.end();

      return;
    }

    error.apply(res);
    res.end();
    return;
  }

  if (returnValue === undefined) {
    HttpResponse.NotFound().apply(res);
    res.end();
    return;
  }

  if (returnValue === null) {
    HttpResponse.Created().apply(res);
    res.end();
    return;
  }

  res.write(returnValue);
  res.statusCode = 200;

  res.end();
  return;
};
