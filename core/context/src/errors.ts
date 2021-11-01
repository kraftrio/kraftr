/**
 * Scope not defined
 */
export class ScopeNotFound extends Error {
  message = 'Scoped not was found';
}

/**
 * Trying to use binds outside of a context
 */
export class ContextNotFound extends Error {
  message = 'The resolution context is not found';
}

/**
 * A binding source was not defined with "with"
 */
export class SourceNotDefined extends Error {
  constructor(key?: string) {
    super(`Source for binding '${key}' is not defined`);
  }
}

/**
 * A binding key was not found
 */
export class KeyNotFound extends Error {
  constructor(key?: string) {
    super(`BindingKey '${key}' not found`);
  }
}

/**
 * Trying to write to a readonly binding
 */
export class LockError extends Error {
  constructor(key?: string) {
    super(`BindingKey '${key}' is locked`);
  }
}
