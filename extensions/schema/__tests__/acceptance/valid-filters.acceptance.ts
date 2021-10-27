import { givenModel } from '@kraftr/model/test-utils';
import { BindingKey } from '@kraftr/context';
import { tests } from '@kraftr/sequence';
import { JSONSchemaType } from 'ajv';
import { O } from 'ts-toolbelt';
import { ModelSchemaGenerator } from '../../src/';
import Ajv from 'ajv';

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

  let ajv: Ajv;

  beforeAll(async () => {
    const user = await tests.testSequence(ModelSchemaGenerator, {
      model: User,
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    });
    const car = await tests.testSequence(ModelSchemaGenerator, {
      model: User,
      schema: {
        type: 'object',
        properties: {},
        additionalProperties: false
      }
    });
    const schemas: JSONSchemaType<O.Object>[] = [
      {
        $id: 'FilterCar',
        ...car.returnValue.schema
      },
      {
        $id: 'FilterUser',
        ...user.returnValue.schema
      }
    ];

    ajv = new Ajv({ schemas });
  });

  it('works for a valid filter', async () => {
    const validateUser = ajv.getSchema('FilterUser');
    validateUser?.({
      fields: ['+name', '+lastName'],
      where: {
        name: 'Test'
      },
      skip: 0,
      limit: 100,
      include: ['car'],
      sort: ['+name']
    });
    expect(validateUser?.errors).toBe(null);
  });

  it('throw error with not valid filter', async () => {
    const validateUser = ajv.getSchema('FilterUser');
    validateUser?.({
      fields: ['+name', '-name'],
      where: {
        name: 'Test'
      },
      skip: -2,
      limit: 100,
      include: ['car'],
      sort: ['+name']
    });

    expect(validateUser?.errors).not.toEqual(null);
  });
});
