import { SequenceFn } from '@kraftr/sequence';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:where');

export const whereTransformer: SequenceFn<QueryBuilder> = (builder, next) => {
  let where = builder.query.where;

  if (!where) return next(builder);

  builder.aggregate.push({ $match: where });

  return next(builder);
};
