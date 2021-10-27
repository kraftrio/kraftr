import * as express from 'express';
import { BindingKey, Context } from '@kraftr/core';

export namespace RestBindings {
  export namespace Server {
    export const INSTANCE = BindingKey.create<express.Application>(
      'server.rest.bindings.server.instance'
    );

    export const HANDLER = BindingKey.create<express.Application>(
      'server.rest.bindings.server.handler'
    );
  }
  export namespace Http {
    export const REQUEST = BindingKey.create<express.Request>(
      'server.rest.bindings.http.request'
    );
    export const RESPONSE = BindingKey.create<express.Response>(
      'server.rest.bindings.http.response'
    );
    export const CONTEXT = BindingKey.create<Context>(
      'server.rest.bindings.http.context'
    );
  }
  export namespace Sequences {}
}

export namespace RestConfig {
  export const SUPPORTED_HEADERS = BindingKey.create<string[]>(
    'server.rest.config.server.supported-headers'
  );

  export const SUPPORTED_METHODS = BindingKey.create<string[]>(
    'server.rest.config.server.supported-headers'
  );
}
