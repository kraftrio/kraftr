import match from 'picomatch';
import pino, { LoggerOptions } from 'pino';

export function createLogger(namespace: string, options?: LoggerOptions) {
  const debug = process.env['DEBUG'];
  const debugEnabled = !!debug && match.isMatch(namespace, debug);

  return pino({
    enabled: true,
    level: debugEnabled ? 'debug' : process.env['DEBUG_LEVEL'] ?? 'warn',
    ...options,
    name: namespace
  });
}
