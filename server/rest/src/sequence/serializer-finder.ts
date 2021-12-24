import { BindingKey, inject, Middleware, provide } from '@kraftr/core';
import { StartupData } from '@kraftr/core/dist/types';
import destr from 'destr';
import { Transform } from 'node:stream';
import { ReqHandlerBindings } from '..';
import { RestBindings } from '../bindings';
import { useHeaders } from '../hooks/headers';
import { HttpResponse } from '../http-errors';
import { jsonSerializer } from '../serializers/json';

export namespace Serializers {
  export const JSON = BindingKey.create<Middleware<StartupData>>(
    'server.rest.request-handler.serializers.json'
  );
}

export const serializerFinderSequence: Middleware<StartupData> = async (ctx, next) => {
  const sequence = inject(ReqHandlerBindings.SEQUENCE);
  provide('serializer').with(jsonSerializer);
  return next(ctx);
};
