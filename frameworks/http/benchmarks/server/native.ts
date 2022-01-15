import http from 'node:http';

http
  .createServer((req, res) => {
    if (req.url === '/status') return res.end('ok');
  })
  .listen(3000);
