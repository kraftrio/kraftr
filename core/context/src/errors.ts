export class ScopeNotFound extends Error {
  message = 'Scoped not was found';
}
export class ContextNotFound extends Error {
  message = 'The resolution context is not found';
}
export class SourceNotDefined extends Error {
  constructor(key?: string) {
    super(`Source for binding ${key} is not defined`);
  }
}
export class KeyNotFound extends Error {
  constructor(key?: string) {
    super(`BindingKey ${key} not found`);
  }
}
