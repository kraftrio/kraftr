import { BindingKey } from '@kraftr/context';
import type { Sequence } from '@kraftr/sequence';

export namespace CoreBindings {
  export const APP_NAME = BindingKey.create<string>('kraftr.core.binding-keys.app-name');
  export const APP_INPUT = BindingKey.create<unknown[]>(
    'kraftr.core.binding-keys.app-input'
  );
  export const APP_SEQUENCE = BindingKey.create<Sequence<void>>(
    'kraftr.core.binding-keys.app-sequence'
  );
  export const EVENT_PROCESSOR = BindingKey.create<Sequence<void>>(
    'kraftr.core.binding-keys.event-processor'
  );
}
