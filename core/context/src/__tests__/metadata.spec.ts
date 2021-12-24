import { describe, expect, it } from 'vitest';
import { BindingScope, createContext } from '..';
import { useMetadata } from '../metadata';
import { runInContext } from '../tests';

describe('useMetadata()', () => {
  runInContext(BindingScope.METADATA);

  it('collect metadata from a called function', () => {
    function generator() {
      const meta = useMetadata('user');
      meta.extend({ name: 'John Doe' });
      meta.extend({ age: 23 });
    }
    generator();
    const meta = useMetadata('user');
    expect(meta.data).toEqual({ name: 'John Doe', age: 23 });
  });

  it('works with scope to limit metadata', () => {
    const meta = useMetadata('user');

    createContext(() => {
      const inMeta = useMetadata('user');
      inMeta.extend({ name: 'John Doe' });
      expect(inMeta.data).toEqual({ name: 'John Doe' });
    }, BindingScope.METADATA);

    expect(meta.data).toEqual({});
  });

  it('when is called with same key returns the same metadata', () => {
    const meta = useMetadata('user');

    createContext((ctx) => {
      ctx.name = 'inner';
      const inMeta = useMetadata('user');
      inMeta.extend({ name: 'John Doe' });
    });

    expect(meta.data).toEqual({ name: 'John Doe' });
  });
});
