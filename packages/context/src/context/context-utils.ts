import { createLogger } from '@kraftr/common';
import type { Return } from '@kraftr/errors';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ContextNotFound, ScopeNotFound } from '../errors';
import { Context } from './context';

const logger = createLogger('kraftr:context:manager');

const storage = new AsyncLocalStorage<Context>();

/**
 * Get the actual context can throw an exception since try running injection without context is undesirable
 * @returns Actual context
 */
export function getContext(): Return<Context, ContextNotFound> {
  const currentContext = storage.getStore();
  if (!currentContext) {
    throw new ContextNotFound();
  }
  return currentContext;
}
export function openContext(scope?: string) {
  storage.enterWith(new Context());
  if (scope) {
    getContext()!.scope = scope;
  }
  return getContext();
}

export function closeContext(): void {
  storage.disable();
}

export function useContext<T>(ctx: Context, fn: (ctx: Context) => Promise<T>): Promise<T>;
export function useContext<T>(ctx: Context, fn: (ctx: Context) => T): T;
export function useContext(ctx: Context, fn: (ctx: Context) => void): void;

export function useContext<T>(
  ctx: Context,
  fn: (ctx: Context) => Promise<T> | T
): T | Promise<T> {
  const currentContext = storage.getStore();
  logger.debug(
    `Switching ctx ${currentContext?.name ?? 'None'}(scope: ${
      currentContext?.scope ?? 'None'
    }) -> ${ctx?.name ?? 'None'}(scope: ${ctx?.scope ?? 'None'})`
  );
  return storage.run(ctx, () => fn(ctx));
}

export function createContext<T>(
  fn: (ctx: Context) => Promise<T>,
  scope?: string
): Promise<T>;
export function createContext<T>(fn: (ctx: Context) => T, scope?: string): T;
export function createContext(fn: (ctx: Context) => void, scope?: string): void;

export function createContext<T>(
  fn: (ctx: Context) => Promise<T> | T,
  scope?: string
): Promise<T> | T | void {
  const context = new Context(fn.name?.length > 0 ? fn.name : 'context', getContext());
  if (scope) {
    context.scope = scope;
  }
  return useContext(context, fn);
}

export function useScope(
  scope: string,
  fnScoped: () => void
): Return<void, ScopeNotFound> {
  const ctx = getContext();
  const resolvedCtx = ctx.getScopedContext(scope);
  if (!resolvedCtx) {
    throw new ScopeNotFound();
  }
  useContext(resolvedCtx, fnScoped);
}
