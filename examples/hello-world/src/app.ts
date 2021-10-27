import { BindingAddress, createApp, inject } from '@kraftr/core';
import { CoreBindings } from '@kraftr/core/src/keys';
import { IncomingMessage, ServerResponse } from 'node:http';

export default createApp(function main() {
  const app = inject(CoreBindings.APP_SEQUENCE);

  app.add({
    group: 'test',
    ex: (_, next) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [__, res] = inject(
        CoreBindings.APP_INPUT as BindingAddress<[IncomingMessage, ServerResponse]>
      );
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.writable;
      res.write('[');
      return new Promise(() => {
        const int = setInterval(() => {
          res.write(JSON.stringify({ name: 'hello' }));
          res.write(',');
        }, 500);
        setTimeout(() => {
          clearInterval(int);
          res.write(JSON.stringify({ name: 'hello' }));

          res.write(']');
          res.end();
        }, 10_000);
      });
    }
  });
});
