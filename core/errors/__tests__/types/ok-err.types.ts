import { OkErr, shelter } from '../../src';
import { Throw, ErrorMetadata, ValueMetadata } from '../../src/types';
import { AnyObject, check, checks, extend, Pass } from './utils';

type Value1 = number & Throw<Error>;

function parse(_: string): Record<string, unknown> & Throw<SyntaxError> {
  return {} as Record<string, unknown> & Throw<SyntaxError>;
}
const res = shelter(() => parse(''));

checks([
  extend<typeof res, OkErr<AnyObject, SyntaxError>, Pass>(),
  check<ValueMetadata<Value1>, number, Pass>(),
  check<ErrorMetadata<number>, Error, Pass>(),
  check<ErrorMetadata<number>, Error, Pass>()
]);
