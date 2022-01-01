import { BindingAddress, inject, Middleware, provide } from '@kraftr/core';
import { RestBindings } from '../bindings';
import { HTTPMethod } from '../composition/utils';
import { RestScope } from '../scopes';
import { createLogger } from '@kraftr/common';

const logger = createLogger('kraftr:http-framework:sequences:find-route');

export const findRoute: Middleware<void> = async (_, next) => {
  logger.debug('Running findRoute middleware');

  const router = inject(RestBindings.Server.ROUTER);
  const request = inject(RestBindings.Http.REQUEST);
  const url = inject(RestBindings.Http.URL);

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

  provide(RestBindings.Operation.HANDLER)
    .constant()
    .in(RestScope.REQUEST)
    .with(handlerFn);

  provide(RestBindings.Http.PARAMS).constant().in(RestScope.REQUEST).with(params);

  return next();
};
