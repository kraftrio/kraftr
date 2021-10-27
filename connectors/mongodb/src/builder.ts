import { Filter } from '@kraftr/model';
import { createSequence } from '@kraftr/sequence';
import {
  coercerTransformer,
  limitTransformer,
  paginationTransformer,
  projectionTransformer,
  relationResolver,
  skipTransformer,
  sortTransformer,
  whereTransformer
} from './transformers';
import { includeTransformer } from './transformers/include';
export type QueryBuilder = {
  aggregate: Record<string, unknown>[];
  query: Filter;
};

export const MongoQueryBuilder = createSequence<QueryBuilder>('MongoQueryBuilder', [
  'connectors.mongodb.coercer',
  'connectors.mongodb.include',
  'connectors.mongodb.relation-resolver',
  'connectors.mongodb.where',
  'connectors.mongodb.fields',
  'connectors.mongodb.sort',
  'connectors.mongodb.pagination',
  'connectors.mongodb.skip',
  'connectors.mongodb.limit'
]).build([
  {
    group: 'connectors.mongodb.coercer',
    ex: coercerTransformer
  },
  {
    group: 'connectors.mongodb.include',
    ex: includeTransformer
  },
  {
    group: 'connectors.mongodb.relation-resolver',
    ex: relationResolver
  },
  {
    group: 'connectors.mongodb.where',
    ex: whereTransformer
  },
  {
    group: 'connectors.mongodb.fields',
    ex: projectionTransformer
  },
  {
    group: 'connectors.mongodb.sort',
    ex: sortTransformer
  },
  {
    group: 'connectors.mongodb.pagination',
    ex: paginationTransformer
  },
  {
    group: 'connectors.mongodb.skip',
    ex: skipTransformer
  },
  {
    group: 'connectors.mongodb.limit',
    ex: limitTransformer
  }
]);
