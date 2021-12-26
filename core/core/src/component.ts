import { Return } from '@kraftr/errors';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { createLogger } from '@kraftr/common';

const logger = createLogger('kraftr:core:components');

const INSTALL = Symbol('install');

export type Component = {
  [INSTALL]: () => void;
};
export type AsyncComponent = {
  [INSTALL]: () => Promise<void>;
};

export function component<T extends () => void | Promise<void>>(
  fn: T
): Return<T & Component, Error>;
export function component<T>(
  obj: T,
  fn: () => void | Promise<void>
): Return<T & Component, Error>;
export function component(obj: unknown, fn?: () => void | Promise<void>) {
  const value = !!fn ? fn : obj;

  if (!value || !(value instanceof Function)) {
    throw new TypeError('Component function must be callable');
  }

  return Object.assign(obj, { [INSTALL]: value });
}

export function useComponent(component: AsyncComponent): Promise<void>;
export function useComponent(component: Component): void;
export function useComponent(component: Component | AsyncComponent) {
  const result = component[INSTALL];

  return result();
}

export function isComponent(obj: unknown): obj is Component | AsyncComponent {
  return obj instanceof Object && INSTALL in obj;
}

export async function load(folder: string) {
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
