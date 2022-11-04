import express from 'express';

express()
  .get(
    '/status',
    // endpoint
    (_, res) => res.json({ status: 'ok' })
  )
  .listen(3000);
