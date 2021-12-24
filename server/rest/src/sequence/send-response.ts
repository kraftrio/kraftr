import { inject, Middleware, provide } from '@kraftr/core';
import { StartupData } from '@kraftr/core/dist/types';
import { RestBindings } from '../bindings';
import { HttpResponse } from '../http-errors';

export const sendResponse: Middleware<StartupData> = async (ctx, next) => {
  const res = inject(RestBindings.Http.RESPONSE);

  let returnValue: unknown;
  let value: StartupData;

  try {
    value = await next(ctx);
    returnValue = inject(RestBindings.Operation.RETURN_VALUE);
  } catch (error) {
    value = ctx;

    if (!(error instanceof HttpResponse)) {
      HttpResponse.InternalServerError().apply(res);
      res.end();
      return value;
    }

    error.apply(res);
    res.end();
    return value;
  }

  if (returnValue === undefined) {
    HttpResponse.NotFound().apply(res);
    res.end();
    return value;
  }

  if (returnValue === null) {
    HttpResponse.Created().apply(res);
    res.end();
    return value;
  }

  res.write(returnValue);
  res.statusCode = 200;

  res.end();
  return value;
};
