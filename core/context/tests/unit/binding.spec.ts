import { Binding, closeContext, openContext } from '../../src';

import { it, expect, beforeEach, afterEach } from 'vitest';

beforeEach(() => openContext());
afterEach(() => closeContext());

it('cannot write to lock bindings', function () {
  const bind = new Binding('test');
  const lockBind = bind.lock() as unknown as Binding;
  expect(() => lockBind.with('value')).throw(/BindingKey '.*' is locked/);
});

it('only allow change to unlock who own the original bind', function () {
  const bind1 = new Binding('age').with(23);
  const original = bind1.lock();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((bind1 as any).unlock).toBeUndefined();
  expect(original.unlock).not.toBeUndefined();
});

it('allow nullish values like 0', function () {
  const bind = new Binding('test').with(0);
  expect(bind.value()).toEqual(0);
});
