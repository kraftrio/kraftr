import { NextHandleFunction } from 'connect';
import { BindingScope, inject, Middleware, provide } from '@kraftr/core';
import { RestMiddlewareGroups } from '../sequence';
import { RestTags } from '../tags';
import { RestBindings } from '../bindings';

let count = 0;
export function useConnect(group: string, middleware: NextHandleFunction) {
  provide<Middleware<void>>(`rest.middleware.connect-${count++}`)
    .in(BindingScope.APPLICATION)
    .tag('chain', RestTags.REST_SEQUENCE)
    .tag('group', group)
    .tag('downstream', [RestMiddlewareGroups.SEND_RESPONSE])
    .with(async (_, next) => {
      const req = inject(RestBindings.Http.REQUEST);
      const res = inject(RestBindings.Http.RESPONSE);
      let promise: Promise<void> | undefined;
      middleware(req, res, () => {
        promise = next();
      });
      return promise;
    });
}
