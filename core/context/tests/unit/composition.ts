import { inject, provide, closeContext, openContext } from '../../src/index.js';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const InjectComposition = suite('[unit] inject():');

InjectComposition.before.each(openContext);
InjectComposition.after.each(closeContext);

InjectComposition('throw error if there is not key', function () {
  assert.throws(() => inject('null'));
});

InjectComposition('allow get nested property', function () {
  provide('user').with({
    name: 'Pedro'
  });
  const name = inject('user', 'name');
  assert.is(name, 'Pedro');
});

const RefComposition = suite('[unit] inject():');

RefComposition.before.each(openContext);
RefComposition.after.each(closeContext);

InjectComposition.run();
