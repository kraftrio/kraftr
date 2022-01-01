/* c8 ignore start */
import { BindingKey, Context, Metadata, Sequence } from '@kraftr/core';
import { HTTPVersion, Instance } from 'find-my-way';
import { IncomingMessage, RequestListener, Server, ServerResponse } from 'node:http';
import { Duplex as DuplexStream } from 'node:stream';
import { URL } from 'node:url';
import { ControllerTags } from './template';
import { HttpHeaders } from './types';

export namespace RestBindings {
  export namespace Server {
    export const INSTANCE = BindingKey.create<Server>(
      'server.rest.bindings.server.instance'
    );

    export const HANDLER = BindingKey.create<RequestListener>(
      'server.rest.bindings.server.handler'
    );
    export const SEQUENCE = BindingKey.create<Sequence<void>>(
      'server.rest.request-handler.sequence'
    );
    export const ROUTER = BindingKey.create<Instance<HTTPVersion.V2>>(
      'server.rest.bindings.server.router'
    );
  }
  export namespace Http {
    export const REQUEST = BindingKey.create<IncomingMessage>(
      'server.rest.bindings.http.request'
    );
    export const RESPONSE = BindingKey.create<ServerResponse>(
      'server.rest.bindings.http.response'
    );
    export const HEADERS = BindingKey.create<HttpHeaders>(
      'server.rest.bindings.http.headers'
    );
    export const URL = BindingKey.create<URL>('server.rest.bindings.http.url');
    export const PARAMS = BindingKey.create<Record<string, string | undefined>>(
      'server.rest.operation.params'
    );
    export const CONTEXT = BindingKey.create<Context>(
      'server.rest.bindings.http.context'
    );
  }
  export namespace Sequences {}

  export namespace Operation {
    export const RESPONSE_STREAM = BindingKey.create<
      DuplexStream | AsyncIterable<unknown> | Iterable<unknown>
    >('server.rest.operation.returnValue');
    export const HANDLER = BindingKey.create<() => unknown>(
      'server.rest.operation.handler'
    );
  }
}

export namespace RestMetadata {
  export const CONTROLLER =
    BindingKey.create<Metadata<ControllerTags>>('rest.meta.controller');
}

export namespace RestConfig {
  export const SUPPORTED_HEADERS = BindingKey.create<string[]>(
    'server.rest.config.server.supported-headers'
  );

  export const SUPPORTED_METHODS = BindingKey.create<string[]>(
    'server.rest.config.server.supported-headers'
  );
}

/* c8 ignore stop */
