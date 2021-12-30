import {
  createApp,
  createListener,
  HttpComponent,
  useComponent,
  useConnect,
  useStatic,
  provide
} from '@kraftr/http-framework';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import logger from 'pino-http';

export const app = await createApp(async () => {
  useComponent(HttpComponent);

  // load components from folder
  await useComponent('./src/controllers');

  // express middleware
  useConnect('helmet', helmet());
  useConnect('logger', logger());

  provide<PrismaClient>('prisma').with(PrismaClient).class();

  // serve static assets
  useStatic('./static');
});

export default createListener(app);
