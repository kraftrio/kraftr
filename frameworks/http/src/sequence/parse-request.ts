import { inject, Middleware, provide } from '@kraftr/core';
import { URL } from 'node:url';
import { HttpBindings } from '../bindings';
import { HttpException } from '../http-errors';
import { HttpScope } from '../scopes';
import { MIMEType } from '../utils/mimetype';

export const parseRequest: Middleware<void> = async (_, next) => {
  const request = inject(HttpBindings.Request.INSTANCE);

  const contentType = MIMEType.parse(
    request.headers['content-type'] ?? 'application/json'
  );
  const acceptTypes = request.headers.accept ?? 'application/json';
  const acceptValues = acceptTypes.split(',');
  const accept: MIMEType[] =
    acceptValues.length === 0 ? [new MIMEType('application/json')] : [];

  if (contentType === null) {
    // eslint-disable-next-line @kraftr/returns-throw
    throw new HttpException.UnsupportedMediaType();
  }

  for (const acceptValue of acceptValues) {
    const value = MIMEType.parse(acceptValue);
    if (!value) {
      // eslint-disable-next-line @kraftr/returns-throw
      throw new HttpException.NotAcceptable();
    }
    accept.push(value);
  }

  const url = new URL(request.url!, `http://${request.headers.host}`);

  provide(HttpBindings.Request.URL).in(HttpScope.REQUEST).constant().with(url);

  provide(HttpBindings.Request.HEADERS).in(HttpScope.REQUEST).constant().with({
    contentType,
    accept
  });

  return next();
};
