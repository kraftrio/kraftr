import { BindingAddress, inject, Middleware, provide } from '@kraftr/core';
import { RestBindings } from '../bindings';
import { HTTPMethod } from '../composition/utils';
import { RestScope } from '../scopes';

export const findRoute: Middleware<void> = async (_, next) => {
  const router = inject(RestBindings.Server.ROUTER);
  const request = inject(RestBindings.Http.REQUEST);
  const url = inject(RestBindings.Http.URL);

  if (!request.method || !request.url) return;

  const method = request.method as HTTPMethod;

  const resolved = router.find(method, url.pathname);

  if (!resolved) return;
  const handler = resolved.handler as () => BindingAddress<() => unknown>;
  const params = resolved.params;

  const handlerFn = inject(handler());

  provide(RestBindings.Operation.HANDLER)
    .constant()
    .in(RestScope.REQUEST)
    .with(handlerFn);
  provide(RestBindings.Http.PARAMS).constant().in(RestScope.REQUEST).with(params);

  return next();
};
