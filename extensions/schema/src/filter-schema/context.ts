import { ModelDefinition } from '@kraftr/model';
import { JSONSchemaType } from 'ajv';

export type FilterSchemaContext = {
  model: ModelDefinition;
  schema: JSONSchemaType<Record<string, unknown>>;
};
