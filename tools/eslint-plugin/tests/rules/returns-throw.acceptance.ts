import { TSESLint } from '@typescript-eslint/experimental-utils';
import { returnsThrow } from '../../src/rules/return-throw';
import { MessagesIds } from '../../src/utils';

const THROW_TYPE = `
declare const errors: unique symbol;

type MetaError<ErrorType extends Error> = {
  [errors]: ErrorType;
};

export type Throws<ErrorType extends Error, ReturnType> = [ReturnType] extends [null]
  ? [null] extends [ReturnType]
    ? MetaError<ErrorType>
    : [ReturnType] extends [never]
    ? MetaError<ErrorType>
    : never
  : [ReturnType] extends [undefined]
  ? MetaError<ErrorType>
  : MetaError<ErrorType> & ReturnType;

export type Return<ReturnTypes, ErrorTypes extends Error> =
  | ReturnTypes
  | Throws<ErrorTypes, ReturnTypes>;
`;

new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser')
}).run('returns-throw', returnsThrow, {
  valid: [
    `// it's ok if Throws is used
    function test(): Return<never, Error> {
      throw new Error('');
    }
    ` + THROW_TYPE,
    `// it's ok if the function don't return error
    function test(): Return<number, Error> {
      if(x) {
        throw new Error('')
      }
      return 23;
    }
    ` + THROW_TYPE,
    `// it's ok if has a union
    function test<E>(val: E): Return<E | string, Error> {
      if(x) {
        throw new Error('')
      }
      return 23;
    }
    ` + THROW_TYPE,
    `// it's ok if is a class getter
    class Dog {
      get name(): Return<string, Error> {
        if(this.isDead) {
          throw new Error('')
        }
        return 'dog';
      }
    }
    ` + THROW_TYPE,
    `// it's ok if is a class method
    class Dog {
      name(): Return<string, Error> {
        if(this.isDead) {
          throw new Error('')
        }
        return 'dog';
      }
    }
    ` + THROW_TYPE
  ],
  invalid: [
    {
      code:
        `// must return error
    function test(x: string): number {
      if(x === 'value') {
        throw new Error('');
      }
      return 23;
    }
    ` + THROW_TYPE,
      errors: [{ messageId: MessagesIds.RETURN_THROW }]
    },
    {
      code:
        `// throw error even if a similar type is used
      declare const errors: unique symbol;
      type AnotherThrow = {
        errors: Error[]
      }
      function test(): number & AnotherThrow {
        throw new Error('');
      }
      ` + THROW_TYPE,
      errors: [{ messageId: MessagesIds.RETURN_THROW }]
    },
    {
      code:
        `// throw error for class methods
      class Test {
        test(): number {
          throw new Error('');
        }
      }
      ` + THROW_TYPE,
      errors: [{ messageId: MessagesIds.RETURN_THROW }]
    }
  ]
});
