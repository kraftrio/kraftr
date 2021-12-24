import { createApp, useComponent } from '@kraftr/core';
import request from 'supertest';
import { expect, it } from 'vitest';
import {
  controller,
  createServer,
  defineBody,
  definePath,
  useController
} from '../../src';
import { RestComponent } from '../../src/component';

type User = { name: string };

it('returns 404 when route is not found', async () => {
  const app = createApp(() => {
    useComponent(RestComponent);
  });
  const server = createServer(app);
  await request(server).get('/missing-route').expect(404);
}, 20);

it('call with GET to an existing endpoint and returns 200', async () => {
  const getUsers = controller(() => {
    definePath('/users');

    return () => [{ name: 'Carlos' }];
  });

  const app = createApp(() => {
    useComponent(RestComponent);
    useController(getUsers);
  });

  const server = createServer(app);

  await request(server)
    .get('/users?name=Carlos')
    .set('Accept', 'application/json')
    .expect(200, [{ name: 'Carlos' }]);

  await request(server)
    .post('/users')
    .send({ name: 'NoName' })
    .set('Accept', 'application/json')
    .expect(404);
}, 20);

it('call GET to an existing endpoint with querystring and hash', async () => {
  const getUsers = controller(() => {
    definePath('/users');

    return () => [{ name: 'Carlos' }];
  });

  const app = createApp(() => {
    useComponent(RestComponent);
    useController(getUsers);
  });

  const server = createServer(app);

  await request(server)
    .get('/users/#site?name=Carlos')
    .set('Accept', 'application/json')
    .expect(200, [{ name: 'Carlos' }]);
}, 20);

it('make a post request with a body', async () => {
  const db: User[] = [];
  const createUser = controller(() => {
    definePath('POST', '/users');
    const body = defineBody<User>();

    return async () => {
      const user = await body.value();
      db.push(user);
      return user;
    };
  });

  const app = createApp(() => {
    useComponent(RestComponent);
    useController(createUser);
  });

  const server = createServer(app);

  await request(server)
    .post('/users')
    .send({ name: 'Jose' })
    .expect(200, { name: 'Jose' });

  expect(db).toEqual([{ name: 'Jose' }]);
}, 20);

it('make a post request with a invalid body', async () => {
  const db: User[] = [];
  const createUser = controller(() => {
    definePath('POST', '/users');
    const body = defineBody<User>();

    return async () => {
      const user = await body.value();

      db.push(user);
      return user;
    };
  });

  const app = createApp(() => {
    useComponent(RestComponent);
    useController(createUser);
  });

  const server = createServer(app);

  await request(server)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send(`{ "name" "Jose" }`)
    .expect(422);
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
    useComponent(RestComponent);
    useController(createUser);
  });

  const server = createServer(app);

  await request(server).get('/users').expect(500);
}, 20);
