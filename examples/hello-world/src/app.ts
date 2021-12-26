import {
  createServer,
  RestComponent,
  useStatic,
  createApp,
  useComponent,
  load,
  useConnect
} from '@kraftr/http-framework';
import helmet from 'helmet';
import logger from 'pino-http';
import responseTime from 'response-time';
export const app = createApp(async () => {
  useComponent(RestComponent);
  await load('./src/controllers');
  useStatic('./static');
  useConnect('helmet', helmet());
  useConnect('response-time', responseTime());
  useConnect('logger', logger());
});

export default createServer(await app);
