import {
  closeContext,
  createContext,
  getContext,
  inject,
  openContext,
  provide
} from '../../src';

import { describe, beforeEach, it, afterEach, expect } from 'vitest';

describe('inject()', () => {
  beforeEach(() => openContext());
  afterEach(() => closeContext());

  it('throw error if there is not key', function () {
    expect(() => inject('null')).toThrow();
  });
});

describe('provide()', () => {
  beforeEach(() => openContext());
  afterEach(() => closeContext());
  it('allow get nested property', function () {
    provide('user').with({
      name: 'Pedro'
    });
    const name = inject('user', 'name');
    expect(name).toEqual('Pedro');
  });

  it('when is called with same key results in the same bind', () => {
    const bind = provide('user');
    let innerBind;
    createContext(() => {
      innerBind = provide('user');
    });
    expect(innerBind).toBe(bind);
  });

  it('dont change the owner with multiple calls on different contexts', () => {
    const parentCtx = getContext();
    provide('test');

    createContext((innerCtx) => {
      const innerBind = provide('test');

      const ownerCtx = innerCtx.getOwnerContext(innerBind.key);
      expect(ownerCtx).toBe(parentCtx);
    });
  });
});
