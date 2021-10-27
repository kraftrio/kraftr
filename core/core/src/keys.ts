import { BindingKey } from '@kraftr/context';
import { Sequence } from '.';

export namespace CoreBindings {
  export const APP_NAME = BindingKey.create<string>('kraftr.core.app-name');
  export const APP_INPUT = BindingKey.create<unknown[]>('kraftr.core.input');
  export const APP_SEQUENCE = BindingKey.create<Sequence<void>>('kraftr.core.sequence');
}
