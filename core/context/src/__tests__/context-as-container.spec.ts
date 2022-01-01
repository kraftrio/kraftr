import { describe, expect, it } from 'vitest';
import { BindingScope, inject, provide } from '../';
import { runInContext } from '../tests';

describe('context as container for bindings', () => {
  runInContext();

  it('should allow inject a fn which is called when the value is needed', () => {
    const fn = () => '12:00 PM';
    provide('hour').dynamic().with(fn);

    const hour = inject('hour');
    expect(hour).toEqual('12:00 PM');
  });

  it('should allow inject a simple string', () => {
    provide('password').with('this-is-a-password');
    const value = inject('password');
    expect(value).toEqual('this-is-a-password');
  });

  it('when is injected as singleton return the same class instance every time', () => {
    class Client {
      name = 'test';
    }
    provide('client').with(Client).class().in(BindingScope.SINGLETON);
    const value = inject('client');
    const value2 = inject('client');
    expect(value).toEqual(value2);
  });

  it('returns the same value, while is inside in the same scope', () => {
    let val = 0;
    const fn = () => val++;

    provide('test').with(fn).dynamic().in(BindingScope.APPLICATION);

    const value = inject('test');
    const value2 = inject('test');
    expect(value).toEqual(value2);
  });

  it('when is injected as application scope return the same class instance every time', () => {
    class PasswordService {
      createPassword() {}
    }
    provide('passwordService').with(PasswordService).class().in(BindingScope.APPLICATION);
    const value = inject('passwordService');

    const value2 = inject('passwordService');
    expect(value).toEqual(value2);
  });
});
