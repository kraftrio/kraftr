import { describe, expect, fn, it, spyOn } from 'vitest';
import * as context from '../../context';
import { inject, provide } from '../injections';

describe('inject()', () => {
  it('throw error if bind if not found', function () {
    const ctx: unknown = {
      get: () => undefined
    };
    const $getContext = spyOn(context, 'getContext');
    $getContext.mockReturnValue(ctx as context.Context);

    expect(() => inject('null')).toThrow("BindingKey 'null' not found");
    $getContext.mockRestore();
  });

  it('if the key exists returns the value', function () {
    const value = {};
    const ctx: unknown = {
      get: () => ({ value: () => value })
    };
    const $getContext = spyOn(context, 'getContext');
    $getContext.mockReturnValue(ctx as context.Context);

    expect(inject('null')).toBe(value);
    $getContext.mockRestore();
  });

  it('returns undefined with {optional: true}', function () {
    const ctx: unknown = {
      get: () => undefined
    };
    const $getContext = spyOn(context, 'getContext');
    $getContext.mockReturnValue(ctx as context.Context);

    expect(inject('key', { optional: true })).toBeUndefined();
    $getContext.mockRestore();
  });

  it('.deep() if a property is provided return the inner value', function () {
    const value = { name: 'Jon' };
    const ctx: unknown = {
      get: () => ({ value: () => value })
    };
    const $getContext = spyOn(context, 'getContext');
    $getContext.mockReturnValue(ctx as context.Context);

    expect(inject.deep('null', 'name')).toEqual('Jon');
    $getContext.mockRestore();
  });

  it('.binding() inject the binding instead of the value', function () {
    const mockBind = fn();
    const ctx: unknown = {
      get: () => mockBind
    };
    const $getContext = spyOn(context, 'getContext');
    $getContext.mockReturnValue(ctx as context.Context);

    expect(inject.binding('null')).toBe(mockBind);
    $getContext.mockRestore();
  });
});

describe('provide()', () => {
  it('bind to the context in every call', function () {
    const $getContext = spyOn(context, 'getContext');
    const $add = fn();
    const ctx: unknown = {
      add: $add
    };
    $getContext.mockReturnValue(ctx as context.Context);

    provide('user');
    provide('user');
    provide('user');

    expect($add).toBeCalledTimes(3);
    $getContext.mockRestore();
    $add.mockRestore();
  });
});
