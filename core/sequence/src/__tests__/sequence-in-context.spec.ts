import { closeContext, inject, openContext, provide } from '@kraftr/context';
import { Middleware, Sequence } from 'src';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('integration sequence with context', () => {
  afterEach(() => {
    closeContext();
  });
  beforeEach(() => {
    openContext();
  });

  it('collect one middleware from the context', async () => {
    class TestSequence extends Sequence<string> {
      override chain = 'test-sequence';
      override groups = ['group'];
    }
    const sequence = new TestSequence();

    provide<Middleware<string>>('key')
      .with((_, next) => next('return')) // noop
      .tag('chain', 'test-sequence')
      .tag('group', 'group');

    const result = await sequence.execute('');

    expect(result).toEqual('return');
  });

  it('run every function in the sequence', async () => {
    class TestSequence extends Sequence<string> {
      override chain = 'test-chain';
      override groups = ['a', 'b', 'c'];
    }

    const sequence = new TestSequence();

    provide<Middleware<string>>('fnc')
      .tag('group', 'c')
      .tag('chain', 'test-chain')
      .with(async (s: string, next) => {
        s = await next(s + 'c');
        return s;
      });

    provide<Middleware<string>>('fnb')
      .tag('group', 'b')
      .tag('chain', 'test-chain')
      .with(async (s: string, next) => {
        s = await next(s + 'b');
        return s;
      });

    provide<Middleware<string>>('fna')
      .tag('group', 'a')
      .tag('chain', 'test-chain')
      .with(async (s: string, next) => {
        s = await next(s + 'a');
        return s;
      });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
  });

  it('allow run nested sequences from the context', async () => {
    class MainSequence extends Sequence<string> {
      override chain = 'main-chain';
      override groups = ['post-processor'];
    }
    class UppercaseSequence extends Sequence<string> {
      override chain = 'upper-chain';
      override groups = ['uppercase'];
    }
    provide<Sequence<string>>('main-seq').class().with(MainSequence);
    provide<Sequence<string>>('upper-seq').class().with(UppercaseSequence);

    const mainSequence = inject<Sequence<string>>('main-seq');
    const upperSequence = inject<Sequence<string>>('upper-seq');

    provide<Middleware<string>>('fn-upper')
      .tag('group', 'upper')
      .tag('chain', 'upper-chain')
      .with((s: string, next) => next(s.toUpperCase()));

    provide<Middleware<string>>('fn-inverse')
      .tag('group', 'inverse')
      .tag('chain', 'upper-chain')
      .tag('upstream', ['upper'])
      .with((s: string, next) => next([...s].reverse().join('')));

    provide<Sequence<string>>('seq-upper')
      .tag('group', 'post-processor')
      .tag('chain', 'main-chain')
      .with(upperSequence);

    provide<Middleware<string>>('fn-final')
      .tag('group', 'final-word')
      .tag('chain', 'main-chain')
      .tag('downstream', ['post-processor'])
      .with((s: string, next) => next(s + 'final word'));

    const result = await mainSequence.execute('this is the ');

    expect(result).toEqual('DROW LANIF EHT SI SIHT');
  });

  it('collect sequence from context even if no one group is defined', async () => {
    class TestSequence extends Sequence<string> {
      override chain = 'test-chain';
      override groups = [];
    }

    const sequence = new TestSequence();

    provide<Middleware<string>>('fnb')
      .tag('group', 'b')
      .tag('chain', 'test-chain')
      .with(async (s: string, next) => {
        s = await next(s + 'abc');
        return s;
      });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
  });
});
