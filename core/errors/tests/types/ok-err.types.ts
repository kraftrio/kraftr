import { Ok, OkErr, shelter, Throws, Return, TSError, Err } from '../../dist';
import { AnyObject, check, checks, Pass } from './utils';

function parse(_: string): Return<Record<string, unknown>, SyntaxError> {
  return {};
}
const res = shelter(() => parse(''));
const chk1 = Err('CHK1');
const chk2 = (Ok('CHK1') as OkErr<string, Error>).value();

function noNegative(value: number) {
  if (value < 0) {
    return Err('NonNegative');
  }

  return Ok(value);
}

const chk3 = noNegative(23).value();

checks([
  check<typeof res, OkErr<AnyObject, SyntaxError>, Pass>(),
  check<typeof chk1, Err<TSError<'Error', 'CHK1'>>, Pass>(),
  check<typeof chk2, string | void | Throws<Error>, Pass>(),
  check<typeof chk3, number | void | Throws<TSError<'Error', 'NonNegative'>>, Pass>()
]);
