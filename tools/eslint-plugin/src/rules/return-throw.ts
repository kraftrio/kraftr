import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { unionTypeParts } from 'tsutils';
import { Type } from 'typescript';
import { getTSServices, MessagesIds, TSServices } from '../utils';

function isThrowType(services: TSServices, node?: TSESTree.Node): boolean {
  if (!node) {
    return false;
  }
  const tsNodeMap = services.parserServices.esTreeNodeToTSNodeMap.get(node);
  const functionType = services.checker.getTypeAtLocation(tsNodeMap);
  let types: Type[] = [];
  if (node.parent?.type === 'MethodDefinition' && node.parent.kind === 'get') {
    types = unionTypeParts(functionType);
  } else {
    const functionSignatures = functionType.getCallSignatures();
    types = functionSignatures.flatMap((signature) =>
      unionTypeParts(signature.getReturnType())
    );
  }

  return types
    .flatMap((type) => type.getProperties())
    .some((property) => /__@errors/.test(property.name));
}

const FUNCTIONS_TYPES = [
  'FunctionDeclaration',
  'ArrowFunctionExpression',
  'FunctionExpression'
];

function hasErrorAtReturn(services: TSServices, node: TSESTree.Node): boolean {
  if (FUNCTIONS_TYPES.includes(node.type)) {
    return isThrowType(services, node);
  }

  if (node.parent) {
    return hasErrorAtReturn(services, node.parent);
  }

  return true;
}

export const returnsThrow: TSESLint.RuleModule<MessagesIds.RETURN_THROW, []> = {
  meta: {
    type: 'problem',
    messages: {
      [MessagesIds.RETURN_THROW]:
        "the function should indicate that it's possible throw an error"
    },
    schema: {}
  },
  create: function (context) {
    const services = getTSServices(context);
    return {
      ThrowStatement(node) {
        if (!hasErrorAtReturn(services, node)) {
          context.report({
            node,
            messageId: MessagesIds.RETURN_THROW
          });
        }
      }
    };
  }
};
