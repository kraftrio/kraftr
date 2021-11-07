import pino from 'pino';

export function createDebugger(
  namespace: string,
  opts?: pino.LoggerOptions
): pino.Logger {
  const re = process.env['DEBUG'] as string;
  return pino({
    level: namespace.test(re) ? 'debug' : 'silent',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid'
      }
    },
    ...opts
  });
}
