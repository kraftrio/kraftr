import { component, provide } from '@kraftr/core';
import { RestScope } from '.';
import { RestBindings } from './bindings';
import { Router } from './router';
import { RestMiddlewareGroups, findRoute } from './sequence';
import { RestTemplates } from './template';

export const RestComponent = component(() => {
  provide(RestMiddlewareGroups.FIND_ROUTE)
    .apply(RestTemplates.Sequence.FIND_ROUTE)
    .with(findRoute);
  provide(RestMiddlewareGroups.INVOKE).apply(RestTemplates.Sequence.INVOKE).with();
  provide(RestMiddlewareGroups.SEND_RESPONSE)
    .apply(RestTemplates.Sequence.SEND_RESPONSE)
    .with(findRoute);
  provide(RestBindings.Server.ROUTER).class().in(RestScope.SERVER).with(Router);
});
