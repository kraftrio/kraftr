import { describe, expect, it } from 'vitest';
import { BindingScope, createContext, inject, provide } from '../';
import { runInContext } from '../tests';

describe('behavior of bindings in nested contexts', () => {
  const state = runInContext();

  it('should allow have nested scopes without modify parent is value', () => {
    provide('name').with('Carlos');
    const name = inject('name');

    createContext(() => {
      provide('name').with('Juan');
      const name = inject('name');
      expect(name).toEqual('Juan');
    });

    expect(name).toEqual('Carlos');
  });

  it('should allow pass from parent to child values', () => {
    provide('date').with('01/01/20').in(BindingScope.SINGLETON);
    createContext(() => {
      const date = inject<string>('date');
      expect(date).toEqual('01/01/20');
    });
  });

  it('returns the same value from different scopes', () => {
    class User {}
    let value;
    let value2;
    provide('model').with(User).class().in(BindingScope.SINGLETON);

    createContext(() => {
      value = inject('model');
    });

    createContext(() => {
      value2 = inject('model');
    });

    expect(value).toEqual(value2);
  });

  it('returns different values if is in different scopes', () => {
    let val = 0;
    const fn = () => val++;
    let value;
    let value2;
    provide('test').with(fn).dynamic().in(BindingScope.APPLICATION);

    createContext(() => {
      value = inject('test');
    });

    createContext(() => {
      value2 = inject('test');
    });

    expect(value).not.toEqual(value2);
  });

  it('when is injected as application scope return the same class even in nested scopes', () => {
    class PasswordService {
      createPassword() {}
    }
    let value;
    let value2;
    provide('passwordService').with(PasswordService).class().in(BindingScope.APPLICATION);
    createContext(() => {
      value = inject('passwordService');
    });

    createContext(() => {
      value2 = inject('passwordService');
    });

    expect(value).not.toBe(value2);
  });

  it('it changes the owner with calls on different contexts', () => {
    provide('test');

    createContext((innerCtx) => {
      const innerBind = provide('test');

      const ownerCtx = innerCtx.getOwnerContext(innerBind.key);
      expect(ownerCtx).not.toBe(state.context);
    });
  });
});
