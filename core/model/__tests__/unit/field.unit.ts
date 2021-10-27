import { field } from '../../src/model';

describe('field creator', () => {
  it('creates a basic structure over where to work on', async () => {
    const name = field(String);

    expect(name).toEqual({
      kind: 'field',
      metadata: {},
      type: [String]
    });
  });

  it('creates a basic structure with 2 types', async () => {
    const name = field([String, Number]);

    expect(name).toEqual({
      kind: 'field',
      metadata: {},
      type: [String, Number]
    });
  });

  it('use an operator', async () => {
    const name = field([String, Number], (meta) => ({ ...meta, extra: true }));

    expect(name).toEqual({
      kind: 'field',
      extra: true,
      metadata: {},
      type: [String, Number]
    });
  });
});
