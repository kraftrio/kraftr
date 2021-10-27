import { coercerTransformer } from '../../src/transformers';
import { tests } from '@kraftr/sequence/';
import { QueryBuilder } from '../../src/builder';
import { Filter } from '@kraftr/model';
import { Types } from 'mongoose';
import { DataValidationError } from '@kraftr/repository';

const objectId = new Types.ObjectId();

describe('coercerTransformer', () => {
  it('transform _id to object id', async () => {
    const query: QueryBuilder = {
      query: { where: { _id: objectId.toHexString() } },
      aggregate: []
    };
    const result = await tests.testSequence(coercerTransformer, query);
    const where = result.nextValue.query.where;

    expect(where?.['_id']).toBeInstanceOf(Types.ObjectId);
  });

  it('check the original query is not modified', async () => {
    const query = { where: { _id: objectId.toHexString() } };

    const queryBuilder: QueryBuilder = { query, aggregate: [] };
    const result = await tests.testSequence(coercerTransformer, queryBuilder);
    const where = result.nextValue.query.where;
    expect(where?.['_id']).toBeInstanceOf(Types.ObjectId);
    expect(query.where['_id']).toBe(objectId.toHexString());
  });

  it('throw DataValidationError when _id cannot be converted to object id', async () => {
    const query = { where: { _id: ',.paeuouaoe' } };

    const queryBuilder: QueryBuilder = { query, aggregate: [] };
    const fn = tests.testSequence(coercerTransformer, queryBuilder);

    expect(fn).rejects.toThrowError(DataValidationError);
  });

  it('ignore works when where is undefined ', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(coercerTransformer, query);

    expect(result.nextValue.query).toEqual({});
  });

  it('dont modify the original query', async () => {
    const query: QueryBuilder = { query: { where: { name: 'testName' } }, aggregate: [] };
    const result = await tests.testSequence(coercerTransformer, query);

    expect(result.nextValue.query).toEqual({ where: { name: 'testName' } });
    expect(result.returnValue.query).toEqual({ where: { name: 'testName' } });
  });

  it('dont add unnecessary sort if not provided', async () => {
    const query: QueryBuilder = { query: {} as Filter, aggregate: [] };
    const result = await tests.testSequence(coercerTransformer, query);
    expect(result.nextValue.query).toEqual({});
    expect(result.nextValue.aggregate).toEqual([]);
    expect(result.returnValue.aggregate).toEqual([]);
  });
});
