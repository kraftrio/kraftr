import { unionTypeParts } from 'tsutils';
import type { Rule } from 'eslint';
import type { ParserServices } from '@typescript-eslint/parser';
import type { TypeChecker, Node } from 'typescript';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';

function isResultLike(checker: TypeChecker, node: Node): boolean {
  const type = checker.getTypeAtLocation(node);
  for (const ty of unionTypeParts(checker.getApparentType(type))) {
    const value = ty.getProperty('value');
    const isOk = ty.getProperty('isOk');
    if (value === undefined || isOk === undefined) {
      continue;
    }
    const valueType = checker.getTypeOfSymbolAtLocation(value, node);
    for (const type of unionTypeParts(valueType)) {
      if (type.getCallSignatures().some((sig) => sig.parameters.length === 0)) {
        return true;
      }
    }
  }
  return false;
}

function isUnhandledResult(parserService: ParserServices, node: TSESTree.Node): boolean {
  const checker = parserService.program.getTypeChecker();
  if (node.type === AST_NODE_TYPES.SequenceExpression) {
    return node.expressions.some((item) => isUnhandledResult(parserService, item));
  }

  if (!isResultLike(checker, parserService.esTreeNodeToTSNodeMap.get(node as never))) {
    return false;
  }

  if (node.type === AST_NODE_TYPES.CallExpression) {
    return !(
      node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.property.type === AST_NODE_TYPES.Identifier &&
      node.callee.property.name === 'value' &&
      node.arguments.length === 0
    );
  }

  if (node.type === AST_NODE_TYPES.ConditionalExpression) {
    return (
      isUnhandledResult(parserService, node.alternate) ||
      isUnhandledResult(parserService, node.consequent)
    );
  }

  if (
    node.type === AST_NODE_TYPES.MemberExpression ||
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.NewExpression
  ) {
    // If it is just a property access chain or a `new` call (e.g. `foo.bar` or
    // `new Promise()`), the promise is not handled because it doesn't have the
    // necessary then/catch call at the end of the chain.
    return true;
  }

  return false;
}
export const noUnusedResult = {
  meta: {
    type: 'problem',
    messages: {
      'not-handle-result': 'Result must be handled appropriately or explicitly marked as ignored with the `non-null` (!) operator'
    }
  },
  create: function(context: Rule.RuleContext): Rule.RuleListener {
    const parserServices = context.parserServices as ParserServices;
    return {
      ExpressionStatement(node) {
        if (isUnhandledResult(parserServices, node.expression as TSESTree.Node)) {
          context.report({
            node,
            messageId: 'not-handle-result'
          });
        }
      }
    };
  }
}
