import { Application, Context, useContext } from '@kraftr/core';
import { createServer as createHttpServer } from 'node:http';
import { RestScope } from '.';

export function createServer(app: Application) {
  const appContext = app.init();
  const serverCtx = new Context('RestServer', appContext);
  serverCtx.scope = RestScope.SERVER;

  const instance = createHttpServer((req, res) => {
    useContext(serverCtx, () => {
      app.middleware(req, res);
    });
  });

  return instance;
}
