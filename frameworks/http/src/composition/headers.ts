import { createLogger } from '@kraftr/common';
import { inject } from '@kraftr/core';
import { HttpBindings } from '../bindings';
import { HttpStatus } from '../http-errors';

const logger = createLogger('kraftr:http-framework:composition:headers');

export function useHeaders() {
  return inject(HttpBindings.Request.HEADERS);
}

export function writeHead(statusCode: HttpStatus): void;
export function writeHead(statusCode: HttpStatus, statusMessage: string): void;
export function writeHead(statusCode: HttpStatus, statusMessage?: string) {
  const res = inject(HttpBindings.Response.INSTANCE);
  logger.debug({ statusCode, statusMessage }, 'Setting headers');
  res.writeHead(statusCode, statusMessage);
}
