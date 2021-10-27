import { tests } from '@kraftr/sequence';
import { limitSchema } from '../../../src/filter-schema';
import { FilterSchemaContext } from '../../../src/filter-gen';
import { givenModel } from '@kraftr/model/test-utils';

describe('limitSchema', () => {
  it('generate a json schema for limit', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User'),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(limitSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 200
        }
      },
      additionalProperties: false
    });
  });
});
