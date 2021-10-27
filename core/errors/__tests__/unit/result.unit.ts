import { Err, Ok, shelter, useErrors } from '../../src';

describe('@kraftr/errors: Result tests', function () {
  describe('useError()', function () {
    it('throw error if there is result without check', function () {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const unhandleError = () =>
        useErrors(() => {
          const _ = Err(Error);
        });

      expect(unhandleError).toThrowError(Error);
    });
    it('works if every error is handle properly', function () {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const handledError = () =>
        useErrors(() => {
          const err = Err(Error);
          if (err.isErr && !err.isOk) {
            // Inform or anything else
          }
        });
      expect(handledError).not.toThrowError();
    });
  });
  describe('Ok()', function () {
    it('returns the value when is ok', function () {
      const result = Ok(23);

      expect(result.value()).toBe(23);
    });
    it('returns the same Ok when is nested', function () {
      const original = Ok(23);
      const result = Ok(original);

      expect(result).toBe(original);
    });
  });

  describe('Err()', function () {
    it('returns the same Err when is nested', function () {
      const original = Err(Error);
      const result = Err(original);

      expect(result).toBe(original);
    });
    it('throw an error if value is called without check', function () {
      const result = Err('TestError', 'Should throw error');

      expect(result.isErr).toBeTruthy();
      expect(() => result.value()).toThrow(/Should throw error/);
    });

    it('allow Err receive constructor as param', function () {
      const result = Err(TypeError, 'invalid param');

      expect(result.isErr).toBeTruthy();
      expect(() => result.value()).toThrow(/invalid param/);
    });

    it('throw an error when is released', function () {
      const result = Err(TypeError, 'invalid param');

      expect(result.isErr).toBeTruthy();
      expect(() => result.release()).toThrow(/invalid param/);
    });

    it('throw an custom error', function () {
      class CustomError extends Error {}
      const result = Err(CustomError, 'invalid param');

      expect(result.isErr).toBeTruthy();
      expect(() => result.release()).toThrow(/invalid param/);
    });
  });

  describe('safe()', function () {
    it('returns the value when is no error', function () {
      const res = shelter(() => {
        return 100;
      });

      expect(res.value()).toBe(100);
      expect(res.isOk).toBeTruthy();
    });

    it('wraps the error when is threw', function () {
      const res = shelter(() => {
        throw new Error('Error');
      });

      expect(res.isErr).toBeTruthy();
      expect(res.error).toBeInstanceOf(Error);
    });

    it('handle async functions rejection', async function () {
      const res = await shelter(() => {
        return new Promise((_, reject) => {
          reject(new Error('invalid promise'));
        });
      });

      expect(res.isErr).toBeTruthy();
      expect(res.error).toBeInstanceOf(Error);
      expect(() => res.release()).toThrow(/invalid promise/);
    });
    it('handle promises', async function () {
      const res = await shelter(
        new Promise((_, reject) => {
          reject('invalid promise');
        })
      );

      expect(res.isErr).toBeTruthy();
      expect(res.error).toBeInstanceOf(Error);
      expect(() => res.release()).toThrow(/invalid promise/);
    });
    it('handle async functions string rejection as well', async function () {
      const res = await shelter(() => {
        return new Promise((_, reject) => {
          reject('invalid promise');
        });
      });

      expect(res.isErr).toBeTruthy();
      expect(res.error).toBeInstanceOf(Error);
      expect(() => res.release()).toThrow(/invalid promise/);
    });
  });
});
