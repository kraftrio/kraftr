import { describe, expect, test } from 'vitest';
import { component, isComponent } from '..';

describe('isComponent()', () => {
  test('normal objects', () => {
    expect(isComponent({})).toBeFalsy();
  });

  test('components', () => {
    expect(isComponent(component(() => {}))).toBeTruthy();
  });
});

describe('component()', () => {
  test('throw error if fn is not provided', () => {
    expect(() => component({}, 23 as any)).toThrow();
  });

  test('obj is unaffected', () => {
    const obj = {};
    expect(component(obj, () => {})).toBe(obj);
  });
});
