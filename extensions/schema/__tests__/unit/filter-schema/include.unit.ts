import { tests } from '@kraftr/sequence';
import { includeSchema } from '../../../src/filter-schema';
import { FilterSchemaContext } from '../../../src/filter-gen';
import { givenModel } from '@kraftr/model/test-utils';

describe('includeSchema', () => {
  it('generate a json schema for relations', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User', {
        name: {},
        phone: {
          metadata: {
            model: 'Phone',
            relation: true
          }
        }
      }),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(includeSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {
        include: {
          oneOf: [
            {
              type: 'array',
              uniqueItems: true,
              items: {
                type: 'string',
                enum: ['phone']
              }
            },
            {
              type: 'object',
              properties: {
                phone: {
                  $ref: 'FilterPhone'
                }
              }
            }
          ]
        }
      },
      additionalProperties: false
    });
  });

  it('dont touch schema when no one relation is defined', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User', {
        name: {}
      }),
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(includeSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false
    });
  });
});
