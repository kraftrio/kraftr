import {
  createApp,
  createServer,
  definePath,
  HttpComponent,
  useComponent,
  useController
} from '../../src';
// process.kill(process.pid, 'SIGUSR1');

createServer(
  createApp(() => {
    useComponent(HttpComponent);

    useController(() => {
      definePath('/status');

      return () => ({
        status: 'ok'
      });
    });
  })
).listen(3000);
