import { createLogger } from '@kraftr/common';
import { Return } from '@kraftr/errors';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { isPromise } from 'node:util/types';

const logger = createLogger('kraftr:core:components');

const INSTALL = Symbol('install');

export type Component = {
  [INSTALL]: () => void;
};
export type AsyncComponent = {
  [INSTALL]: () => Promise<void>;
};

/**
 * Make an object auto installable by `useComponent()`
 *
 * @public
 * @param fn setup function for the component
 */
export function component<T extends () => Promise<void>>(
  fn: T
): Return<T & AsyncComponent, Error>;

/**
 * Make an object auto installable by `useComponent()`
 *
 * @public
 * @param fn setup function for the component
 */
export function component<T extends () => void>(fn: T): Return<T & Component, Error>;

/**
 * Make an object auto installable by `useComponent()`
 *
 * @public
 * @param obj to provide an install function
 * @param fn setup function for the component
 */
export function component<T>(
  obj: T,
  fn: () => void | Promise<void>
): Return<T & Component, Error>;

export function component(obj: unknown, fn?: () => void | Promise<void>) {
  const value = !!fn ? fn : obj;

  if (!value || !(value instanceof Function)) {
    throw new TypeError('Component function must be callable');
  }
  return Object.defineProperty(obj, INSTALL, { value, enumerable: false });
}

export function useComponent(component: AsyncComponent): Promise<void>;
export function useComponent(path: string): Promise<void>;
export function useComponent(paths: string[]): Promise<void>;
export function useComponent(component: Component): void;
export function useComponent(components: Component[]): void;
export function useComponent(
  components: (AsyncComponent | Component | string)[]
): Promise<void>;

export function useComponent(
  componentOrPath:
    | Component
    | AsyncComponent
    | string
    | (AsyncComponent | Component | string)[]
    | string[]
): Promise<void> | void {
  const components = Array.isArray(componentOrPath) ? componentOrPath : [componentOrPath];
  const promises: (Promise<void> | void)[] = [];

  for (const compOrPath of components) {
    if (typeof compOrPath === 'string') {
      promises.push(load(compOrPath));
    } else {
      promises.push(compOrPath[INSTALL]());
    }
  }
  if (promises.some(isPromise)) return Promise.all(promises) as unknown as Promise<void>;
}

/**
 * Check if obj is a component (auto installable)
 *
 * @param obj to check
 * @returns if the object is a component
 */
export function isComponent(obj: unknown): obj is Component | AsyncComponent {
  return obj instanceof Object && INSTALL in obj;
}

async function load(folder: string) {
  const fullPath = path.resolve(folder);

  logger.debug(`loading components from ${fullPath}`);
  const files = await readdir(fullPath);

  for (const file of files) {
    const absPath = path.join(fullPath, file);
    const _module = await import(absPath);

    const _exports = Object.entries(_module);

    for (const [name, _export] of _exports) {
      if (isComponent(_export)) {
        logger.debug(`installing component: "${name}", type [${typeof _export}]`);

        const install = _export[INSTALL];
        await install();
      } else {
        logger.debug(`skipping component: "${name}", type [${typeof _export}]`);
      }
    }
  }
}
