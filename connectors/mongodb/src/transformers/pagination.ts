import { SequenceFn } from '@kraftr/sequence';
import { T } from 'ts-toolbelt';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:pagination');

export const paginationTransformer: SequenceFn<QueryBuilder> = async (builder, next) => {
  const paginated = await next({ aggregate: [], query: builder.query });

  builder.aggregate.push(
    {
      $facet: {
        data: paginated.aggregate,
        pagination: [{ $count: '1' }]
      }
    },
    { $unwind: { path: '$pagination' } }
  );

  return builder;
};
