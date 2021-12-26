import { inject, Middleware } from '@kraftr/core';
import { RestBindings } from '..';
import { jsonSerializer } from '../serializers/json';

export const serializerFinder: Middleware<void> = async (data, next) => {
  const { contentType } = inject(RestBindings.Http.HEADERS);
  if (contentType.subtype === 'json') {
    return jsonSerializer(data, next);
  }

  return next();
};
