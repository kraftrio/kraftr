import { sortTransformer } from '../../src/transformers/sort';
import { tests } from '@kraftr/sequence';
import { QueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';

describe('sortTransformer', () => {
  it('transform a string +sortending', async () => {
    const query: QueryBuilder = { query: { sort: '+name' }, aggregate: [] };
    const result = await tests.testSequence(sortTransformer, query);

    expect(result.nextValue.aggregate).toEqual([{ $sort: { name: 1 } }]);
    expect(result.returnValue.aggregate).toEqual([{ $sort: { name: 1 } }]);
  });

  it('transform a string sort descending', async () => {
    const query: QueryBuilder = { query: { sort: '-name' }, aggregate: [] };
    const result = await tests.testSequence(sortTransformer, query);

    expect(result.nextValue.aggregate).toEqual([{ $sort: { name: -1 } }]);
    expect(result.returnValue.aggregate).toEqual([{ $sort: { name: -1 } }]);
  });

  it('transform a string array sort', async () => {
    const query: QueryBuilder = { query: { sort: ['+name'] }, aggregate: [] };
    const result = await tests.testSequence(sortTransformer, query);
    expect(result.nextValue.aggregate).toEqual([{ $sort: { name: 1 } }]);
    expect(result.returnValue.aggregate).toEqual([{ $sort: { name: 1 } }]);
  });

  it('Dont modify the original query', async () => {
    const query: QueryBuilder = { query: { sort: ['+name'] }, aggregate: [] };
    const result = await tests.testSequence(sortTransformer, query);
    expect(result.nextValue.query).toEqual({ sort: ['+name'] });
    expect(result.returnValue.query).toEqual({ sort: ['+name'] });
  });

  it('dont add unnecessary sort if not provided', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(sortTransformer, query);
    expect(result.returnValue.query).toEqual({});
    expect(result.nextValue.aggregate).toEqual([]);
    expect(result.returnValue.aggregate).toEqual([]);
  });
});
