import express from 'express';

express()
  .get(
    '/status',
    // endpoint
    (_, res) => res.end('ok')
  )
  .listen(3000);
