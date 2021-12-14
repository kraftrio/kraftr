import { closeContext, openContext } from '@kraftr/context';
import { createSequence } from '../../src/sequence';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';

describe('new Sequence():', () => {
  afterEach(() => {
    closeContext();
  });
  beforeEach(() => {
    openContext();
  });

  it('run every function in the sequence', async () => {
    const sequence = createSequence<string>('test-chain1', []);
    sequence.add({
      group: 'b',
      downstream: ['c'],
      ex: async (s: string, next) => {
        s = await next(s + 'b');
        return s;
      }
    });

    sequence.add({
      group: 'c',
      upstream: ['b'],
      ex: async (s: string, next) => {
        s = await next(s + 'c');
        return s;
      }
    });

    sequence.add({
      group: 'a',
      downstream: ['b', 'c'],
      ex: async (s: string, next) => {
        s = await next(s + 'a');
        return s;
      }
    });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
  });

  it('run sequences with one handler', async () => {
    const sequence = createSequence<string>('test-chain2', ['b']);
    sequence.add({
      group: 'b',
      ex: async (s: string, next) => {
        s = await next(s + 'abc');
        return s;
      }
    });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
  });

  it('run the sequence when there is not a defaultGroup defined', async () => {
    const sequence = createSequence<string>('test-chain3', []);
    sequence.add({
      group: 'b',
      ex: async (s: string, next) => {
        s = await next(s + 'abc');
        return s;
      }
    });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
  });

  it('run every function in the sequence in both way', async () => {
    const sequence = createSequence<string>('test-chain4', ['b', 'c']);

    sequence.add({
      group: 'b',
      downstream: ['c'],
      ex: async (s: string, next: (v: string) => Promise<string>) => {
        let buffer = s + 'b';
        buffer = await next(buffer);
        return buffer + 'b';
      }
    });

    sequence.add({
      group: 'c',
      upstream: ['b'],
      ex: async (s: string) => {
        return s + 'c';
      }
    });

    sequence.add({
      group: 'a',
      downstream: ['b', 'c'],
      ex: async (s: string, next: (v: string) => Promise<string>) => {
        let buffer = s + 'a';
        buffer = await next(buffer);
        return buffer + 'a';
      }
    });

    const result = await sequence.execute('');

    expect(result).toEqual('abcba');
  });

  it('nested sequences', async () => {
    const mayusInverser = createSequence<string>('mayus-chain', ['mayus']);
    const mainSequence = createSequence<string>('main-chain', ['postprocessor']);

    mayusInverser.add({
      group: 'mayus',
      ex: async (s, next) => {
        return next(s.toUpperCase());
      }
    });
    mayusInverser.add({
      group: 'inverser',
      upstream: ['mayus'],
      ex: async (s, next) => next([...s].reverse().join(''))
    });

    mainSequence.add({
      group: 'postprocessor',
      ex: mayusInverser
    });

    mainSequence.add({
      group: 'finalWord',
      downstream: ['postprocessor'],
      ex: async (s: string, next) => next(s + 'final word')
    });

    const result = await mainSequence.execute('this is the ');

    expect(result).toEqual('DROW LANIF EHT SI SIHT');
  });
});
