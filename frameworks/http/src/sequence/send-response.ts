import { inject, Middleware, shelter } from '@kraftr/core';
import { pipeline } from 'node:stream/promises';
import { RestBindings } from '../bindings';
import { HttpException, HttpStatus } from '../http-errors';

export const sendResponse: Middleware<void> = async (_, next) => {
  const response = inject(RestBindings.Http.RESPONSE);

  const result = await shelter(() => next());

  const responseStream = inject(RestBindings.Operation.RESPONSE_STREAM);

  if (result.isOk) {
    return pipeline(responseStream, response);
  }

  if (result.error instanceof HttpException) {
    response.writeHead(result.error.statusCode, result.error.message);
    return pipeline(result.error, response);
  }

  if (result.error instanceof Error) {
    response.writeHead(HttpStatus.InternalServerError, result.error.message);
    return pipeline(
      [
        {
          message: result.error.message,
          stack: result.error.stack,
          statusCode: HttpStatus.InternalServerError
        }
      ],
      response
    );
  }

  return pipeline(
    [{ statusCode: HttpStatus.InternalServerError, message: 'Unknown Error' }],
    response
  );
};
