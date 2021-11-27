/**
 * Scope not defined
 */
export class ScopeNotFound extends Error {
  override readonly message = 'Scoped not was found';
}

/**
 * Use of binds without context
 */
export class ContextNotFound extends Error {
  override readonly name = 'SourceNotDefined';
  override readonly message = 'The resolution context is not found';
}

/**
 * A binding source was not defined with "with"
 */
export class SourceNotDefined extends Error {
  override readonly name = 'SourceNotDefined';

  constructor(message: string) {
    super(`Source for binding '${message}' is not defined`);
  }
}
/**
 * A binding key was not found
 */
export class KeyNotFound extends Error {
  override readonly name = 'KeyNotFound';
  constructor(key?: string) {
    super(`BindingKey '${key}' not found`);
  }
}

/**
 * Trying to write to a readonly binding
 */
export class LockError extends Error {
  override readonly name = 'LockError';
  constructor(key?: string) {
    super(`BindingKey '${key}' is locked`);
  }
}
