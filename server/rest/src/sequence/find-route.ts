import { inject, Middleware, provide } from '@kraftr/core';
import { StartupData } from '@kraftr/core/dist/types';
import { RestBindings } from '../bindings';
import { HTTPMethod } from '../hooks/utils';
import { RestScope } from '../scopes';

export const findRoute: Middleware<StartupData> = async (ctx, next) => {
  const router = inject(RestBindings.Server.ROUTER);
  const request = inject(RestBindings.Http.REQUEST);
  const url = inject(RestBindings.Http.URL);

  if (!router || !request.method || !request.url) return ctx;

  const method = request.method as HTTPMethod;

  const { params, handler } = router.find(method, url.pathname);
  if (!handler) return ctx;
  const handlerFn = inject(handler);

  provide(RestBindings.Operation.HANDLER)
    .constant()
    .in(RestScope.REQUEST)
    .with(handlerFn);
  provide(RestBindings.Http.PARAMS).constant().in(RestScope.REQUEST).with(params);

  return next(ctx);
};
