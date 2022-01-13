import { inject, Return, useMetadata } from '@kraftr/core';
import { parse } from 'regexparam';
import { HttpBindings, HttpMetadata } from '../bindings';
import { defineMethod } from './method';
import type { HTTPMethod, RecordBind, RouteParamsBinds } from './utils';

export function definePath<T extends string>(path: T): RouteParamsBinds<T>;
export function definePath<T extends Record<string, unknown>>(
  path: string
): Return<RecordBind<T>, TypeError>;

export function definePath<T extends string>(
  method: HTTPMethod,
  path: T
): Return<RouteParamsBinds<T>, TypeError>;
export function definePath<T extends string>(
  method: string,
  path: T
): Return<RouteParamsBinds<T>, TypeError>;

export function definePath<T extends Record<string, unknown>>(
  method: HTTPMethod,
  path: string
): Return<RecordBind<T>, TypeError>;
export function definePath<T extends Record<string, unknown>>(
  method: string,
  path: string
): Return<RecordBind<T>, TypeError>;

export function definePath(methodOrPath: string, mayPath?: string) {
  if (
    typeof methodOrPath !== 'string' ||
    (mayPath !== undefined && typeof mayPath !== 'string')
  ) {
    throw new TypeError('params must be strings');
  }

  let path: string;
  let method = 'GET';

  if (mayPath) {
    path = mayPath;
    method = methodOrPath;
  } else {
    path = methodOrPath;
    method = 'GET';
  }
  defineMethod(method);

  const { keys } = parse(path);
  const meta = useMetadata(HttpMetadata.CONTROLLER);
  meta.extend({ path, parameters: [] });

  if (keys.length > 0) {
    meta.extend({
      parameters: keys.map((name) => ({ name, in: 'path' }))
    });
  }

  return Object.fromEntries(
    keys.map((key) => [
      key,
      {
        get value() {
          return inject.deep(HttpBindings.Request.PARAMS, key);
        }
      }
    ])
  );
}
