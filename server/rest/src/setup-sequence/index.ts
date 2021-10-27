import { BindingKey, Context, createSequence, Sequence, SequenceFn } from '@kraftr/core';
import { registerControllers } from './handler';
import { initServer } from './init';

export namespace SetupServerBindings {
  export const SEQUENCE = BindingKey.create<Sequence<Context>>(
    'server.rest.setup-sequence.sequence'
  );
  export const INIT_SERVER = BindingKey.create<SequenceFn<Context>>(
    'server.rest.setup-sequence.init'
  );
  export const REGISTER_CONTROLLERS = BindingKey.create<SequenceFn<Context>>(
    'server.rest.setup-sequence.register'
  );
}

export const SetupSequence = createSequence<Context>(SetupServerBindings.SEQUENCE).build([
  {
    group: SetupServerBindings.INIT_SERVER,
    ex: initServer
  },
  {
    group: SetupServerBindings.REGISTER_CONTROLLERS,
    ex: registerControllers
  }
]);
