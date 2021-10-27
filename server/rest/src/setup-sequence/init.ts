import express from 'express';
import {
  provide,
  SequenceFn,
  BindingScope,
  Context,
  getContext,
  useContext
} from '@kraftr/core';
import debugFactory from 'debug';
import { RestBindings } from '../bindings';
const debug = debugFactory('kraftr:server:rest:init');

export const initServer: SequenceFn<Context> = async (ctx, next) => {
  debug('Initialize express server');
  const serverContext = new Context(getContext()); // Server context
  const instance = express();

  useContext(serverContext, () => {
    provide(RestBindings.Server.INSTANCE)
      .in(BindingScope.SERVER)
      .with(instance)
      .constant();
  });

  return next(ctx);
};
