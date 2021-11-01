import { F } from 'ts-toolbelt';
import { isPromiseLike } from '../utils';
import { ContextNotFound, ScopeNotFound } from '../errors';
import { Throws } from '@kraftr/errors';
import { Context } from './context';

let currentContext: Context | undefined;

/**
 * Get the actual context can throw an exception since try running injection outside of context is undesirable
 * @returns Actual context
 */
export function getContext(): Context & Throws<ContextNotFound> {
  if (!currentContext) {
    throw new ContextNotFound();
  }
  return currentContext;
}

export function setContext(ctx: Context): void {
  currentContext = ctx;
}

export function openContext(): void {
  currentContext = new Context();
}

export function closeContext(): void {
  currentContext = undefined;
}

export function useContext(ctx: Context, fn: (ctx: Context) => void): void;
export function useContext<T>(ctx: Context, fn: (ctx: Context) => Promise<T>): Promise<T>;
export function useContext<T>(ctx: Context, fn: (ctx: Context) => T): T;

export function useContext<T>(
  ctx: Context,
  fn: F.Function | ((ctx: Context) => Promise<T>)
): T | Promise<T> {
  const oldCtx = currentContext;
  currentContext = ctx;
  const result = fn(ctx);

  if (isPromiseLike(result)) {
    return result.then((value) => {
      currentContext = oldCtx;
      return value;
    });
  }

  currentContext = oldCtx;
  return result;
}

export function createContext(fn: (ctx: Context) => void, scope?: string): void;
export function createContext<T>(
  fn: (ctx: Context) => Promise<T>,
  scope?: string
): Promise<T>;
export function createContext<T>(fn: (ctx: Context) => T, scope?: string): T;

export function createContext<T>(
  fn: (ctx: Context) => Promise<T> | T,
  scope?: string
): Promise<T> | T | void {
  const context = new Context(currentContext);
  if (scope) {
    context.scope = scope;
  }
  return useContext(context, fn);
}

export function useScope(
  scope: string,
  fnScoped: F.Function
): void & Throws<ScopeNotFound> {
  const ctx = getContext();
  const resolvedCtx = ctx.getScopedContext(scope);
  if (!resolvedCtx) {
    throw new ScopeNotFound();
  }
  useContext(resolvedCtx, fnScoped);
}
