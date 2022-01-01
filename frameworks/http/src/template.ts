import { AnyObject } from '@kraftr/common';
import { Binding, BindingScope, BindingTags } from '@kraftr/core';
import { HTTPMethod } from './composition/utils';
import { RestMiddlewareGroups } from './sequence/sequence';
import { RestTags } from './tags';

export namespace RestTemplates {
  export namespace Sequence {
    export const FIND_ROUTE = (binding: Binding<unknown, AnyObject>) =>
      binding
        .tag('extensionFor', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.FIND_ROUTE)
        .in(BindingScope.SERVER)
        .constant();
    export const SEND_RESPONSE = (binding: Binding<unknown, AnyObject>) =>
      binding
        .tag('extensionFor', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.SEND_RESPONSE)
        .in(BindingScope.SERVER)
        .constant();
    export const PARSE_REQUEST = (binding: Binding<unknown, AnyObject>) =>
      binding
        .tag('extensionFor', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.PARSE_REQUEST)
        .in(BindingScope.SERVER)
        .constant();
    export const SERIALIZER_FINDER = (binding: Binding<unknown, AnyObject>) =>
      binding
        .tag('extensionFor', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.SERIALIZER_FINDER)
        .in(BindingScope.SERVER)
        .constant();
    export const INVOKE = (binding: Binding<unknown, AnyObject>) =>
      binding
        .tag('extensionFor', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.INVOKE)
        .in(BindingScope.SERVER)
        .constant();
  }
}

export const controllerTemplate = (bind: Binding<unknown, AnyObject>) =>
  bind
    .tag('controller')
    .tag('method', 'GET' as HTTPMethod)
    .tag('path', '');

export type ControllerTags = {
  controller: true;
  method: string;
  path: string;
  parameters: { name: string; in: string }[];
};
