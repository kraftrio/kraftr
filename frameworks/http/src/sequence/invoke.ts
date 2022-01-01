import { createLogger, isReadableStream, isStream, toStream } from '@kraftr/common';
import { inject, Middleware, provide } from '@kraftr/core';
import { Readable } from 'node:stream';
import { RestBindings } from '../bindings';
import { HttpException } from '../http-errors';

const logger = createLogger('kraftr:http-framework:sequences:find-route');

export const invokeMiddleware: Middleware<void> = async () => {
  const handler = inject(RestBindings.Operation.HANDLER);

  const returnValue = await handler();

  if (isReadableStream(returnValue)) {
    logger.debug('Controller returned readable stream');
    provide(RestBindings.Operation.RESPONSE_STREAM).with(returnValue);
    return;
  }

  if (isStream(returnValue)) {
    logger.debug('Controller returned not readable stream');
    // eslint-disable-next-line @kraftr/returns-throw
    throw new HttpException.InternalServerError();
  }

  provide(RestBindings.Operation.RESPONSE_STREAM).with(toStream(returnValue));
};
