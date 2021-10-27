import { createSequence } from '@kraftr/sequence';

type OpenAPIContext = {
  schema: OpenAPIObject;
};

const t: OpenAPIObject = {
  components: {}
};

export const OpenAPIGenerator = createSequence<JSONSchemaType<unknown>>(
  'SchemaGenerator',
  []
).build([]);
