import { filterRelations } from '@kraftr/model';
import { SequenceFn } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { O } from 'ts-toolbelt';
import { FilterSchemaContext } from './context';
import debugFactory from 'debug';

const debug = debugFactory('kraftr:schema:filter-schema:include');

export const includeSchema: SequenceFn<FilterSchemaContext> = (builder, next) => {
  const relations = filterRelations(builder.model);
  if (!Object.keys(relations).length) {
    return next(builder);
  }

  const array: JSONSchemaType<string[]> = {
    type: 'array',
    items: {
      type: 'string',
      enum: Object.keys(relations)
    },
    uniqueItems: true
  };
  const object: JSONSchemaType<O.Object> = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(relations).map(([key, field]) => [
        key,
        { $ref: `Filter${field.metadata.model}` }
      ])
    )
  };

  const schema: JSONSchemaType<O.Object | string[]> = {
    oneOf: [array, object]
  };

  if (!builder.schema.properties) {
    builder.schema.properties = {};
  }

  builder.schema['properties']['include'] = schema;

  return next(builder);
};
