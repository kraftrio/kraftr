import { ErrorMetadata, Return, ValueMetadata } from '../../src';
import { AnyObject, check, checks, Fail, Pass } from './utils';

class TestError extends Error {
  public readonly key = '2';
}

checks([
  check<ErrorMetadata<Return<number | null, TestError>>, TestError, Pass>(),
  check<ValueMetadata<Return<number | null, TestError>>, number | null, Pass>(),
  check<ValueMetadata<Return<number | null, TestError>>, number, Fail>(),

  check<ErrorMetadata<Return<number, TestError>>, TestError, Pass>(),
  check<ErrorMetadata<Return<void, TestError>>, TestError, Pass>(),
  check<ErrorMetadata<Return<null, TestError>>, TestError, Pass>(),
  check<ErrorMetadata<Return<undefined, TestError>>, TestError, Pass>(),

  check<ErrorMetadata<Return<AnyObject, TestError>>, TestError, Pass>(),
  check<ErrorMetadata<Return<AnyObject, TestError>>, TestError, Pass>(),
  check<ErrorMetadata<Return<AnyObject, TestError>>, Error, Fail>(),

  check<ValueMetadata<Return<AnyObject, TestError>>, AnyObject, Pass>(),
  check<ValueMetadata<Return<number, TestError>>, number, Pass>(),
  check<ValueMetadata<Return<undefined, TestError>>, undefined, Pass>(),
  check<ValueMetadata<Return<void, TestError>>, void, Pass>(),
  check<ValueMetadata<Return<null, TestError>>, null, Pass>()
]);
