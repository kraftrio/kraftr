import pino from 'pino';
import match from 'picomatch';
import { performance } from 'node:perf_hooks';

let initial = performance.now();

export function createLogger(namespace: string) {
  const debug = process.env['DEBUG'];

  return pino({
    enabled: !!debug && match.isMatch(namespace, debug),
    level: 'debug',
    name: namespace
  });
}
