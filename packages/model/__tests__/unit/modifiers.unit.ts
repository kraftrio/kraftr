import { BindingKey } from '@kraftr/context';
import { auto, relation, required } from '../../src/modifiers';
import { givenModel } from '../../test-utils';

describe('modifiers', () => {
  it('required', async () => {
    const value = required()({ type: [Number], kind: 'field', metadata: {} });

    expect(value).toEqual({
      type: [Number],
      kind: 'field',
      metadata: {
        required: true,
        hideable: false
      }
    });
  });

  it('auto', async () => {
    const value = auto()({ type: [String], kind: 'field', metadata: {} });

    expect(value).toEqual({
      type: [String],
      kind: 'field',
      metadata: {
        autogenerate: true
      }
    });
  });

  it('relation', async () => {
    const User = givenModel('User');
    const operator = relation(User);
    const value = operator({ type: [String], kind: 'field', metadata: {} });

    expect(value).toEqual({
      type: [String],
      kind: 'field',
      metadata: {
        relation: true,
        model: BindingKey.create(User.name)
      }
    });
  });
});
