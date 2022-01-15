import { createApp, useComponent } from '@kraftr/core';
import { makeFetch } from 'supertest-fetch';
import { expect, it } from 'vitest';
import { controller, createServer, defineBody, definePath, useController } from '../src';
import { HttpComponent } from '../src/component';

type User = { name: string };

it('returns 404 when route is not found', async () => {
  const app = createApp(() => {
    useComponent(HttpComponent);
  });
  const server = createServer(app);
  const fetch = makeFetch(server);
  await fetch('/missing-route').expect(404);
}, 20);

it('call with GET to an existing endpoint and returns 200', async () => {
  const getUsers = controller(() => {
    definePath('/users');

    return () => [{ name: 'Carlos' }];
  });

  const app = createApp(() => {
    useController(getUsers);
    useComponent(HttpComponent);
  });

  const server = createServer(app);
  const fetch = makeFetch(server);

  await fetch('/users?name=Carlos', {
    headers: {
      accept: 'application/json'
    }
  }).expect(200, [{ name: 'Carlos' }]);

  await fetch('/users', {
    method: 'POST',
    body: JSON.stringify({ name: 'NoName' })
  }).expect(404);
}, 200);

it('call GET to an existing endpoint with querystring and hash', async () => {
  const getUsers = controller(() => {
    definePath('/users/');

    return () => [{ name: 'Carlos' }];
  });

  const app = createApp(() => {
    useComponent(HttpComponent);
    useController(getUsers);
  });

  const server = createServer(app);

  const fetch = makeFetch(server);
  await fetch('/users/#site?name=Carlos', {
    headers: {
      accept: 'application/json'
    }
  }).expect(200);
}, 20);

it('make a post request with a body', async () => {
  const db: User[] = [];
  const createUser = controller(() => {
    definePath('POST', '/users');
    const body = defineBody<User>();

    return async () => {
      const user = await body.value;

      db.push(user);
      return user;
    };
  });

  const app = createApp(() => {
    useComponent(HttpComponent);
    useController(createUser);
  });

  const server = createServer(app);

  const fetch = makeFetch(server);

  const result = await fetch('/users', {
    method: 'POST',
    body: JSON.stringify({ name: 'Jose' }),
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    }
  });

  expect(await result.json()).toEqual({
    name: 'Jose'
  });
  expect(result.status).toEqual(200);

  expect(db).toEqual([{ name: 'Jose' }]);
}, 20);

it('make a post request with a invalid body', async () => {
  const db: User[] = [];
  const createUser = controller(() => {
    definePath('POST', '/users');
    const body = defineBody<User>();

    return async () => {
      const user = await body.value;

      db.push(user);
      return user;
    };
  });

  const app = createApp(() => {
    useComponent(HttpComponent);
    useController(createUser);
  });

  const server = createServer(app);

  const fetch = makeFetch(server);
  await fetch('/users', {
    method: 'POST',
    body: `{ "name" "Jose" }`,
    headers: { 'Content-Type': 'application/json' }
  }).expect(422);
}, 20);

it('handle internal errors as 500', async () => {
  const createUser = controller(() => {
    definePath('/users');
    const emptyObj = {} as { name: string };

    return async () => {
      emptyObj.name.replace('', ''); // throw error because name is undefined
    };
  });

  const app = createApp(() => {
    useComponent(HttpComponent);
    useController(createUser);
  });

  const server = createServer(app);

  const fetch = makeFetch(server);
  await fetch('/users').expect(500);
}, 20);

it('handle simultaneous calls', async () => {
  const getUsers = controller(() => {
    definePath('/users');

    return () => [{ name: 'Carlos' }];
  });

  const app = createApp(() => {
    useComponent(HttpComponent);
    useController(getUsers);
  });

  const server = createServer(app);

  const fetch = makeFetch(server);
  const requests = Array.from({ length: 20 }, () => fetch('/users').expect(200));

  await Promise.all(requests);
}, 40);
