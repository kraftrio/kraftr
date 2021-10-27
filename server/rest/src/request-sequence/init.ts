import { SequenceFn, Context, useContext } from '@kraftr/core';
import debugFactory from 'debug';
const debug = debugFactory('kraftr:server:rest:init');

export const initSequence: SequenceFn<Context> = async (ctx, next) => {
  debug('Set the request context during the sequence');

  return useContext(new Context(ctx), next);
};
