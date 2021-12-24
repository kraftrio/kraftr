import { inject, Middleware, provide } from '@kraftr/core';
import { StartupData } from '@kraftr/core/dist/types';
import { RestBindings } from '../bindings';

export const invokeSequence: Middleware<StartupData> = async (ctx, next) => {
  const handler = inject(RestBindings.Operation.HANDLER);

  const returnValue = await handler();

  provide(RestBindings.Operation.RETURN_VALUE).with(returnValue);

  return ctx;
};
