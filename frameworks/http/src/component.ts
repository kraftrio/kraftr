/* c8 ignore start */
import { BindingScope, component, filterByTag, inject, provide } from '@kraftr/core';
import Router, { HTTPMethod, HTTPVersion } from 'find-my-way';
import { PassThrough } from 'node:stream';
import { HttpBindings } from './bindings';
import { HttpScope } from './scopes';
import {
  findRoute,
  HttpSequence,
  invokeMiddleware,
  parseRequest,
  RestMiddlewareGroups,
  sendResponse,
  serializerFinder
} from './sequence';
import { RestTemplates } from './template';

export const HttpComponent = component(() => {
  provide(HttpBindings.Server.SEQUENCE)
    .class()
    .in(BindingScope.SERVER)
    .with(HttpSequence);

  provide(RestMiddlewareGroups.SEND_RESPONSE)
    .apply(RestTemplates.Sequence.SEND_RESPONSE)
    .with(sendResponse);

  provide(RestMiddlewareGroups.PARSE_REQUEST)
    .apply(RestTemplates.Sequence.PARSE_REQUEST)
    .with(parseRequest);

  provide(RestMiddlewareGroups.SERIALIZER_FINDER)
    .apply(RestTemplates.Sequence.SERIALIZER_FINDER)
    .with(serializerFinder);

  provide(RestMiddlewareGroups.FIND_ROUTE)
    .apply(RestTemplates.Sequence.FIND_ROUTE)
    .with(findRoute);

  provide(RestMiddlewareGroups.INVOKE)
    .apply(RestTemplates.Sequence.INVOKE)
    .with(invokeMiddleware);

  provide(HttpBindings.Response.STREAM)
    .in(HttpScope.REQUEST)
    .with(() => new PassThrough({ objectMode: true }))
    .dynamic();

  provide(HttpBindings.Server.ROUTER)
    .dynamic()
    .in(BindingScope.SERVER)
    .with(() => {
      const router = Router<HTTPVersion.V2>();
      const ctx = inject.context();
      const binds = ctx.find(
        filterByTag<{ controller: true; path: string; method: string }>({
          controller: true
        })
      );

      for (const bind of binds) {
        const method = bind.tagMap?.get('method');
        const path = bind.tagMap?.get('path');

        router.on(method as HTTPMethod, path!, () => bind.key);
      }
      return router;
    });
});
/* c8 ignore stop */
