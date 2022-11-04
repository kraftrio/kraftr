import { createLogger, through } from '@kraftr/common';
import { inject, Middleware } from '@kraftr/core';
import { STATUS_CODES } from 'node:http';
import { TransformOptions } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { HttpBindings } from '../bindings';
import { HttpException, HttpStatus } from '../http-errors';
import { serialize, deserialize } from '../parsers';

export const fallbackToString: TransformOptions['transform'] = (chunk, _, cb) =>
  typeof chunk === 'string' || Buffer.isBuffer(chunk)
    ? cb(null, chunk)
    : cb(null, String(chunk));

const logger = createLogger('kraftr:http-framework:sequence:send-response');

export const sendResponse: Middleware<void> = async (_, next) => {
  const response = inject(HttpBindings.Response.INSTANCE);

  try {
    await next();
    const responseStream = inject(HttpBindings.Response.STREAM);

    response.setHeader('Content-Type', 'application/json');

    await pipeline(responseStream, serialize(), through(fallbackToString), response);
  } catch (error) {
    if (error instanceof HttpException) {
      response.writeHead(error.statusCode, error.message);

      return pipeline(error, serialize(), through(fallbackToString), response);
    }

    if (error instanceof Error) {
      response.writeHead(
        HttpStatus.InternalServerError,
        STATUS_CODES[HttpStatus.InternalServerError]
      );
      return pipeline(
        [
          {
            message: error.message,
            stack: error.stack,
            statusCode: HttpStatus.InternalServerError
          }
        ],
        serialize(),
        through(fallbackToString),
        response
      );
    }

    return pipeline(
      [{ statusCode: HttpStatus.InternalServerError, message: 'Unknown Error' }],
      serialize(),
      through(fallbackToString),
      response
    );
  }
};
