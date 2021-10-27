import { SequenceFn } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { FilterSchemaContext } from './context';
import debugFactory from 'debug';
const debug = debugFactory('kraftr:schema:filter-schema:fields');

export const fieldsSchema: SequenceFn<FilterSchemaContext> = (builder, next) => {
  debug('Generating fields schema for %s', builder.model.name);
  const hideableProperties = Object.entries(builder.model.properties)
    .filter(([_, meta]) => meta.metadata['hideable'] === true)
    .map(([fieldName]) => fieldName);

  if (!hideableProperties.length) {
    return next(builder);
  }

  const schema: JSONSchemaType<string[]> = {
    title: `${builder.model.name}Fields`,
    type: 'array',
    uniqueItems: true,
    minItems: 1,
    description: 'Show or hide fields at will. 2 modes are allowed',
    items: {
      type: 'string'
    },
    oneOf: [
      {
        title: 'Additive Mode',
        description: 'Only fixed and defined fields',
        items: {
          enum: hideableProperties.map((key) => `+${key}`)
        }
      },
      {
        title: 'Subtractive Mode',
        description: 'All fields except those defined',
        items: {
          enum: hideableProperties.map((key) => `-${key}`)
        }
      }
    ]
  };

  if (!builder.schema.properties) {
    builder.schema.properties = {};
  }

  builder.schema['properties']['fields'] = schema;

  return next(builder);
};
