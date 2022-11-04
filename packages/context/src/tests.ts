import { beforeEach, afterEach } from 'vitest';
import { closeContext, Context, openContext } from './context';

export function runInContext(scope?: string) {
  const internal: { context: Context } = { context: new Context() };
  beforeEach(() => {
    internal.context = openContext();
    internal.context.name = 'runInContext';
    if (scope) {
      internal.context.scope = scope;
    }
  });
  afterEach(() => closeContext());

  return internal as { readonly context: Context };
}
