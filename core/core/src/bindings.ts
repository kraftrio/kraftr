import { BindingKey } from '@kraftr/context';
import { Sequence } from '@kraftr/sequence';

export namespace AppBindings {
  export const APP_SEQUENCE = BindingKey.create<Sequence<void>>(
    'core.application.bindings.app.sequence'
  );
}
