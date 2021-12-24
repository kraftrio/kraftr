import { describe, expect, fn, it, spyOn } from 'vitest';
import { Binding, BindingScope, BindingType } from '../binding';

describe('new Binding()', () => {
  it(`it's set as default as constant`, () => {
    const bind = new Binding('key');

    expect(bind.type).toEqual(BindingType.CONSTANT);
  });

  describe('lock()', () => {
    it('allow to lock it', () => {
      const bind = new Binding('key');
      bind.lock();

      expect(bind.isLocked).toBeTruthy();
    });
  });

  describe('with()', () => {
    it(`don't allow use promise with constant binds`, () => {
      const bind = new Binding('key');
      expect(() => bind.with(Promise.resolve())).toThrow(
        /Promise instances are not allowed/
      );
    });
  });

  describe('constant() type', () => {
    it('returns a value without throw context not found', () => {
      const bind = new Binding('key').with('John Doe');

      expect(bind.value()).toEqual('John Doe');
    });

    it('allow use class', () => {
      class User {}
      const bind = new Binding('key').with(User);
      expect(bind.value()).toEqual(User);
    });

    it('returns functions as it', () => {
      const fn = () => 'any value';

      const bind = new Binding('key').with(fn);

      expect(bind.value()).toEqual(fn);
    });
  });

  describe('class() type', () => {
    it('create a new instance every time', () => {
      class User {}
      const mock = spyOn(
        Binding.prototype,
        'getResolutionContext' as never
      ).mockReturnValue({});
      const bind = new Binding('key').class().with(User);
      const user = bind.value();

      expect(user).toBeInstanceOf(User);
      expect(user).not.toBe(bind.value());

      mock.mockRestore();
    });
  });

  describe('dynamic() type', () => {
    it('execute the function every time', () => {
      const mock = spyOn(
        Binding.prototype,
        'getResolutionContext' as never
      ).mockReturnValue({});
      const getUser = fn().mockReturnValue(20);
      const bind = new Binding('key').in(BindingScope.TRANSIENT).dynamic().with(getUser);

      expect(bind.value()).toEqual(20);
      expect(bind.value()).toEqual(20);
      expect(getUser).toBeCalledTimes(2);
      mock.mockRestore();
    });
  });

  describe('value()', () => {
    it('throw error if is not initialized', () => {
      const bind = new Binding('key');

      expect(() => bind.value()).toThrow(/Source for binding '.*' is not defined/);
    });

    it('uses the cache for SINGLETONs', () => {
      class User {}
      const mock = spyOn(
        Binding.prototype,
        'getResolutionContext' as never
      ).mockReturnValue({});
      const bind = new Binding('key').in(BindingScope.SINGLETON).class().with(User);
      const user = bind.value();

      expect(user).toBeInstanceOf(User);
      expect(user).toBe(bind.value());

      mock.mockRestore();
    });

    it('allow nullish values like 0', function () {
      const mock = spyOn(
        Binding.prototype,
        'getResolutionContext' as never
      ).mockReturnValue({});
      const bind = new Binding('test').with(0);
      expect(bind.value()).toEqual(0);
      mock.mockRestore();
    });
  });
});
