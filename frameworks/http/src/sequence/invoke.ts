import {
  createLogger,
  isAsyncIterable,
  isIterable,
  isReadableStream,
  isStream,
  toStream
} from '@kraftr/common';
import { inject, Middleware } from '@kraftr/core';
import { Readable } from 'node:stream';
import { HttpBindings } from '../bindings';
import { HttpException } from '../http-errors';

const logger = createLogger('kraftr:http-framework:sequences:find-route');

export const invokeMiddleware: Middleware<void> = async () => {
  const handler = inject(HttpBindings.Operation.HANDLER);
  logger.debug('Invoking controller');

  const returnValue = await handler();
  const responseStream = inject(HttpBindings.Response.STREAM);
  if (returnValue === undefined || returnValue === null) {
    const response = inject(HttpBindings.Response.INSTANCE);
    response.statusCode = 204;
    responseStream.end();
    return;
  }

  if (
    !Array.isArray(returnValue) &&
    typeof returnValue !== 'string' &&
    isIterable(returnValue)
  ) {
    logger.debug('Controller returned async iterable');
    Readable.from(returnValue, { objectMode: true }).pipe(responseStream);
    return;
  }

  if (isReadableStream(returnValue)) {
    logger.debug('Controller returned readable stream');
    returnValue.pipe(responseStream);
    return;
  }

  if (isStream(returnValue)) {
    logger.debug('Controller returned not readable stream');
    // eslint-disable-next-line @kraftr/returns-throw
    throw new HttpException.InternalServerError();
  }

  logger.debug('Controller returned an object');

  toStream(returnValue).pipe(responseStream);
};
