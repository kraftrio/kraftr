import { inject, Middleware, provide } from '@kraftr/core';
import { RestBindings } from '../bindings';

export const invokeMiddleware: Middleware<void> = async () => {
  const handler = inject(RestBindings.Operation.HANDLER);

  const returnValue = await handler();

  provide(RestBindings.Operation.RETURN_VALUE).with(returnValue);

  return;
};
