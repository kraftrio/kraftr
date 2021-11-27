/* eslint-disable unicorn/consistent-function-scoping */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  BindingScope,
  closeContext,
  createContext,
  inject,
  openContext,
  provide
} from '../../src/index.js';

const KraftrContext = suite('[acceptance] @kraftr/context:');

KraftrContext.before.each(() => {
  openContext();
});
KraftrContext.after.each(() => {
  closeContext();
});

KraftrContext('should allow inject a fn which is called when the value is needed', () => {
  const fn = () => '12:00 PM';
  provide('hour').with(fn);

  const hour = inject('hour');
  assert.is(hour, '12:00 PM');
});

KraftrContext('should allow inject a class as constant', () => {
  class User {}
  provide('userModel').with(User).constant();

  const value = inject('userModel');
  assert.is(value, User);
});

KraftrContext('should allow inject a class as a instance generator', () => {
  class User {
    name = 'test';
  }
  provide('userModel').with(User).class();
  const value = inject('userModel');
  assert.instance(value, User);
});

KraftrContext('should allow inject a simple string', () => {
  provide('password').with('this-is-a-password');
  const value = inject('password');
  assert.is(value, 'this-is-a-password');
});

KraftrContext('should allow have nested scopes without modify parent is value', () => {
  provide('name').with('Carlos');
  const name = inject('name');

  createContext(() => {
    provide('name').with('Juan');
    const name = inject('name');
    assert.is(name, 'Juan');
  });

  assert.is(name, 'Carlos');
});

KraftrContext('should allow pass from parent to child values', () => {
  provide('date').with('01/01/20').in(BindingScope.SINGLETON);
  createContext(() => {
    const date = inject<string>('date');
    assert.is(date, '01/01/20');
  });
});

KraftrContext('returns the function as it when is type constant', () => {
  const fn = () => 'any value';

  provide('function').with(fn).constant();

  const value = inject('function');
  assert.is(value, fn);
});

KraftrContext('returns the same value from differents scopes', () => {
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

  assert.is(value, value2);
});

KraftrContext(
  'returns the same value from function when is marked as singleton for class',
  () => {
    class Client {}

    provide('client').with(Client).class().in(BindingScope.SINGLETON);

    const value = inject('client');
    const value2 = inject('client');
    assert.is(value, value2);
  }
);

KraftrContext(
  'when is injected a singleton return the same class instance everytime',
  () => {
    class Client {
      name = 'test';
    }
    provide('client').with(Client).class().in(BindingScope.SINGLETON);
    const value = inject('client');
    const value2 = inject('client');
    assert.is(value, value2);
  }
);

KraftrContext('returns a new value ignoring cache', () => {
  let v = 0;
  const fn = () => v++;

  provide('nextNumber').with(fn).in(BindingScope.TRANSIENT);

  const value = inject('nextNumber');
  const value2 = inject('nextNumber');
  assert.is.not(value, value2);
});

KraftrContext('returns a new instance of the object', () => {
  class Client {
    name = 'testName';
  }
  provide('client').with(Client).class().in(BindingScope.TRANSIENT);
  const value = inject('client');
  const value2 = inject('client');
  assert.is.not(value, value2);
});

KraftrContext('return the same value from while is inside the same scope', () => {
  let val = 0;
  const fn = () => val++;

  provide('test').with(fn).in(BindingScope.APPLICATION);

  const value = inject('test');
  const value2 = inject('test');
  assert.is(value, value2);
});

KraftrContext(
  'when is injected as application scope return the same class instance everytime',
  () => {
    class PasswordService {
      createPassword() {}
    }
    provide('passwordService').with(PasswordService).class().in(BindingScope.APPLICATION);
    const value = inject('passwordService');

    const value2 = inject('passwordService');
    assert.is(value, value2);
  }
);

KraftrContext('return the same value from while is inside the same scope', () => {
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

  assert.is.not(value, value2);
});

KraftrContext(
  'when is injected as application scope return the same class even in nested scopes',
  () => {
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

    assert.is.not(value, value2);
  }
);

KraftrContext.run();
