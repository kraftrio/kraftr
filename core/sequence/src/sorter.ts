import { createLogger } from '@kraftr/common';
import toposort from 'toposort';
const logger = createLogger('kraftr:sequence:middleware-sort');

/**
 * Sort the groups by their relative order
 * @param unorderedGroups - A list of arrays - each of which represents a partial
 * order of groups.
 */
export function sortListOfGroups(...unorderedGroups: string[][]): string[] {
  logger.debug(
    'Dependency graph: %s',
    unorderedGroups.map((edge) => edge.join('->')).join(', ')
  );

  const graph: [string, string][] = [];

  for (const groups of unorderedGroups) {
    if (groups.length >= 2) {
      groups.reduce((prev: string | undefined, group) => {
        if (typeof prev === 'string') {
          graph.push([prev, group]);
        }
        return group;
      }, undefined);
    }
  }

  const sorted = toposort(graph);

  if (sorted.length === 0 && unorderedGroups.flat().length > 0) {
    sorted.push(...unorderedGroups.flat());
  }

  logger.debug('After sort: %s', sorted.join('->'));
  return sorted;
}
