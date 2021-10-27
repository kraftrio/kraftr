import { tests } from '@kraftr/sequence';
import { QueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';
import { projectionTransformer } from '../../src/transformers';

describe('projectionTransformer', () => {
  it('transform an fields operator', async () => {
    const query: QueryBuilder = { query: { fields: ['+name'] }, aggregate: [] };
    const result = await tests.testSequence(projectionTransformer, query);

    expect(result.nextValue.aggregate).toEqual([{ $project: { name: true } }]);
    expect(result.returnValue.aggregate).toEqual([{ $project: { name: true } }]);
  });

  it('dont modify the original query', async () => {
    const query: QueryBuilder = { query: { fields: ['+name'] }, aggregate: [] };
    const result = await tests.testSequence(projectionTransformer, query);

    expect(result.nextValue.query).toEqual({ fields: ['+name'] });
    expect(result.returnValue.query).toEqual({ fields: ['+name'] });
  });

  it('Dont add unnecessary projection if not provided', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(projectionTransformer, query);
    expect(result.nextValue.query).toEqual({});
    expect(result.nextValue.aggregate).toEqual([]);
    expect(result.returnValue.aggregate).toEqual([]);
  });
});
