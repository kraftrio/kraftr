import { OkErr, shelter } from '../../src';
import { Throws, ErrorMetadata, ValueMetadata } from '../../src/types';
import { AnyObject, check, checks, extend, Pass } from './utils';

type Value1 = number & Throws<Error>;

function parse(_: string): Record<string, unknown> & Throws<SyntaxError> {
  return {} as Record<string, unknown> & Throws<SyntaxError>;
}
const res = shelter(() => parse(''));

checks([
  extend<typeof res, OkErr<AnyObject, SyntaxError>, Pass>(),
  check<ValueMetadata<Value1>, number, Pass>(),
  check<ErrorMetadata<number>, Error, Pass>(),
  check<ErrorMetadata<number>, Error, Pass>()
]);
