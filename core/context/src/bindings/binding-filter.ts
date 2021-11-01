import { Binding } from './binding';

export type BindingFilter = {
  (binding: Readonly<Binding<unknown>>): boolean;
};

/**
 * A function to check if a given tag value is matched for `filterByTag`
 */
export type TagValueMatcher = {
  /**
   * Check if the given tag value matches the search criteria
   * @param tagValue - Tag value from the binding
   * @param tagName - Tag name
   * @param tagMap - Tag map from the binding
   */
  (tagValue: unknown, tagName: string, tagMap: Map<string, unknown>): boolean;
};

/**
 * Create a tag value matcher function that returns `true` if the target tag
 * value equals to the item value or is an array that includes the item value.
 * @param itemValues - A list of tag item value
 */
export function includesTagValue(...itemValues: unknown[]): TagValueMatcher {
  return (tagValue) => {
    return itemValues.some(
      (itemValue) =>
        // The tag value equals the item value
        tagValue === itemValue ||
        // The tag value contains the item value
        (Array.isArray(tagValue) && tagValue.includes(itemValue))
    );
  };
}

function matchTagValue(
  tagValueOrMatcher: unknown,
  tagName: string,
  tagMap: Map<string, unknown>
) {
  const tagValue = tagMap.get(tagName);
  if (tagValue === tagValueOrMatcher) return true;

  if (typeof tagValueOrMatcher === 'function') {
    return tagValueOrMatcher(tagValue, tagName, tagMap);
  }
  return false;
}

/**
 * Create a binding filter for the tag pattern
 * @param tagPattern - Binding tag name, regexp, or object
 */
export function filterByTag(tagMap: Record<string, unknown>): BindingFilter {
  return (b) => {
    for (const t in tagMap) {
      if (!matchTagValue(tagMap[t], t, b.tagMap)) return false;
    }
    // All tag name/value pairs match
    return true;
  };
}
