import { SequenceFn } from '@kraftr/sequence';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:limit');

export const limitTransformer: SequenceFn<QueryBuilder> = (builder, next) => {
  let limit = builder.query.limit;

  if (typeof limit !== 'number' || !limit) {
    limit = 100;
  }

  builder.aggregate.push({ $limit: limit });

  return next(builder);
};
