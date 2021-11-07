import type { ParserServices, TSESLint } from '@typescript-eslint/experimental-utils';
import { TypeChecker } from 'typescript';

export type TSServices = {
  parserServices: ParserServices;
  checker: TypeChecker;
};

export function getTSServices(
  context: TSESLint.RuleContext<string, unknown[]>
): TSServices {
  const parserServices = context.parserServices;
  const checker = parserServices?.program?.getTypeChecker();

  if (!checker || !parserServices) {
    throw new Error(
      'types not available, maybe you need set the parser to @typescript-eslint/parser'
    );
  }
  return { parserServices, checker };
}

export enum MessagesIds {
  RETURN_THROW = 'returnThrow'
}
