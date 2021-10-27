import { SequenceFn } from '@kraftr/sequence';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:where');

export const includeTransformer: SequenceFn<QueryBuilder> = (builder, next) => {
  return next(builder);
};
