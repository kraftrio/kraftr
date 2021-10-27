import { limitTransformer } from '../../src/transformers';
import { tests } from '@kraftr/sequence';
import { QueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';

describe('limitTransformer', () => {
  it('transform an limit', async () => {
    const query: QueryBuilder = { query: { limit: 123 }, aggregate: [] };
    const result = await tests.testSequence(limitTransformer, query);

    expect(result.nextValue.aggregate).toEqual([{ $limit: 123 }]);
    expect(result.returnValue.aggregate).toEqual([{ $limit: 123 }]);
  });

  it('dont modify the original query', async () => {
    const query: QueryBuilder = { query: { limit: 123 }, aggregate: [] };
    const result = await tests.testSequence(limitTransformer, query);

    expect(result.nextValue.query).toEqual({ limit: 123 });
    expect(result.returnValue.query).toEqual({ limit: 123 });
  });

  it('add a default limit if not provided', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(limitTransformer, query);
    expect(result.nextValue.query).toEqual({});
    expect(result.nextValue.aggregate).toEqual([{ $limit: 100 }]);
    expect(result.returnValue.aggregate).toEqual([{ $limit: 100 }]);
  });
});
