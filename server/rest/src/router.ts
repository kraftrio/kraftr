/**
 * Router based on https://github.com/lukeed/trouter
 */

import { BindingAddress } from '@kraftr/core';
import { parse } from 'regexparam';
import { isRegExp } from 'node:util/types';
import type { ControllerBuilder } from './hooks';
import { HTTPMethod } from './hooks/utils';

export type RouteHandler = BindingAddress<ControllerBuilder>;
export type ResolvedRoute = {
  params: Record<string, string>;
  handler: RouteHandler | undefined;
};

export type Route = {
  handler: RouteHandler;
  method: string;
  pattern: RegExp;
  keys: string[] | false;
};

type TreeRoute = {
  [key: string]: TreeRoute;
};

export class Router {
  routes: Route[] = [];
  tree: TreeRoute = {};
  regex: RegExp[] = [];

  add(method: HTTPMethod, route: string | RegExp, handler: RouteHandler): this;
  add(method: string, route: string | RegExp, handler: RouteHandler): this;
  add(method: string, route: string | RegExp, handler: RouteHandler) {
    if (isRegExp(route)) {
      this.routes.push({ keys: false, pattern: route, method, handler });
    } else {
      let { keys, pattern } = parse(route);
      this.routes.push({ keys, pattern, method, handler });
    }

    return this;
  }

  find(method: HTTPMethod, url: string): ResolvedRoute;
  find(method: string, url: string): ResolvedRoute;
  find(method: string, url: string): ResolvedRoute {
    const isHEAD = method === 'HEAD';

    for (let idx = this.routes.length - 1; idx >= 0; idx--) {
      const route = this.routes[idx];
      if (!route) continue;

      const isEquivalentGet = isHEAD && route.method === 'GET';
      if (route.method !== '' && route.method !== method && !isEquivalentGet) continue;

      if (route.keys !== false && route.keys.length === 0 && route.pattern.test(url))
        return { params: {}, handler: route.handler };

      const matches = route.pattern.exec(url);
      if (matches === null) continue;
      const params = matches.groups ?? {};

      if (route.keys === false) return { handler: route.handler, params };

      if (route.keys.length === 0) continue;

      for (let j = 0; j < route.keys.length; ) params[route.keys[j]!] = matches[++j]!;

      return { handler: route.handler, params };
    }

    return { params: {}, handler: undefined };
  }
}
