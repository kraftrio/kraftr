/**
 * Test should pass
 */
export type Pass = 1;
export type Bool = 1 | 0;
/**
 * Test should fail
 */
export type Fail = 0;
export type AnyObject = Record<string, unknown>;

type Equals<F, S> = F extends S ? (S extends F ? Pass : Fail) : Fail;
/**
 * Check or test the validity of a type
 * @param debug to debug with parameter hints (`ctrl+p`, `ctrl+shift+space`)
 * @example
 * ```ts
 * // see in `tst` folder
 * ```
 */
export declare function check<Type, Expect, Outcome extends Bool>(
  debug?: Type
): Equals<Equals<[Type], [Expect]>, Outcome> extends Pass ? 1 : 0;

/**
 * Validates a batch of [[check]]
 * @param checks a batch of [[check]]
 * @example
 * ```ts
 * // see in `tst` folder
 * ```
 */
export declare function checks(checks: 1[]): void;
