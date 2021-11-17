import { OkErr, OkErrPromise, Return, shelter, TSError } from '../../src';
import { check, checks, Fail, Pass } from './utils';

const sh1 = shelter(() => {});
const sh2 = shelter(() => new Promise(() => {}));
const sh3 = shelter(new Promise(() => {}));
function sh4Fn(): Return<void, Error> {}
function sh5Fn(): Return<any, Error> {}

const sh4 = shelter(sh4Fn);
const sh5 = shelter(sh5Fn);

checks([
  check<typeof sh1, OkErr<void, Error>, Pass>(),
  check<typeof sh2, OkErrPromise<unknown, Error>, Pass>(),
  check<typeof sh3, OkErrPromise<unknown, Error>, Pass>(),
  check<typeof sh4, OkErr<void, Error>, Pass>(),
  check<typeof sh5, OkErr<never, Error>, Fail>(),
  check<typeof sh5, OkErr<any, Error>, Pass>(),
  check<
    TSError<'ReadError', "file doesn't exists">,
    {
      name: 'ReadError';
      message: "file doesn't exists";
    } & Error,
    Pass
  >(),
  check<
    TSError<'ReadError'>,
    {
      name: 'ReadError';
      message: '';
    } & Error,
    Pass
  >(),
  check<
    TSError,
    {
      name: 'Error';
      message: '';
    } & Error,
    Pass
  >()
]);
