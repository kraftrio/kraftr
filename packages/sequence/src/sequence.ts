import { createLogger, F } from '@kraftr/common';
import {
  ANY_TAG_VALUE,
  BindingAddress,
  BindingKey,
  filterByTag,
  includesTagValue,
  inject,
  provide
} from '@kraftr/context';
import { DependentBindTags, Middleware, NextFn, Sequence } from './types';
import { orderMiddlewares } from './utils';

const logger = createLogger('kraftr:sequence:runner');

function runMiddleware(
  addresses: BindingAddress<Middleware>[],
  next: NextFn = () => {},
  start: number = 0
): Promise<void> | void {
  const address = addresses[start];

  if (!address) return next();

  const middleware = inject(address);

  logger.debug('running middleware', address);

  return middleware(() => runMiddleware(addresses, next, start + 1));
}

export function createSequence<T extends BindingAddress>(
  chain: BindingAddress,
  defaultGroups?: T[]
): Sequence<T> {
  logger.debug('Creating sequence %s', chain);

  const filter = filterByTag<DependentBindTags>({
    extensionFor: includesTagValue(chain),
    group: ANY_TAG_VALUE
  });

  const fn = ((next) => {
    const sortedAddresses = orderMiddlewares(filter, defaultGroups);
    logger.debug('sorted addresses %o', sortedAddresses);

    return runMiddleware(sortedAddresses, next);
  }) as Sequence;

  fn.provide = (group, middleware, streams) => {
    provide(BindingKey.generate())
      .tag('group', group)
      .tag('extensionFor', chain)
      .tag('upstream', streams?.upstream ?? [])
      .tag('downstream', streams?.downstream ?? [])
      .with(middleware);
  };

  return fn;
}
