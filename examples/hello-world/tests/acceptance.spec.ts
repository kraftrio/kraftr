import { createServer } from 'node:http';
import { makeFetch } from 'supertest-fetch';
import { test } from 'vitest';
import listener from '../src/app';

test('hello world', async () => {
  const fetch = makeFetch(createServer(listener));

  await fetch('/hello-world').expect(200, 'Hello world!');
  await fetch('/endpoint').expect(200, 'Hello world!');
  await fetch('/another-endpoint').expect(200, 'Hello world!');
  await fetch('/hello', { method: 'POST' }).expect(404);
});
