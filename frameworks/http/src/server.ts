import { BindingScope, Context, inject, provide, useContext } from '@kraftr/core';
import { RequestListener, createServer as createHttpServer } from 'node:http';
import { HttpScope } from './scopes';
import { HttpBindings } from './bindings';

export function createListener(appContext: Context): RequestListener {
  const serverCtx = new Context('Server Context', appContext);
  serverCtx.scope = BindingScope.SERVER;

  return async (req, res) => {
    const requestCtx = new Context('Request Context', serverCtx);
    requestCtx.scope = HttpScope.REQUEST;

    return useContext(requestCtx, async () => {
      const sequence = inject(HttpBindings.Server.SEQUENCE);
      provide(HttpBindings.Request.INSTANCE).with(req);
      provide(HttpBindings.Response.INSTANCE).with(res);

      return sequence.execute();
    });
  };
}

export function createServer(appContext: Context) {
  const listener = createListener(appContext);

  return createHttpServer(listener);
}
