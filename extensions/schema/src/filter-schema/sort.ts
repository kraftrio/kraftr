import { SequenceFn } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { FilterSchemaContext } from './context';

import debugFactory from 'debug';
const debug = debugFactory('kraftr:schema:filter-schema:sort');

export const sortSchema: SequenceFn<FilterSchemaContext> = (builder, next) => {
  debug('Generating sort schema for %s', builder.model.name);
  const sortProperties = Object.entries(builder.model.properties)
    .filter(([_, meta]) => meta.metadata['sortable'] === true)
    .map(([fieldName]) => fieldName);

  if (!sortProperties.length) {
    return next(builder);
  }

  const schema: JSONSchemaType<string[]> = {
    type: 'array',
    uniqueItems: true,
    items: {
      type: 'string',
      enum: sortProperties.flatMap((key) => [`+${key}`, `-${key}`])
    }
  };

  if (!builder.schema.properties) {
    builder.schema.properties = {};
  }

  builder.schema['properties']['sort'] = schema;

  return next(builder);
};
