import { sortListOfGroups } from '../../src/sorter';

describe('sortGroups', () => {
  it('sorts groups across lists', () => {
    const result = sortListOfGroups(['first', 'end'], ['start', 'end', 'last']);
    expect(result).toEqual(['first', 'start', 'end', 'last']);
  });

  it('add new groups after existing groups', () => {
    const result = sortListOfGroups(
      ['initial', 'session', 'auth'],
      ['initial', 'added', 'auth']
    );
    expect(result).toEqual(['initial', 'session', 'added', 'auth']);
  });

  it('merges arrays preserving the order', () => {
    const target = ['initial', 'session', 'auth', 'routes', 'files', 'final'];
    const result = sortListOfGroups(target, [
      'initial',
      'postinit',
      'preauth', // add
      'auth',
      'routes',
      'subapps', // add
      'final',
      'last' // add
    ]);

    expect(result).toEqual([
      'initial',
      'session',
      'postinit',
      'preauth',
      'auth',
      'routes',
      'files',
      'subapps',
      'final',
      'last'
    ]);
  });

  it('throws on conflicting order', () => {
    expect(() => {
      sortListOfGroups(['one', 'two'], ['two', 'one']);
    }).toThrow(/Cyclic dependency/);
  });
});
