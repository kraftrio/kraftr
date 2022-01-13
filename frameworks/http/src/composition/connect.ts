import { NextHandleFunction } from 'connect';
import { BindingScope, inject, Middleware, provide } from '@kraftr/core';
import { RestMiddlewareGroups } from '../sequence';
import { HttpBindings } from '../bindings';
import { HttpTags } from '../tags';

let count = 0;
export function useConnect(group: string, middleware: NextHandleFunction) {
  provide<Middleware<void>>(`rest.middleware.connect-${count++}`)
    .in(BindingScope.APPLICATION)
    .tag('extensionFor', HttpTags.REST_SEQUENCE)
    .tag('group', group)
    .tag('downstream', [RestMiddlewareGroups.SEND_RESPONSE])
    .with(async (_, next) => {
      const req = inject(HttpBindings.Request.INSTANCE);
      const res = inject(HttpBindings.Response.INSTANCE);
      let promise: Promise<void> | undefined;
      middleware(req, res, () => {
        promise = next();
      });
      return promise;
    });
}
