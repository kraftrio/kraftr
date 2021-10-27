import { createApp, inject } from '../../src';
import { CoreBindings } from '../../src/keys';

describe('createApp', () => {
  it('has a default app name', () => {
    createApp(() => {
      const appName = inject(CoreBindings.APP_NAME);
      expect(appName).toBe('kraftr App');
    });
  });
});
