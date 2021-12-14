import { afterEach, beforeEach, it, expect } from 'vitest';
import {
  BindingScope,
  closeContext,
  createContext,
  inject,
  openContext,
  provide
} from '../../src';

beforeEach(() => {
  openContext();
});
afterEach(() => {
  closeContext();
});

it('should allow inject a fn which is called when the value is needed', () => {
  const fn = () => '12:00 PM';
  provide('hour').with(fn);

  const hour = inject('hour');
  expect(hour).toEqual('12:00 PM');
});

it('should allow inject a class as constant', () => {
  class User {}
  provide('userModel').with(User).constant();

  const value = inject('userModel');
  expect(value).toEqual(User);
});

it('should allow inject a class as a instance generator', () => {
  class User {
    name = 'test';
  }
  provide('userModel').with(User).class();
  const value = inject('userModel');
  expect(value).toBeInstanceOf(User);
});

it('should allow inject a simple string', () => {
  provide('password').with('this-is-a-password');
  const value = inject('password');
  expect(value).toEqual('this-is-a-password');
});

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

it('returns the function as it when is type constant', () => {
  const fn = () => 'any value';

  provide('function').with(fn).constant();

  const value = inject('function');
  expect(value).toEqual(fn);
});

it('returns the same value from differents scopes', () => {
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

it('returns the same value from function when is marked as singleton for class', () => {
  class Client {}

  provide('client').with(Client).class().in(BindingScope.SINGLETON);

  const value = inject('client');
  const value2 = inject('client');
  expect(value).toEqual(value2);
});

it('when is injected a singleton return the same class instance everytime', () => {
  class Client {
    name = 'test';
  }
  provide('client').with(Client).class().in(BindingScope.SINGLETON);
  const value = inject('client');
  const value2 = inject('client');
  expect(value).toEqual(value2);
});

it('returns a new value ignoring cache', () => {
  let v = 0;
  const fn = () => v++;

  provide('nextNumber').with(fn).in(BindingScope.TRANSIENT);

  const value = inject('nextNumber');
  const value2 = inject('nextNumber');
  expect(value).not.toEqual(value2);
});

it('returns a new instance of the object', () => {
  class Client {
    name = 'testName';
  }
  provide('client').with(Client).class().in(BindingScope.TRANSIENT);
  const value = inject('client');
  const value2 = inject('client');
  expect(value).not.toBe(value2);
});

it('return the same value from while is inside the same scope', () => {
  let val = 0;
  const fn = () => val++;

  provide('test').with(fn).in(BindingScope.APPLICATION);

  const value = inject('test');
  const value2 = inject('test');
  expect(value).toEqual(value2);
});

it('when is injected as application scope return the same class instance everytime', () => {
  class PasswordService {
    createPassword() {}
  }
  provide('passwordService').with(PasswordService).class().in(BindingScope.APPLICATION);
  const value = inject('passwordService');

  const value2 = inject('passwordService');
  expect(value).toEqual(value2);
});

it('return the same value from while is inside the same scope', () => {
  let val = 0;
  const fn = () => val++;
  let value;
  let value2;
  provide('test').with(fn).in(BindingScope.APPLICATION);

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
