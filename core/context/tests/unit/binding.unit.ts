import { Binding, closeContext, openContext } from '../../src/index.js';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const KraftrContext = suite('[unit] new Binding():');

KraftrContext.before.each(() => {
  openContext();
});
KraftrContext.after.each(() => {
  closeContext();
});

KraftrContext('cannot write to lock bindings', function () {
  const bind = new Binding('test');
  const lockBind = bind.lock() as unknown as Binding;
  assert.throws(() => lockBind.with('value'), /BindingKey '.*' is locked/);
});

KraftrContext('only allow change to unlock who own the original bind', function () {
  const bind1 = new Binding('age').with(23);
  const original = bind1.lock();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.type((bind1 as any).unlock, 'undefined');
  assert.type(original.unlock, 'function');
});

KraftrContext('allow nullish values like 0', function () {
  const bind = new Binding('test').with(0);
  assert.is(bind.value(), 0);
});

KraftrContext.run();
