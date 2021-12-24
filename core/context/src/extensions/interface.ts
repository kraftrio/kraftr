export const ExtensionPointName = Symbol();

export type ExtensionPoint = {
  [ExtensionPointName]: string;
};
