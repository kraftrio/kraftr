/* c8 ignore start */
import { BindingKey, Context, Sequence, Metadata } from '@kraftr/core';
import { HTTPVersion, Instance } from 'find-my-way';
import { IncomingMessage, Server, ServerResponse } from 'node:http';
import { PassThrough } from 'node:stream';
import { URL } from 'node:url';
import { ControllerTags } from './template';
import { HttpHeaders } from './types';

export namespace HttpBindings {
  export namespace Server {
    export const INSTANCE = BindingKey.create<Server>(
      'kraftr.http-framework.bindings.server.instance'
    );
    export const SEQUENCE = BindingKey.create<Sequence<void>>(
      'kraftr.http-framework.bindings.server.sequence'
    );
    export const ROUTER = BindingKey.create<Instance<HTTPVersion.V2>>(
      'kraftr.http-framework.bindings.server.router'
    );
  }
  export namespace Request {
    export const INSTANCE = BindingKey.create<IncomingMessage>(
      'kraftr.http-framework.bindings.request.instance'
    );
    // http objects

    // parsed objects
    export const HEADERS = BindingKey.create<HttpHeaders>(
      'kraftr.http-framework.bindings.request.headers'
    );
    export const URL = BindingKey.create<URL>(
      'kraftr.http-framework.bindings.request.url'
    );
    export const PARAMS = BindingKey.create<Record<string, string | undefined>>(
      'kraftr.http-framework.bindings.request.params'
    );
  }

  export namespace Response {
    // http objects
    export const INSTANCE = BindingKey.create<ServerResponse>(
      'kraftr.http-framework.bindings.response.instance'
    );
    export const STREAM = BindingKey.create<PassThrough>(
      'kraftr.http-framework.bindings.response.stream'
    );
  }

  export namespace Operation {
    export const CONTEXT = BindingKey.create<Context>(
      'kraftr.http-framework.bindings.http.context'
    );
    export const HANDLER = BindingKey.create<() => unknown>(
      'kraftr.http-framework.operation.handler'
    );
  }
}

export namespace HttpMetadata {
  export const CONTROLLER =
    BindingKey.create<Metadata<ControllerTags>>('rest.meta.controller');
}

/* c8 ignore stop */
