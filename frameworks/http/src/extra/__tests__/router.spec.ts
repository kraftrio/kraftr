import { describe, expect, it } from 'vitest';
import { Router } from '../router';

describe('find()', () => {
  it('works with same route different method', () => {
    const router = new Router();
    router.add('POST', '/users', 'post to users');
    router.add('GET', '/users', 'get to users');

    expect(router.find('GET', '/users').handler).toEqual('get to users');
  });

  it('is strict about the method', () => {
    const router = new Router();
    router.add('GET', '/users', 'get to users');

    expect(router.find('POST', '/users').handler).toEqual(undefined);
  });

  it('is strict about the method when only post is defined', () => {
    const router = new Router();
    router.add('POST', '/users', 'get to users');

    expect(router.find('GET', '/users').handler).toEqual(undefined);
  });

  it('works with same method different route', () => {
    const router = new Router();
    router.add('GET', '/items', 'post to items');
    router.add('GET', '/users', 'get to users');

    expect(router.find('GET', '/users').handler).toEqual('get to users');
  });

  it('returns last path declared', () => {
    const router = new Router();
    router.add('GET', '/users', 'old get');
    router.add('GET', '/users', 'get to users');

    expect(router.find('GET', '/users').handler).toEqual('get to users');
  });

  it('returns url path params', () => {
    const router = new Router();
    router.add('GET', '/users/:id', 'get');

    expect(router.find('GET', '/users/23').params).toEqual({ id: '23' });
  });

  it('returns nested url path params', () => {
    const router = new Router();
    router.add('GET', '/users/:id/:name', 'get');

    expect(router.find('GET', '/users/23/juan').params).toEqual({
      id: '23',
      name: 'juan'
    });
  });

  it('returns url path params defined as regex', () => {
    const router = new Router();
    router.add('GET', /\/users\/(?<id>\d+)/, 'get');

    expect(router.find('GET', '/users/232').params).toEqual({
      id: '232'
    });
  });

  it('allow to match any method', () => {
    const router = new Router();
    router.add('', '/users', 'get');

    expect(router.find('GET', '/users').handler).toEqual('get');
    expect(router.find('POST', '/users').handler).toEqual('get');
    expect(router.find('DELETE', '/users').handler).toEqual('get');
  });

  it('allow to match any route', () => {
    const router = new Router();
    router.add('GET', '*', 'get');

    expect(router.find('GET', '/users').handler).toEqual('get');
  });

  it.todo('is strict about the route match', () => {
    let router = new Router();
    router.add('GET', '/users', 'users');
    router.add('GET', '/:path', 'path');

    expect(router.find('GET', '/users').handler).toEqual('users');

    router = new Router();
    router.add('GET', '/:path', 'path');
    router.add('GET', '/users', 'users');

    expect(router.find('GET', '/users').handler).toEqual('users');
  });
});
