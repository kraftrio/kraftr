import { tests } from '@kraftr/sequence';
import { skipSchema } from '../../../src/filter-schema';
import { FilterSchemaContext } from '../../../src/filter-gen';
import { givenModel } from '@kraftr/model/test-utils';

describe('skipSchema', () => {
  it('generate a json schema for skip', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User'),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(skipSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {
        skip: {
          type: 'integer',
          minimum: 0
        }
      },
      additionalProperties: false
    });
  });
});
