import { SequenceFn } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { FilterSchemaContext } from './context';
import debugFactory from 'debug';
const debug = debugFactory('kraftr:schema:filter-schema:where');

export const whereSchema: SequenceFn<FilterSchemaContext> = (builder, next) => {
  debug('Generating where schema for %s', builder.model.name);
  const whereProperties = Object.entries(builder.model.properties)
    .filter(([_, meta]) => meta.metadata['whereable'] === true)
    .map(([fieldName]) => fieldName);

  const schema: JSONSchemaType<Record<string, unknown>> = {
    type: 'object',
    additionalProperties: true
  };

  if (!builder.schema.properties) {
    builder.schema.properties = {};
  }

  builder.schema['properties']['where'] = schema;

  return next(builder);
};
