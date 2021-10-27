type RE_SYMBOLS = '(' | ' ';
type SPLIT_SYMBOLS = '.' | '-' | '/';

export type CleanParam<T extends string> = string extends T
  ? T
  : T extends `${infer Param}${SPLIT_SYMBOLS}:${infer Rest}` // /from-:to
  ? Param | CleanParam<Rest>
  : T extends `${infer Param}${RE_SYMBOLS}${infer _}`
  ? Param
  : T;

export type RouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${infer _}:${infer Param}${SPLIT_SYMBOLS}${infer Rest}`
  ? { [k in CleanParam<Param> | keyof RouteParams<Rest>]: string }
  : T extends `${infer _}:${infer Param}`
  ? { [k in CleanParam<Param>]: string }
  : Record<never, never>;
