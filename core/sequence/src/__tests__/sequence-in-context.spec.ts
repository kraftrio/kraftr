import { closeContext, inject, openContext, provide } from '@kraftr/context';
import { createSequence } from '../sequence';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Middleware } from '../types';

describe('integration sequence with context', () => {
  afterEach(() => {
    closeContext();
  });
  beforeEach(() => {
    openContext();
  });

  it('collect one middleware from the context', async () => {
    const sequence = createSequence('test-sequence', ['group']);
    const middleware: Middleware = () => {
      provide('value').with('return');
    };
    sequence.provide('group', middleware);

    await sequence();

    expect(inject('value')).toEqual('return');
  });

  it('run every function in the sequence', async () => {
    const sequence = createSequence('test-chain', ['a', 'b', 'c']);
    const a = vi.fn((next) => next());
    const b = vi.fn((next) => next());
    const c = vi.fn((next) => next());

    sequence.provide('a', a);
    sequence.provide('b', b);
    sequence.provide('c', c);

    await sequence();

    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
    expect(c).toHaveBeenCalledOnce();
  });

  it('allow run nested sequences', async () => {
    provide('text').with('this is a message with c');

    const stringProcessor = createSequence('stringProcessor', [
      'toUpperCase',
      'replacer'
    ]);
    const replacer = createSequence('replacer', ['aTob', 'cToe']);

    stringProcessor.provide('toUpperCase', (next) => {
      const text = inject<string>('text');

      provide('text').with(text.toUpperCase());
      next();
    });
    stringProcessor.provide('replacer', replacer);

    replacer.provide('aTob', (next) => {
      const text = inject<string>('text');

      provide('text').with(text.replace('A', 'B'));
      next();
    });
    replacer.provide('cToe', (next) => {
      const text = inject<string>('text');

      provide('text').with(text.replace('C', 'E'));
      next();
    });

    stringProcessor();

    expect(inject('text')).toEqual('THIS IS B MESSAGE WITH E');
  });

  it('collect sequence from context even if no one group is defined', async () => {
    const sequence = createSequence('test-sequence');

    const middleware = vi.fn();
    sequence.provide('b', middleware);

    sequence();

    expect(middleware).toHaveBeenCalledOnce();
  });
});
