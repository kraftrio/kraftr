import { BindingKey } from '@kraftr/core';

export namespace CoreBindings {
  export const APP_NAME = BindingKey.create<string>('Default');
}
