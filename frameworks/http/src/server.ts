import {
  BindingScope,
  Context,
  createContext,
  inject,
  provide,
  useContext
} from '@kraftr/core';
import { RequestListener } from 'node:http';
import { RestBindings, RestScope } from '.';
import { RestSequence } from './sequence';

export function createServer(appContext: Context): RequestListener {
  const serverCtx = new Context('Server Context', appContext);
  serverCtx.scope = BindingScope.SERVER;

  return async (req, res) => {
    const requestCtx = new Context('Request Context', serverCtx);
    requestCtx.scope = RestScope.REQUEST;

    return useContext(requestCtx, async () => {
      const sequence = inject(RestBindings.Server.SEQUENCE);
      provide(RestBindings.Http.REQUEST).with(req);
      provide(RestBindings.Http.RESPONSE).with(res);

      return sequence.execute();
    });
  };
}
