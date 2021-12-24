import type { Binding, TagMap } from './binding';
import { AnyObject } from '../types';

export type BindingFilter<Tags extends AnyObject = AnyObject> = {
  (binding: Binding<unknown, any>): binding is Binding<unknown, Tags>;
};

/**
 * A function to check if a given tag value match for `filterByTag`
 */
export type TagValueMatcher<
  Tags extends Record<string, unknown> = Record<string, unknown>
> = {
  /**
   * Check if the given tag value matches the search criteria
   * @param tagValue - Tag value from the binding
   * @param tagName - Tag name
   * @param tagMap - Tag map from the binding
   */
  (tagValue: Tags[keyof Tags], tagName: keyof Tags, tagMap: TagMap<Tags>): boolean;
};

/**
 * Create a tag value matcher function that returns `true` if the target tag
 * value equals to the item value or is an array that includes the item value.
 * @param itemValues - A list of tag item value
 */
export function includesTagValue<
  Tags extends Record<string, unknown> = Record<string, unknown>
>(
  ...itemValues: Array<
    Tags[keyof Tags] extends unknown[] ? Tags[keyof Tags][number] : Tags[keyof Tags]
  >
): TagValueMatcher<Tags> {
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

export function filterByTag<
  Tags extends Record<string, unknown> = Record<string, unknown>
>(tagMap: {
  [Key in keyof Tags]?: TagValueMatcher<Record<Key, Tags[Key]>>;
}): BindingFilter<Tags>;

export function filterByTag<
  Tags extends Record<string, unknown> = Record<string, unknown>
>(tagMap: Partial<Tags>): BindingFilter<Tags>;

/**
 * Create a binding filter for the tag pattern
 * @param tagPattern - Binding tag name, regexp, or object
 */
export function filterByTag(tagMap: Record<string, unknown>) {
  return (b: Binding) => {
    for (const t in tagMap) {
      if (!b.tagMap || !matchTagValue(tagMap[t], t, b.tagMap)) return false;
    }
    // All tag name/value pairs match
    return true;
  };
}
