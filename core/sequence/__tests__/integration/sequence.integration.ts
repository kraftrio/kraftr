import { closeContext, openContext } from '@kraftr/context';
import { createSequence } from '../../src/sequence';

describe('createSequence', () => {
  it('run every function in the sequence', async () => {
    openContext();
    const sequence = createSequence<string>('test-chain', []);
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
    closeContext();
  });

  it('run sequences with one handler', async () => {
    openContext();
    const sequence = createSequence<string>('test-chain', ['b']);
    sequence.add({
      group: 'b',
      ex: async (s: string, next) => {
        s = await next(s + 'abc');
        return s;
      }
    });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
    closeContext();
  });

  it('run the sequence when there is not a defaultGroup defined', async () => {
    openContext();
    const sequence = createSequence<string>('test-chain', []);
    sequence.add({
      group: 'b',
      ex: async (s: string, next) => {
        s = await next(s + 'abc');
        return s;
      }
    });

    const result = await sequence.execute('');

    expect(result).toEqual('abc');
    closeContext();
  });

  it('run every function in the sequence in both way', async () => {
    openContext();

    const sequence = createSequence<string>('test-chain', ['b', 'c']);

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

    expect(result).toBe('abcba');
    closeContext();
  });

  it('nested sequences', async () => {
    openContext();

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
      ex: async (s, next) => next(s.split('').reverse().join(''))
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

    expect(result).toBe('DROW LANIF EHT SI SIHT');
    closeContext();
  });
});
