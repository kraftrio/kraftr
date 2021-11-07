import { Linter } from 'eslint';
import { lib, base, recommended, all } from './configs';
export type KraftrRules = {
  '@kraftr/no-unused-result': 'error' | 'off';
  '@kraftr/returns-throw': 'error' | 'off';
} & Linter.RulesRecord;

export function useESlint(options: Partial<Linter.Config<KraftrRules>>): Linter.Config {
  require('@rushstack/eslint-patch/modern-module-resolution');
  return options;
}

export { lib, base, recommended, all };
