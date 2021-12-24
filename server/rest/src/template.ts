import { Binding, BindingScope, BindingTags } from '@kraftr/core';
import { HTTPMethod } from './hooks/utils';
import { RestMiddlewareGroups } from './sequence/sequence';
import { RestTags } from './tags';

export namespace RestTemplates {
  export namespace Sequence {
    export const FIND_ROUTE = (binding: Binding) =>
      binding
        .tag('chain', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.FIND_ROUTE)
        .in(BindingScope.SERVER)
        .constant();
    export const SEND_RESPONSE = (binding: Binding) =>
      binding
        .tag('chain', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.SEND_RESPONSE)
        .in(BindingScope.SERVER)
        .constant();
    export const SERIALIZER = (binding: Binding) =>
      binding
        .tag('chain', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.SERIALIZER)
        .in(BindingScope.SERVER)
        .constant();
    export const INVOKE = (binding: Binding) =>
      binding
        .tag('chain', RestTags.REST_SEQUENCE)
        .tag('group', RestMiddlewareGroups.INVOKE)
        .in(BindingScope.SERVER)
        .constant();
  }
}

export const controllerTemplate = (bind: Binding) =>
  bind
    .tag('controller')
    .tag('method', 'GET' as HTTPMethod)
    .tag('path', '');

export type ControllerTags = BindingTags<ReturnType<typeof controllerTemplate>>;
