import {
  Binding,
  BindingScope,
  closeContext,
  openContext,
  useMetadata
} from '@kraftr/core';
import { afterEach, beforeEach, it, expect } from 'vitest';
import { definePath } from '../../src';
import { RestMetadata } from '../../src/bindings';

beforeEach(() => openContext(BindingScope.METADATA));
afterEach(() => closeContext());

it('create a metadata obj with a defined path', () => {
  definePath('/subscription');

  const meta = useMetadata(RestMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription',
    method: 'GET',
    parameters: []
  });
});

it('create a metadata obj with a path param', () => {
  definePath('/subscription/:id');

  const meta = useMetadata(RestMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription/:id',
    method: 'GET',
    parameters: [{ name: 'id', in: 'path' }]
  });
});

it('create a metadata obj with a PATCH method', () => {
  definePath('PATCH', '/subscription/:id');

  const meta = useMetadata(RestMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription/:id',
    method: 'PATCH',
    parameters: [{ name: 'id', in: 'path' }]
  });
});

it('create a metadata obj with 2 path params', () => {
  definePath('PATCH', '/subscription/:id/:name');

  const meta = useMetadata(RestMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    path: '/subscription/:id/:name',
    method: 'PATCH',
    parameters: [
      { name: 'id', in: 'path' },
      { name: 'name', in: 'path' }
    ]
  });
});

it('returns an object for every path param as a binding', () => {
  const { id, name } = definePath('PATCH', '/subscription/:id/:name');

  expect(id).toBeInstanceOf(Binding);
  expect(name).toBeInstanceOf(Binding);
});

it('returns as binding only defined path params', () => {
  const params = definePath('PATCH', '/subscription/:id/:name');

  expect((params as any).test).toBeUndefined();
});

it('throw error if params is not string', () => {
  expect(() => definePath(23 as unknown as string)).toThrow(/params must be strings/);
});
