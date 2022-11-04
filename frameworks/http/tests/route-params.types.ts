import { Test } from '@kraftr/common';
import { RouteParams } from '../src/types';

const { checks, check } = Test;

checks([
  check<RouteParams<'/base/:name'>, { name: string }, Test.Pass>(),
  check<RouteParams<'/:base/:name'>, { name: string; base: string }, Test.Pass>(),
  check<RouteParams<'/base/:from-:to'>, { from: string; to: string }, Test.Pass>(),
  check<RouteParams<'/base/:from.:to'>, { from: string; to: string }, Test.Pass>(),
  check<
    RouteParams<'/:base/:from-:to/:id'>,
    { base: string; from: string; to: string; id: string },
    Test.Pass
  >(),
  check<RouteParams<'/base/:name(\\w+)'>, { name: string }, Test.Pass>(),
  check<RouteParams<'/:base(\\w+)/name'>, { base: string }, Test.Pass>()
]);
