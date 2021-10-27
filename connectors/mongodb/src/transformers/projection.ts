import { SequenceFn } from '@kraftr/sequence';
import { T } from 'ts-toolbelt';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:pagination');

export const projectionTransformer: SequenceFn<QueryBuilder> = async (builder, next) => {
  if (!builder.query.fields) return next(builder);

  builder.aggregate.push({
    $project: Object.fromEntries(
      builder.query.fields.map((key) => [key.slice(1), key[0] === '+'])
    )
  });

  return next(builder);
};
