import { RouteParams } from './types';
export function path<T extends string>(path: T): RouteParams<T>;
export function path<T extends Record<string, unknown>>(path: string): T;

export function path<T extends string>(path: T): RouteParams<T> {
  return {};
}
