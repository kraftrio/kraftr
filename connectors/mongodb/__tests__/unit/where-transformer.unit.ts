import { whereTransformer } from '../../src/transformers';
import { tests } from '@kraftr/sequence';
import { QueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';

describe('whereTransformer', () => {
  it('transform an where', async () => {
    const query: QueryBuilder = { query: { where: { name: 'testName' } }, aggregate: [] };
    const result = await tests.testSequence(whereTransformer, query);

    expect(result.nextValue.aggregate).toEqual([{ $match: { name: 'testName' } }]);
    expect(result.returnValue.aggregate).toEqual([{ $match: { name: 'testName' } }]);
  });

  it('dont modify the original query', async () => {
    const query: QueryBuilder = { query: { where: { name: 'testName' } }, aggregate: [] };
    const result = await tests.testSequence(whereTransformer, query);

    expect(result.nextValue.query).toEqual({ where: { name: 'testName' } });
    expect(result.returnValue.query).toEqual({ where: { name: 'testName' } });
  });

  it('dont add unnecessary sort if not provided', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(whereTransformer, query);
    expect(result.nextValue.query).toEqual({});
    expect(result.nextValue.aggregate).toEqual([]);
    expect(result.returnValue.aggregate).toEqual([]);
  });
});
