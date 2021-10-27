import { createContext } from '../../src/context';
import { inject, provide } from '../../src/injection';
import { BindingScope } from '../../src/utils';

describe('createContext', () => {
  describe('basic features', () => {
    it('inject return the function result', () => {
      createContext(() => {
        const fn = () => 'value';
        provide('test').with(fn);
        const value = inject('test');
        expect(value).toBe(value);
      });
    });

    it('inject return the class', () => {
      createContext(() => {
        class Test {}
        provide('test').with(Test).constant();

        const value = inject('test');
        expect(value).toBe(Test);
      });
    });
    it('inject return an instance of the class', () => {
      createContext(() => {
        class Test {
          name = 'test';
        }
        provide('test').with(Test).class();
        const value = inject('test');
        expect(value).toBeInstanceOf(Test);
      });
    });
    it('can provide and inject value inside context', () => {
      createContext(() => {
        provide('test').with('value');
        const value = inject('test');
        expect(value).toEqual('value');
      });
    });
    it('can provide and inject value inside nested context without change parent value', () => {
      createContext(() => {
        provide('test').with('value');
        const value = inject('test');
        createContext(() => {
          provide('test').with('nested');
          const value = inject('test');
          expect(value).toEqual('nested');
        });
        expect(value).toEqual('value');
      });
    });
    it('can inject value from parent context value', () => {
      createContext(() => {
        provide('test').with('value').in(BindingScope.SINGLETON);
        createContext(() => {
          const value = inject<string>('test');
          expect(value).toEqual('value');
        });
      });
    });
    it('returns the function as it when is type constant', () => {
      createContext(() => {
        const fn = () => 'value';

        provide('test').with(fn).constant();

        const value = inject('test');
        expect(value).toBe(fn);
      });
    });
  });

  describe('singleton behavior', () => {
    it('returns the same value from differents scopes', () => {
      createContext(() => {
        class Test {}
        let value;
        let value2;
        provide('test').with(Test).class().in(BindingScope.SINGLETON);

        createContext(() => {
          value = inject('test');
        });

        createContext(() => {
          value2 = inject('test');
        });

        expect(value).toBe(value2);
      });
    });
    it('returns the same value from function when is marked as singleton for class', () => {
      createContext(() => {
        class Test {}

        provide('test').with(Test).class().in(BindingScope.SINGLETON);

        const value = inject('test');
        const value2 = inject('test');
        expect(value).toBe(value2);
      });
    });
    it('when is injected a singleton return the same class instance everytime', () => {
      createContext(() => {
        class Test {
          name = 'test';
        }
        provide('test').with(Test).class().in(BindingScope.SINGLETON);
        const value = inject('test');
        const value2 = inject('test');
        expect(value).toBe(value2);
      });
    });
  });

  describe('transient behavior', () => {
    it('returns a new value ignoring cache', () => {
      createContext(() => {
        const fn = () => Math.floor(Math.random() * 100);

        provide('test').with(fn).in(BindingScope.TRANSIENT);

        const value = inject('test');
        const value2 = inject('test');
        expect(value).not.toBe(value2);
      });
    });
    it('returns a new instance of the object', () => {
      createContext(() => {
        class Test {
          name = 'test';
        }
        provide('test').with(Test).class().in(BindingScope.TRANSIENT);
        const value = inject('test');
        const value2 = inject('test');
        expect(value).not.toBe(value2);
      });
    });
  });

  describe('application behavior', () => {
    it('return the same value from while is inside the same scope', () => {
      createContext(() => {
        const fn = () => Math.floor(Math.random() * 100);

        provide('test').with(fn).in(BindingScope.APPLICATION);

        const value = inject('test');
        const value2 = inject('test');
        expect(value).toBe(value2);
      });
    });
    it('when is injected as application scope return the same class instance everytime', () => {
      createContext(() => {
        class Test {
          name = 'test';
        }
        provide('test').with(Test).class().in(BindingScope.APPLICATION);
        const value = inject('test');

        const value2 = inject('test');
        expect(value).toBe(value2);
      });
    });

    it('return the same value from while is inside the same scope', () => {
      createContext(() => {
        const fn = () => Math.floor(Math.random() * 100);
        let value;
        let value2;
        provide('test').with(fn).in(BindingScope.APPLICATION);

        createContext(() => {
          value = inject('test');
        });

        createContext(() => {
          value2 = inject('test');
        });

        expect(value).not.toBe(value2);
      });
    });
    it('when is injected as application scope return the same class instance everytime', () => {
      createContext(() => {
        class Test {
          name = 'test';
        }
        let value;
        let value2;
        provide('test').with(Test).class().in(BindingScope.APPLICATION);
        createContext(() => {
          value = inject('test');
        });

        createContext(() => {
          value2 = inject('test');
        });

        expect(value).not.toBe(value2);
      });
    });
  });
});
