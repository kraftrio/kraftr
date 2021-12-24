import { Sequence } from '@kraftr/core';
import { RestTags } from '../tags';

export namespace RestMiddlewareGroups {
  export const INIT = 'init';
  export const SEND_RESPONSE = 'send-response';
  export const SERIALIZER = 'serializer';
  export const FIND_ROUTE = 'find-route';
  export const INVOKE = 'invoke';
}

export class RestSequence extends Sequence<void> {
  override readonly chain = RestTags.REST_SEQUENCE;
  override groups = [
    RestMiddlewareGroups.INIT,
    RestMiddlewareGroups.SEND_RESPONSE,
    RestMiddlewareGroups.SERIALIZER,
    RestMiddlewareGroups.FIND_ROUTE,
    RestMiddlewareGroups.INVOKE
  ];
}
