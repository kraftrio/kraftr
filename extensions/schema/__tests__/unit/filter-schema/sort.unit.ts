import { tests } from '@kraftr/sequence';
import { sortSchema } from '../../../src/filter-schema';
import { FilterSchemaContext } from '../../../src/filter-gen';
import { givenModel } from '@kraftr/model/test-utils';

describe('sortSchema', () => {
  it('generate a json schema for all sortable properties', async () => {
    const query: FilterSchemaContext = {
      model: givenModel(
        'User',
        {
          name: {},
          phone: {}
        },
        { metadata: { sortable: true } }
      ),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(sortSchema, query);

    const expected = {
      type: 'object',
      properties: {
        sort: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['+name', '-name', '+phone', '-phone']
          },
          uniqueItems: true
        }
      },
      additionalProperties: false
    };
    expect(result.nextValue.schema).toEqual(expected);
  });

  it('dont allow use sort if all property arent sortable', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User', {
        name: {},
        phone: {}
      }),
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(sortSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false
    });
  });

  it('only allow sortable properties', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User', {
        name: {},
        phone: { metadata: { sortable: true } }
      }),
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(sortSchema, query);
    const expected = {
      type: 'object',
      properties: {
        sort: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['+phone', '-phone']
          },
          uniqueItems: true
        }
      },
      additionalProperties: false
    };
    expect(result.nextValue.schema).toEqual(expected);
  });
});
