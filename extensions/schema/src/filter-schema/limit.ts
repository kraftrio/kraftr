import { SequenceFn } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { FilterSchemaContext } from './context';

import debugFactory from 'debug';

const debug = debugFactory('kraftr:schema:filter-schema:limit');

export const limitSchema: SequenceFn<FilterSchemaContext> = (builder, next) => {
  debug('Generating limit schema for %s', builder.model.name);
  const schema: JSONSchemaType<number> = {
    type: 'integer',
    minimum: 1,
    maximum: 200
  };

  if (!builder.schema.properties) {
    builder.schema.properties = {};
  }

  builder.schema['properties']['limit'] = schema;

  return next(builder);
};
