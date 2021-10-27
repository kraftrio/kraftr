import { SequenceFn } from '@kraftr/sequence';
import { QueryBuilder } from '../builder';
import { Types } from 'mongoose';
import { DataValidationError } from '@kraftr/repository';
const debug = require('debug')('kraftr:connectors:mongodb:transformers:corcer');

export const coercerTransformer: SequenceFn<QueryBuilder> = (builder, next) => {
  if (!builder.query.where) return next(builder);
  const copyBuilder = JSON.parse(JSON.stringify(builder));
  const query = copyBuilder.query.where;

  if ('_id' in query) {
    try {
      query['_id'] = new Types.ObjectId(query['_id']);
    } catch (error) {
      throw new DataValidationError(
        'Id passed in must be a string of 12 bytes or a string of 24 hex characters'
      );
    }
  }

  return next(copyBuilder);
};
