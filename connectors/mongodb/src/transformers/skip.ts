import { SequenceFn } from '@kraftr/sequence';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:skip');

export const skipTransformer: SequenceFn<QueryBuilder> = (builder, next) => {
  const skip = builder.query.skip;

  if (typeof skip === 'number') {
    builder.aggregate.push({ $skip: skip });
  }

  return next(builder);
};
