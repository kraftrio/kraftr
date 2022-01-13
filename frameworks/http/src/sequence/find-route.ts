import { BindingAddress, inject, Middleware, provide } from '@kraftr/core';
import { HttpBindings } from '../bindings';
import { HTTPMethod } from '../composition/utils';
import { HttpScope } from '../scopes';
import { createLogger } from '@kraftr/common';

const logger = createLogger('kraftr:http-framework:sequences:find-route');

export const findRoute: Middleware<void> = async (_, next) => {
  logger.debug('Running findRoute middleware');

  const router = inject(HttpBindings.Server.ROUTER);
  const request = inject(HttpBindings.Request.INSTANCE);
  const url = inject(HttpBindings.Request.URL);

  if (!request.method || !request.url) {
    logger.debug(request, 'method or url in request not found');
    return;
  }

  const method = request.method as HTTPMethod;

  const resolved = router.find(method, url.pathname);

  if (logger.isLevelEnabled('debug')) {
    logger.debug('Registered routes:\n' + router.prettyPrint());
  }

  if (!resolved) {
    logger.debug(`${method}: ${url.pathname} not found`);

    return;
  }

  const handler = resolved.handler as () => BindingAddress<() => unknown>;
  const bindAddress = handler();
  const params = resolved.params;

  logger.debug(`Resolved route: ${bindAddress}`);

  const handlerFn = inject(bindAddress);

  provide(HttpBindings.Operation.HANDLER)
    .constant()
    .in(HttpScope.REQUEST)
    .with(handlerFn);

  provide(HttpBindings.Request.PARAMS).constant().in(HttpScope.REQUEST).with(params);

  return next();
};
