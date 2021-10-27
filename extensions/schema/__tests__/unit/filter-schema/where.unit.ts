import { tests } from '@kraftr/sequence';
import { whereSchema } from '../../../src/filter-schema';
import { FilterSchemaContext } from '../../../src/filter-gen';
import { givenModel } from '@kraftr/model/test-utils';

describe('whereSchema', () => {
  it('generate a json schema for where', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User'),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(whereSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {
        where: {
          type: 'object',
          additionalProperties: true
        }
      },
      additionalProperties: false
    });
  });
});
