import * as configs from './configs';
import { noUnusedResult } from './rules/no-unused-result';
import { returnsThrow } from './rules/return-throw';

const plugin = {
  rules: {
    'no-unused-result': noUnusedResult,
    'returns-throw': returnsThrow
  },
  configs
};

export = plugin;
