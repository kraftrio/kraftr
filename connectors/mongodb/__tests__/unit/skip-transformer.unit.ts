import { skipTransformer } from '../../src/transformers/skip';
import { tests } from '@kraftr/sequence';
import { QueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';

describe('skipTransformer', () => {
  it('transform an skip', async () => {
    const query: QueryBuilder = { query: { skip: 123 }, aggregate: [] };
    const result = await tests.testSequence(skipTransformer, query);

    expect(result.nextValue.aggregate).toEqual([{ $skip: 123 }]);
    expect(result.returnValue.aggregate).toEqual([{ $skip: 123 }]);
  });

  it('dont modify the original query', async () => {
    const query: QueryBuilder = { query: { skip: 123 }, aggregate: [] };
    const result = await tests.testSequence(skipTransformer, query);

    expect(result.nextValue.query).toEqual({ skip: 123 });
    expect(result.returnValue.query).toEqual({ skip: 123 });
  });

  it('Dont add unnecessary sort if not provided', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(skipTransformer, query);
    expect(result.nextValue.query).toEqual({});
    expect(result.nextValue.aggregate).toEqual([]);
    expect(result.returnValue.aggregate).toEqual([]);
  });
});
