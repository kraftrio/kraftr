import { createLogger } from '@kraftr/common';
import { inject, Middleware } from '@kraftr/core';
import { STATUS_CODES } from 'node:http';
import { pipeline } from 'node:stream/promises';
import { HttpBindings } from '../bindings';
import { HttpException, HttpStatus } from '../http-errors';
import { through } from '../parsers/utils';

export const fallbackToString = () =>
  through((chunk, _, cb) =>
    typeof chunk === 'string' || Buffer.isBuffer(chunk)
      ? cb(null, chunk)
      : cb(null, String(chunk))
  );

const logger = createLogger('kraftr:http-framework:sequence:send-response');

export const sendResponse: Middleware<void> = async (_, next) => {
  const response = inject(HttpBindings.Response.INSTANCE);
  const json = through((chunk, _, cb) => {
    const parsed = JSON.stringify(chunk);

    // destr handle parsing error returning the same string
    if (parsed !== chunk) {
      cb(null, parsed);
    } else {
      cb(new HttpException.UnprocessableEntity(), null);
    }
  });

  try {
    await next();
    const responseStream = inject(HttpBindings.Response.STREAM);

    await pipeline(responseStream, json, fallbackToString(), response);
  } catch (error) {
    logger;
    if (error instanceof HttpException) {
      response.writeHead(error.statusCode, error.message);
      return pipeline(error, json, fallbackToString(), response);
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
        json,
        fallbackToString(),
        response
      );
    }

    return pipeline(
      [{ statusCode: HttpStatus.InternalServerError, message: 'Unknown Error' }],
      json,
      fallbackToString(),
      response
    );
  }
};
