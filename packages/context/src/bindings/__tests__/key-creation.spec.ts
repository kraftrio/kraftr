import { describe, expect, it } from 'vitest';
import { BindingKey } from '../key-creation';

export const UNIQUE_ID_PATTERN = /[A-Za-z0-9-_]+-\d+/;

describe('BindingKey.create()', () => {
  it('with 1 param return the same string', () => {
    const key = BindingKey.create('application');

    expect(key).toEqual('application');
  });

  it('with 2 params concatenate the value as {param1}#{param2}', () => {
    const key = BindingKey.create('application', 'port');

    expect(key).toEqual('application#port');
  });
});

describe('BindingKey.generate()', () => {
  it('create an unique id', () => {
    const key = BindingKey.generate();

    expect(key).toMatch(UNIQUE_ID_PATTERN);
  });
});
