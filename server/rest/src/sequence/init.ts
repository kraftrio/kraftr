import { CoreBindings, inject, Middleware, provide } from '@kraftr/core';
import { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { RestBindings } from '../bindings';
import { RestScope } from '../scopes';
import { MIMEType } from '../utils/mimetype';

export const initSequence: Middleware<void> = async (_, next) => {
  const [request, response] = inject<[IncomingMessage, ServerResponse]>(
    CoreBindings.APP_INPUT
  );

  provide(RestBindings.Operation.RETURN_VALUE).with(() => undefined);

  const contentType = new MIMEType(request.headers['content-type'] ?? 'application/json');
  const acceptTypes = request.headers.accept ?? 'application/json';
  const accept = acceptTypes.split(',').map((type) => new MIMEType(type));
  const url = new URL(request.url!, `http://${request.headers.host}`);

  provide(RestBindings.Http.URL).in(RestScope.REQUEST).constant().with(url);

  provide(RestBindings.Http.HEADERS).in(RestScope.REQUEST).constant().with({
    contentType,
    accept
  });

  provide(RestBindings.Http.REQUEST).in(RestScope.REQUEST).constant().with(request);
  provide(RestBindings.Http.RESPONSE).in(RestScope.REQUEST).constant().with(response);

  return next();
};
