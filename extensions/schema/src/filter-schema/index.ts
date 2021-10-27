export * from './skip';
export * from './sort';
export * from './fields';
export * from './limit';
export * from './where';
export * from './include';

import { createSequence } from '@kraftr/sequence';
import {
  whereSchema,
  fieldsSchema,
  sortSchema,
  skipSchema,
  limitSchema,
  includeSchema
} from '.';
import { SchemaGBindings } from '../bindings';
import { FilterSchemaContext } from './context';

/**
 * Bindings for schema generators
 */

export const ModelSchemaGenerator = createSequence<FilterSchemaContext>(
  'SchemaGenerator',
  [
    SchemaGBindings.Filters.INCLUDE,
    SchemaGBindings.Filters.WHERE,
    SchemaGBindings.Filters.FIELDS,
    SchemaGBindings.Filters.SORT,
    SchemaGBindings.Filters.SKIP,
    SchemaGBindings.Filters.LIMIT
  ]
).build([
  {
    group: SchemaGBindings.Filters.INCLUDE,
    ex: includeSchema
  },
  {
    group: SchemaGBindings.Filters.WHERE,
    ex: whereSchema
  },
  {
    group: SchemaGBindings.Filters.FIELDS,
    ex: fieldsSchema
  },
  {
    group: SchemaGBindings.Filters.SORT,
    ex: sortSchema
  },
  {
    group: SchemaGBindings.Filters.SKIP,
    ex: skipSchema
  },
  {
    group: SchemaGBindings.Filters.LIMIT,
    ex: limitSchema
  }
]);
