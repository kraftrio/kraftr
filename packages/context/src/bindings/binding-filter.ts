import { isString, TypedMap } from '@kraftr/common';
import type { Binding } from './binding';

export type BindingFilter = {
  (binding: Readonly<Binding<unknown>>): boolean;
};

/**
 * A function to check if a given tag value match for `filterByTag`
 */
export type TagValueMatcher<
  Value extends Tags[keyof Tags],
  Name extends keyof Tags & string,
  Tags extends Record<string, unknown>
> = {
  /**
   * Check if the given tag value matches the search criteria
   * @param tagValue - Tag value from the binding
   * @param tagName - Tag name
   * @param tagMap - Tag map from the binding
   */
  (tagValue: Value, tagName: Name, tagMap: TypedMap<Tags>): boolean;
};

/**
 * A symbol that can be used to match binding tags by name regardless of the
 * value.
 *
 * @example
 *
 * The following code matches bindings with tag `{controller: 'A'}` or
 * `{controller: 'controller'}`. But if the tag name 'controller' does not
 * exist for a binding, the binding will NOT be included.
 *
 * ```ts
 * ctx.findByTag({controller: ANY_TAG_VALUE})
 * ```
 */
export const ANY_TAG_VALUE: TagValueMatcher<any, string, any> = (_, tagName, tagMap) =>
  tagMap.has(tagName);

export type UnionOf<T> = T extends unknown[] ? T[number] : T;

/**
 * Create a tag value matcher function that returns `true` if the target tag
 * value equals to the item value or is an array that includes the item value.
 * @param itemValues - A list of tag item value
 */
export function includesTagValue<Value, Key extends string>(
  ...items: [...UnionOf<Value>[]]
): TagValueMatcher<Value | Value[], Key, any> {
  return (tagValue) =>
    items.some(
      (value) =>
        // The tag value equals the item value
        tagValue === value ||
        // The tag value contains the item value
        (Array.isArray(tagValue) && tagValue.includes(value as Value))
    );
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

export function filterByTag<Tags extends Record<string, unknown>>(tagMap: {
  [Key in keyof Tags]?:
    | TagValueMatcher<Tags[Key], isString<Key & string, any>, Tags>
    | Tags[Key];
}): BindingFilter;

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
