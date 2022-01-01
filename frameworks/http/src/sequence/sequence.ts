import { Sequence } from '@kraftr/core';
import { RestTags } from '../tags';

export namespace RestMiddlewareGroups {
  export const SEND_RESPONSE = 'send-response';
  export const PARSE_REQUEST = 'parse-request';
  export const SERIALIZER_FINDER = 'serializer-finder';
  export const FIND_ROUTE = 'find-route';
  export const INVOKE = 'invoke';
}

export class HttpSequence extends Sequence<void> {
  override readonly chain = RestTags.REST_SEQUENCE;
  override groups = [
    RestMiddlewareGroups.SEND_RESPONSE,
    RestMiddlewareGroups.PARSE_REQUEST,
    RestMiddlewareGroups.FIND_ROUTE,
    RestMiddlewareGroups.SERIALIZER_FINDER,
    RestMiddlewareGroups.INVOKE
  ];
}
