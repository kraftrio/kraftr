import { BindingKey } from '@kraftr/context';
import { givenModel } from '@kraftr/model/test-utils';
import { tests } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { ModelSchemaGenerator } from '../../src/filter-schema';

describe('ModelSchemaGenerator', () => {
  const Car = givenModel('Car');
  const User = givenModel(
    'User',
    {
      id: {
        metadata: {
          required: true,
          hideable: false
        }
      },
      name: {},
      lastName: {},
      phone: {},
      car: {
        metadata: {
          sortable: false,
          relation: true,
          model: BindingKey.create<typeof Car>(Car.name)
        }
      }
    },
    { metadata: { sortable: true, hideable: true } }
  );
  const defaultSchema: JSONSchemaType<Record<string, unknown>> = {
    type: 'object',
    properties: {},
    additionalProperties: false
  };

  it('works for a single model', async () => {
    const result = await tests.testSequence(ModelSchemaGenerator, {
      model: User,
      schema: defaultSchema
    });

    expect(result.returnValue.schema).toEqual({
      additionalProperties: false,
      properties: {
        include: {
          oneOf: [
            {
              items: {
                enum: ['car'],
                type: 'string'
              },
              uniqueItems: true,
              type: 'array'
            },
            {
              properties: {
                car: {
                  $ref: 'FilterCar'
                }
              },
              type: 'object'
            }
          ]
        },
        limit: {
          minimum: 1,
          maximum: 200,
          type: 'integer'
        },
        skip: {
          minimum: 0,
          type: 'integer'
        },
        fields: {
          title: 'UserFields',
          type: 'array',
          uniqueItems: true,
          minItems: 1,
          description: 'Show or hide fields at will. 2 modes are allowed',
          items: {
            type: 'string'
          },
          oneOf: [
            {
              description: 'Only fixed and defined fields',
              title: 'Additive Mode',
              items: {
                enum: ['+name', '+lastName', '+phone', '+car']
              }
            },
            {
              description: 'All fields except those defined',
              title: 'Subtractive Mode',
              items: {
                enum: ['-name', '-lastName', '-phone', '-car']
              }
            }
          ]
        },
        sort: {
          items: {
            enum: [
              '+id',
              '-id',
              '+name',
              '-name',
              '+lastName',
              '-lastName',
              '+phone',
              '-phone'
            ],
            type: 'string'
          },
          type: 'array',
          uniqueItems: true
        },
        where: {
          additionalProperties: true,
          type: 'object'
        }
      },
      type: 'object'
    });
  });
});
