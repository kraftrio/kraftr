import { Binding, createContext } from '../../src';
import { LockError } from '../../src/errors';

describe('@kraftr/context:', function () {
  describe('new Binding():', function () {
    it('cannot write to lock bindings', function () {
      const bind = new Binding('test');
      createContext(() => {
        expect(() => {
          (bind.lock() as unknown as Binding).with('value');
        }).toThrowError(LockError);
      });
    });

    it('only allow change to unlock who own the original bind', function () {
      createContext(() => {
        const bind1 = new Binding('test').with(0);
        const original = bind1.lock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((bind1 as any).unlock).toBeUndefined();
        expect(original.unlock).toBeDefined();

        // Another place access
        const bind = new Binding('test');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((bind as any).unlock).toBeUndefined();
        expect(bind.value()).toEqual(original.value());
      });
    });

    it('allow nullish values like 0', function () {
      createContext(() => {
        const bind = new Binding('test').with(0);
        expect(bind.value()).toEqual(0);
      });
    });
  });
});
