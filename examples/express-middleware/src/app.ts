import {
  createApp,
  createListener,
  HttpComponent,
  definePath,
  useComponent,
  useConnect,
  useController
} from '@kraftr/http-framework';
import helmet from 'helmet';
import logger from 'pino-http';

function helloWorld() {
  definePath('*');

  return () => {
    return 'Hello world!';
  };
}

export const app = createApp(() => {
  useComponent(HttpComponent);
  useController(helloWorld);

  // express middleware
  useConnect('helmet', helmet());
  useConnect('logger', logger());
});

export default createListener(app);
