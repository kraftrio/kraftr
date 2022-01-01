import { createLogger } from '@kraftr/common';
import { BindingAddress, BindingFilter, inject } from '@kraftr/context';
import { sortListOfGroups } from './sorter';
import { DependentBindTags } from './types';

const logger = createLogger('kraftr:sequence:runner');

export function createDepSequence(
  filter: BindingFilter<DependentBindTags>,
  defaultGroup: BindingAddress[] = []
) {
  const map = new Map<string, BindingAddress>();
  const binds = inject.filtered(filter);

  logger.debug(`Found ${binds.length} binds`);

  if (binds.length === 0) return [];

  const ordersFromDependencies: BindingAddress[][] = [];

  for (const bind of binds) {
    if (!bind.tagMap) continue;

    const group = bind.tagMap.get('group');

    if (!group) continue;
    map.set(group, bind.key);
    const groupsBefore = bind.tagMap.get('upstream') ?? [];

    groupsBefore.forEach((d) => ordersFromDependencies.push([d, group]));

    const groupsAfter = bind.tagMap.get('downstream') ?? [];
    groupsAfter.forEach((d) => ordersFromDependencies.push([group, d]));
  }

  let sorted = sortListOfGroups(...ordersFromDependencies, defaultGroup);

  return sorted.length === 0 && binds.length > 0
    ? /**
       * When there is no a group, run all the bindings associated with
       * this sequence without care about the order
       */
      binds.map((b) => b.key)
    : // get keys for groups
      sorted.map((g) => map.get(g)!);
}
