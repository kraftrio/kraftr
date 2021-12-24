export * from './craft';
import { pino } from 'pino';

export function createLogger() {
  return pino({
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  });
}
