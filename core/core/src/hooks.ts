import { BindingScope, Context, provide, useContext } from '@kraftr/context';
import { isPromise } from 'node:util/types';
import { CoreBindings } from './binding-keys';
import { AppSequence } from './sequence';
import { Return } from '@kraftr/errors';
import { PErrorComponent } from './pretty-error';

const install = Symbol();

export type Component = {
  [install]: () => Promise<void> | void;
};

export function component(fn: () => void | Promise<void>): Return<Component, Error>;
export function component<T>(
  obj: T,
  fn: () => void | Promise<void>
): Return<T & Component, Error>;
export function component(obj: unknown, fn?: () => void | Promise<void>) {
  if (fn) {
    if (obj !== undefined && obj !== null) return Object.assign(obj, { [install]: fn });

    throw new TypeError('param must be an object');
  } else if (typeof obj === 'function') {
    return { [install]: obj };
  }
  throw new TypeError('fn should be callable');
}

export function useComponent(component: Component): void {
  const result = component[install];
  if (isPromise(result)) {
    result.then(() => {}).catch(() => {});
  }
}

export function createApp(fn: () => void) {
  let appContext = new Context('Application');

  appContext.scope = BindingScope.APPLICATION;
  appContext.name = 'Application';

  useContext(appContext, function application() {
    useComponent(PErrorComponent);
    provide(CoreBindings.APP_NAME).with('Application');
    provide(CoreBindings.APP_SEQUENCE).in(BindingScope.SERVER).with(AppSequence).class();
    fn();
  });

  return appContext;
}
