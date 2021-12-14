import { Context, useContext, provide, BindingScope } from '@kraftr/context';
import { createSequence, Sequence } from '@kraftr/sequence';
import { CoreBindings } from './binding-keys';
import { StartupData } from './types';

export type Plugin = {
  install: () => void;
};

export function usePlugin(plugin: Plugin): void {
  plugin.install();
}
export type Application = {
  restart: () => void;
  middleware: (...input: unknown[]) => void;
};
export function createApp(fn: () => void): Application {
  let appContext: Context;
  let appSequence: Sequence<StartupData>;

  const init = () => {
    appContext = new Context();
    appSequence = createSequence(CoreBindings.APP_SEQUENCE);
    useContext(appContext, function application() {
      // usePlugin(PrettyErrorPlugin);
      provide(CoreBindings.APP_NAME).with('kraftr App');
      provide(CoreBindings.APP_SEQUENCE)
        .in(BindingScope.APPLICATION)
        .with(appSequence)
        .constant();
      fn();
    });
  };

  init();

  return {
    restart: init,
    middleware: (...input: unknown[]) =>
      useContext(appContext, function inputHandler() {
        provide(CoreBindings.APP_INPUT).with(input);

        return appSequence.execute({ appContext });
      })
  };
}
