import { describe, expect, it } from 'vitest';
import { isAsyncIterable, isIterable } from '../type-guards';

describe('isAsyncIterable()', () => {
  it('returns true for async iterables', () => {
    const asyncGenerator = async function* () {};

    expect(isAsyncIterable(asyncGenerator())).toBeTruthy();
  });

  it('returns true for async objs', () => {
    const asyncGenerator = {
      from: 1,
      to: 5,
      [Symbol.asyncIterator]: () => ({
        async next() {
          return 1;
        }
      })
    };

    expect(isAsyncIterable(asyncGenerator)).toBeTruthy();
  });

  it('returns false for promises', () => {
    const fn = async function () {};

    expect(isAsyncIterable(fn())).toBeFalsy();
  });

  it('returns false for normal generator', () => {
    const generator = function* () {};

    expect(isAsyncIterable(generator())).toBeFalsy();
  });
});

describe('isIterable()', () => {
  it('returns true for async iterables', () => {
    const generator = function* () {};

    expect(isIterable(generator())).toBeTruthy();
  });

  it('returns true for async objs', () => {
    const generator = {
      from: 1,
      to: 5,
      [Symbol.iterator]: () => ({
        next() {
          return 1;
        }
      })
    };

    expect(isIterable(generator)).toBeTruthy();
  });

  it('returns true for arrays', () => {
    expect(isIterable([])).toBeTruthy();
  });

  it('returns false for promises', () => {
    const fn = async function () {};

    expect(isIterable(fn())).toBeFalsy();
  });
});
