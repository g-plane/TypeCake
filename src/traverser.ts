import type * as n from './ast'
import type { GetNodeByType } from './utils'

export interface NodeVisitor<N extends n.Node> {
  enter?(node: N): void
  exit?(node: N): void
}

export type Visitors = {
  [K in n.Node['type']]?: NodeVisitor<GetNodeByType<K>>
}

export function createTraverser(
  visitors: Visitors
): (program: n.Program) => n.Program {
  function visit(node: n.Node) {
    const visitor = visitors[node.type] as NodeVisitor<n.Node>
    visitor?.enter?.(node)
    visitEachChild(node, visit)
    visitor?.exit?.(node)
  }

  return (program: n.Program) => visitNode(program, visit)
}

export interface VisitorFunction {
  (node: n.Node): void
}

export function visitNode<N extends n.Node>(
  node: N,
  visitor: VisitorFunction
): N {
  visitor(node)
  return node
}

export function visitEachChild<N extends n.Node>(
  node: N,
  visitor: VisitorFunction
): N {
  switch (node.type) {
    case 'Program':
      node.statements.forEach((statement) => visitNode(statement, visitor))
      break
    case 'Identifier':
      break
    case 'Literal':
      break
    case 'TemplateLiteralExpression':
      node.quasis.forEach((element, index) => {
        visitNode(element, visitor)
        const expression = node.expressions[index]
        if (expression) {
          visitNode(expression, visitor)
        }
      })
    case 'TemplateElement':
      break
    case 'TupleExpression':
      node.elements.forEach((element) => visitNode(element, visitor))
      break
    case 'RestElement':
      visitNode(node.expression, visitor)
      break
    case 'ArrayExpression':
      visitNode(node.element, visitor)
      break
    case 'IntersectionExpression':
      node.expressions.forEach((expression) => visitNode(expression, visitor))
      break
    case 'UnionExpression':
      node.expressions.forEach((expression) => visitNode(expression, visitor))
      break
    case 'ObjectExpression':
      node.properties.forEach((property) => visitNode(property, visitor))
      break
    case 'ObjectExpressionProperty':
      visitNode(node.key, visitor)
      visitNode(node.value, visitor)
      break
    case 'IndexedPropertyKey':
      visitNode(node.id, visitor)
      visitNode(node.expression, visitor)
      break
    case 'NamespaceAccessExpression':
      visitNode(node.namespace, visitor)
      visitNode(node.key, visitor)
      break
    case 'MacroCallExpression':
      visitNode(node.id, visitor)
      node.arguments.forEach((argument) => visitNode(argument, visitor))
      break
    case 'CallExpression':
      visitNode(node.callee, visitor)
      node.arguments.forEach((argument) => visitNode(argument, visitor))
      break
    case 'PipelineExpression':
      visitNode(node.source, visitor)
      visitNode(node.transformer, visitor)
      break
    case 'IndexedAccessExpression':
      visitNode(node.object, visitor)
      visitNode(node.index, visitor)
      break
    case 'ParenthesizedExpression':
      visitNode(node.expression, visitor)
      break
    case 'SwitchExpression':
      visitNode(node.expression, visitor)
      node.arms.forEach((arm) => visitNode(arm, visitor))
      break
    case 'SwitchExpressionArm':
      visitNode(node.pattern, visitor)
      visitNode(node.body, visitor)
      break
    case 'IfExpression':
      node.conditions.forEach((condition) => visitNode(condition, visitor))
      visitNode(node.consequent, visitor)
      visitNode(node.alternate, visitor)
      break
    case 'SubtypeRelation':
      visitNode(node.expression, visitor)
      visitNode(node.constraint, visitor)
      break
    case 'ConstInExpression':
      node.bindings.forEach((binding) => visitNode(binding, visitor))
      visitNode(node.body, visitor)
      break
    case 'ConstInBinding':
      visitNode(node.id, visitor)
      visitNode(node.expression, visitor)
      break
    case 'ForExpression':
      visitNode(node.each, visitor)
      visitNode(node.collection, visitor)
      if (node.mapper) {
        visitNode(node.mapper, visitor)
      }
      visitNode(node.body, visitor)
      break
    case 'FunctionDeclaration':
      visitNode(node.id, visitor)
      node.parameters.forEach((parameter) => visitNode(parameter, visitor))
      visitNode(node.body, visitor)
      break
    case 'Parameter':
      visitNode(node.id, visitor)
      if (node.constraint) {
        visitNode(node.constraint, visitor)
      }
      if (node.defaultType) {
        visitNode(node.defaultType, visitor)
      }
      break
    case 'InferReference':
      visitNode(node.id, visitor)
      break
    case 'TypeOperator':
      visitNode(node.expression, visitor)
      break
    case 'ImportDeclaration':
      visitNode(node.source, visitor)
      node.specifiers.forEach((specifier) => visitNode(specifier, visitor))
      break
    case 'ImportDefaultSpecifier':
      visitNode(node.local, visitor)
      break
    case 'ImportNamespaceSpecifier':
      visitNode(node.local, visitor)
      break
    case 'ImportNamedSpecifier':
      visitNode(node.imported, visitor)
      visitNode(node.local, visitor)
      break
  }

  return node
}
