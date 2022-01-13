import { Middleware } from '@kraftr/core';

export const serializerFinder: Middleware<void> = async (data, next) => {
  // const { contentType } = inject(RestBindings.Http.HEADERS);
  // const req = inject(RestBindings.Http.REQUEST);
  // if (contentType.subtype === 'json') {
  //   const transformed = json.deserialize(req);
  //   provide(RestBindings.Http.BODY).with(transformed);
  // }

  // await next();

  // const returnValue = inject(RestBindings.Operation.RESPONSE_STREAM);

  // provide(RestBindings.Operation.RESPONSE_STREAM).with(json.serialize(returnValue));

  return next();
};
