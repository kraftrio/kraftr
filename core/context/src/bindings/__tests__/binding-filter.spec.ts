import { describe, it, expect } from 'vitest';
import { Binding } from '../binding';
import { filterByTag, includesTagValue } from '../binding-filter';

type Tags = { controller: true; value: string[] };

describe('filterByTag()', () => {
  it('filter by tag existence', () => {
    const filter = filterByTag<Tags>({ controller: true });
    const bind = new Binding<unknown, Tags>('').tag('controller');

    expect(filter(bind)).toBeTruthy();
  });

  it('filter by function', () => {
    const filter = filterByTag<Tags>({ controller: (_, tag) => tag === 'controller' });

    const bind = new Binding<unknown, Tags>('').tag('controller');

    expect(filter(bind)).toBeTruthy();
  });
});

describe('includesTagValue()', () => {
  it('is a function', () => {
    const includes = includesTagValue('const');
    expect(typeof includes === 'function').toBeTruthy();
  });

  it('find a single value', () => {
    const includes = includesTagValue('const');
    expect(includes('const', '', new Map())).toBeTruthy();
  });

  it('returns false is none match', () => {
    const includes = includesTagValue('site');

    expect(includes('const', '', new Map())).not.toBeTruthy();
  });

  it('allow search multiple values', () => {
    const includes = includesTagValue('site', 'const');

    expect(includes('const', '', new Map())).toBeTruthy();
  });
});

describe('integration', () => {
  it('filter by tag array values', () => {
    const filter = filterByTag<Tags>({ value: includesTagValue('const') });

    const bind = new Binding<unknown, Tags>('').tag('value', ['const']);

    expect(filter(bind)).toBeTruthy();
  });
});
