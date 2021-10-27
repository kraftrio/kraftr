import { SequenceFn } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { FilterSchemaContext } from './context';
import debugFactory from 'debug';
const debug = debugFactory('kraftr:schema:filter-schema:skip');

export const skipSchema: SequenceFn<FilterSchemaContext> = (builder, next) => {
  debug('Generating skip schema for %s', builder.model.name);

  const schema: JSONSchemaType<number> = {
    type: 'integer',
    minimum: 0
  };

  if (!builder.schema.properties) {
    builder.schema.properties = {};
  }

  builder.schema['properties']['skip'] = schema;

  return next(builder);
};
