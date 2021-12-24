/* c8 ignore start */
import { BindingKey, Context, Metadata, Middleware, Sequence } from '@kraftr/core';
import { StartupData } from '@kraftr/core/dist/types';
import { IncomingMessage, RequestListener, Server, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import { URL } from 'node:url';
import type { Router } from './router';
import { ControllerTags } from './template';
import { HttpHeaders } from './types';

export type ReturnValue = unknown;

export namespace RestBindings {
  export namespace Server {
    export const INSTANCE = BindingKey.create<Server>(
      'server.rest.bindings.server.instance'
    );

    export const HANDLER = BindingKey.create<RequestListener>(
      'server.rest.bindings.server.handler'
    );

    export const ROUTER = BindingKey.create<Router>('server.rest.bindings.server.router');
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
    export const PARAMS = BindingKey.create<Record<string, string>>(
      'server.rest.operation.params'
    );
    export const BODY = BindingKey.create<Readable>(
      'server.rest.operation.body' // key
    );
    export const CONTEXT = BindingKey.create<Context>(
      'server.rest.bindings.http.context'
    );
  }
  export namespace Sequences {}

  export namespace Operation {
    export const RETURN_VALUE = BindingKey.create<ReturnValue>(
      'server.rest.operation.returnValue'
    );
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

export namespace ReqHandlerBindings {
  export const SEQUENCE = BindingKey.create<Sequence<StartupData>>(
    'server.rest.request-handler.sequence'
  );

  export const SENDER = BindingKey.create<Middleware<StartupData>>(
    'server.rest.request-handler.sender'
  );

  export const INIT = BindingKey.create<Middleware<StartupData>>(
    'server.rest.request-handler.init-request'
  );
  export const FIND_ROUTE = BindingKey.create<Middleware<StartupData>>(
    'server.rest.request-handler.find-method'
  );
  export const INVOKE = BindingKey.create<Middleware<StartupData>>(
    'server.rest.request-handler.invoke'
  );
  export const SERIALIZER_FINDER = BindingKey.create<Sequence<StartupData>>(
    'server.rest.request-handler.serializer-finder'
  );
  export const SERIALIZER = BindingKey.create<Sequence<StartupData>>(
    'server.rest.request-handler.serializer-finder'
  );
}
/* c8 ignore stop */
