import {
  createApp,
  createListener,
  definePath,
  HttpComponent,
  useComponent,
  useController
} from '@kraftr/http-framework';

function helloWorld() {
  definePath('*');

  return () => {
    return 'Hello world!';
  };
}

export const app = createApp(() => {
  useComponent(HttpComponent);

  useController(helloWorld);
});

export default createListener(app);
