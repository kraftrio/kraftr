import {
  BindingScope,
  closeContext,
  createContext,
  openContext,
  useMetadata
} from '../../src';
import { beforeEach, it, afterEach, expect } from 'vitest';

beforeEach(() => {
  openContext(BindingScope.METADATA);
});
afterEach(() => {
  closeContext();
});

it('collect metadata from a called function', () => {
  function generator() {
    const meta = useMetadata('user');
    meta.extend({ name: 'filt' });
    meta.extend({ age: 23 });
  }
  generator();
  const meta = useMetadata('user');
  expect(meta.data).toEqual({ name: 'filt', age: 23 });
});

it('works with scope to limit metadata', () => {
  const meta = useMetadata('user');

  createContext(() => {
    const inMeta = useMetadata('user');
    inMeta.extend({ name: 'filt' });
    expect(inMeta.data).toEqual({ name: 'filt' });
  }, BindingScope.METADATA);

  expect(meta.data).toEqual({});
});

it('when is called with same key returns the same metadata', () => {
  const meta = useMetadata('user');

  createContext((ctx) => {
    ctx.name = 'inner';
    const inMeta = useMetadata('user');
    inMeta.extend({ name: 'filt' });
  });

  expect(meta.data).toEqual({ name: 'filt' });
});
