import { BindingScope, closeContext, openContext, useMetadata } from '@kraftr/core';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { definePath } from '../..';
import { HttpMetadata } from '../../bindings';

beforeEach(() => {
  openContext(BindingScope.METADATA);
});
afterEach(() => closeContext());
it('create a metadata obj with a defined path', () => {
  definePath('/subscription');

  const meta = useMetadata(HttpMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription',
    method: 'GET',
    parameters: []
  });
});

it('create a metadata obj with a path param', () => {
  definePath('/subscription/:id');

  const meta = useMetadata(HttpMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription/:id',
    method: 'GET',
    parameters: [{ name: 'id', in: 'path' }]
  });
});

it('create a metadata obj with a PATCH method', () => {
  definePath('PATCH', '/subscription/:id');

  const meta = useMetadata(HttpMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription/:id',
    method: 'PATCH',
    parameters: [{ name: 'id', in: 'path' }]
  });
});

it('create a metadata obj with 2 path params', () => {
  definePath('PATCH', '/subscription/:id/:name');

  const meta = useMetadata(HttpMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription/:id/:name',
    method: 'PATCH',
    parameters: [
      { name: 'id', in: 'path' },
      { name: 'name', in: 'path' }
    ]
  });
});

it('throw error if params is not string', () => {
  expect(() => definePath(23 as unknown as string)).toThrow(/params must be strings/);
});
