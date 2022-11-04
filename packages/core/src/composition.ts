import { BindingScope, Context, provide, useContext } from '@kraftr/context';

import { isPromise } from 'node:util/types';
import { CoreBindings } from './binding-keys';

export function createApp(fn: () => Promise<void>): Promise<Context>;
export function createApp(fn: () => void): Context;
export function createApp(fn: () => void | Promise<void>): Context | Promise<Context> {
  let appContext = new Context('Application');

  appContext.scope = BindingScope.APPLICATION;
  appContext.name = 'Application';

  const result = useContext(appContext, function application() {
    provide(CoreBindings.APP_NAME).with('Application');
    return fn();
  });

  if (isPromise(result)) {
    return result.then(() => appContext);
  }

  return appContext;
}
