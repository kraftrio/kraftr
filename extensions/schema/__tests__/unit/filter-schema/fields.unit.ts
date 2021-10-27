import { tests } from '@kraftr/sequence';
import { fieldsSchema } from '../../../src/filter-schema';
import { FilterSchemaContext } from '../../../src/filter-gen';
import { givenModel } from '@kraftr/model/test-utils';

import Ajv, { ValidateFunction } from 'ajv';

describe('fieldsSchema', () => {
  let fieldValidation: ValidateFunction;

  beforeAll(async () => {
    const query: FilterSchemaContext = {
      model: givenModel(
        'User',
        {
          name: {},
          phone: {}
        },
        { metadata: { hideable: true } }
      ),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(fieldsSchema, query);
    const ajv = new Ajv();
    fieldValidation = ajv.compile(result.returnValue.schema);
  });

  it('dont allow duplicate items', async () => {
    fieldValidation({
      fields: ['+name', '+name']
    });

    expect(fieldValidation.errors).not.toBeNull();
  });

  it('dont allow 2 modes simultanously', async () => {
    fieldValidation({
      fields: ['+name', '-name']
    });

    expect(fieldValidation.errors).not.toBeNull();
  });

  it('dont additional properties', async () => {
    fieldValidation({
      fields: ['-parent']
    });

    expect(fieldValidation.errors).not.toBeNull();
  });

  it('generate a json schema for all hideable properties', async () => {
    const query: FilterSchemaContext = {
      model: givenModel(
        'User',
        {
          name: {},
          phone: {}
        },
        { metadata: { hideable: true } }
      ),
      schema: {
        type: 'object',
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(fieldsSchema, query);

    const expected = {
      type: 'object',
      properties: {
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
              title: 'Additive Mode',
              items: {
                enum: ['+name', '+phone']
              },
              description: 'Only fixed and defined fields'
            },
            {
              title: 'Subtractive Mode',
              items: {
                enum: ['-name', '-phone']
              },
              description: 'All fields except those defined'
            }
          ]
        }
      },
      additionalProperties: false
    };
    expect(result.nextValue.schema).toEqual(expected);
  });

  it('dont allow use fields if all property arent hideable', async () => {
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
    const result = await tests.testSequence(fieldsSchema, query);

    expect(result.nextValue.schema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false
    });
  });

  it('only allow hideable properties', async () => {
    const query: FilterSchemaContext = {
      model: givenModel('User', {
        name: {},
        phone: { metadata: { hideable: true } }
      }),
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    };
    const result = await tests.testSequence(fieldsSchema, query);
    const expected = {
      properties: {
        fields: {
          oneOf: [{ items: { enum: ['+phone'] } }, { items: { enum: ['-phone'] } }]
        }
      }
    };
    expect(result.nextValue.schema).toMatchObject(expected);
  });
});
