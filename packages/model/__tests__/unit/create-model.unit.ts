// const timestamps = { createdAt: field(Date, required()) }

// const User = createModel('User', () => {
//     const id = field(String, auto())
//     const name = field(String, required())
//     const vehicles = field(String, relation(Phone))

//     return { id, vehicles, name, ...timestamps }
// })

import { createModel } from '../../src/model';

describe('create model', () => {
  it('creates a basic structure over where to work on', async () => {
    const builder = () => {
      return {};
    };
    const User = createModel('User', builder);

    expect(User).toEqual({
      name: 'User',
      builder: builder
    });
  });
});
