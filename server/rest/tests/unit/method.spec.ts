import { BindingScope, closeContext, openContext, useMetadata } from '@kraftr/core';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { defineMethod } from '../../src';
import { RestMetadata } from '../../src/bindings';

beforeEach(() => openContext(BindingScope.METADATA));
afterEach(() => closeContext());

it('get the path parameters', () => {
  defineMethod('POST');
  const meta = useMetadata(RestMetadata.CONTROLLER);
  expect(meta.data).toEqual({
    method: 'POST'
  });
});
