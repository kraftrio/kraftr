import polka from 'polka';

polka()
  .get('/status', (_, res) => res.end('ok'))
  .listen(3000);
