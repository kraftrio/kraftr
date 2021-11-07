import { OkErr, shelter } from '../../src';
import { Return } from '../../src/types';
import { AnyObject, check, checks, Pass } from './utils';

function parse(_: string): Return<Record<string, unknown>, SyntaxError> {
  return {};
}

const res = shelter(() => parse(''));

checks([check<typeof res, OkErr<AnyObject, SyntaxError>, Pass>()]);
