import { Context, SequenceFn } from '@kraftr/core';
import debugFactory from 'debug';
const debug = debugFactory('kraftr:server:rest:init');

export const registerControllers: SequenceFn<Context> = async (ctx, next) => {
  debug('Registering and subscribing to controller handlers');

  return next(ctx);
};
