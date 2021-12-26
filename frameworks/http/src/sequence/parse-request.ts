import { inject, Middleware, provide } from '@kraftr/core';
import { URL } from 'node:url';
import { RestBindings } from '../bindings';
import { HttpResponse } from '../http-errors';
import { RestScope } from '../scopes';
import { MIMEType } from '../utils/mimetype';

export const parseRequest: Middleware<void> = async (_, next) => {
  const request = inject(RestBindings.Http.REQUEST);
  provide(RestBindings.Operation.RETURN_VALUE).with(undefined);

  const contentType = MIMEType.parse(
    request.headers['content-type'] ?? 'application/json'
  );
  const acceptTypes = request.headers.accept ?? 'application/json';
  const acceptValues = acceptTypes.split(',');
  const accept: MIMEType[] =
    acceptValues.length === 0 ? [new MIMEType('application/json')] : [];

  if (contentType === null) {
    // eslint-disable-next-line @kraftr/returns-throw
    throw HttpResponse.UnsupportedMediaType();
  }

  for (const acceptValue of acceptValues) {
    const value = MIMEType.parse(acceptValue);
    if (!value) {
      // eslint-disable-next-line @kraftr/returns-throw
      throw HttpResponse.NotAcceptable().body(`Error parsing ${acceptValue}`);
    }
    accept.push(value);
  }

  const url = new URL(request.url!, `http://${request.headers.host}`);

  provide(RestBindings.Http.URL).in(RestScope.REQUEST).constant().with(url);

  provide(RestBindings.Http.HEADERS).in(RestScope.REQUEST).constant().with({
    contentType,
    accept
  });

  return next();
};
