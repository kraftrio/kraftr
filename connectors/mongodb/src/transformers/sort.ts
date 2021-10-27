import { SequenceFn } from '@kraftr/sequence';
import { QueryBuilder } from '../builder';

const debug = require('debug')('kraftr:connectors:mongodb:transformers:sort');

export const sortTransformer: SequenceFn<QueryBuilder> = (builder, next) => {
  const sort = builder.query.sort;

  const transformString = (value: string) => {
    const [op, key] = [value[0], value.slice(1)];
    return { [key!]: op === '+' ? 1 : -1 };
  };

  const joinArrayObject = (arr: Record<string, number>[]) => {
    return arr.reduce((acc, obj) => Object.assign(acc, obj), {});
  };

  if (typeof sort === 'string') {
    builder.aggregate.push({ $sort: transformString(sort) });
  }

  if (Array.isArray(sort) && sort.length > 0) {
    builder.aggregate.push({ $sort: joinArrayObject(sort.map(transformString)) });
  }

  return next(builder);
};
