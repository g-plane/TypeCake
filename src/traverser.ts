import type * as n from './ast'
import type { GetNodeByType } from './utils'

export interface NodeVisitor<N extends n.Node> {
  enter?(node: N): N
  exit?(node: N): N
}

export type Visitors = {
  [K in n.Node['type']]?: NodeVisitor<GetNodeByType<K>>
}

type TraversalHandler = {
  [K in n.Node['type'] as `visit${K}`]: (
    node: GetNodeByType<K>
  ) => GetNodeByType<K>
} & {
  visit(node: n.Node): n.Node
}

export function createTraverser(visitors: Visitors) {
  const handler: TraversalHandler = {
    visit(node) {
      switch (node.type) {
        case 'Program':
          return this.visitProgram(node)
        case 'Identifier':
          return this.visitIdentifier(node)
        case 'Literal':
          return this.visitLiteral(node)
        case 'TemplateLiteralExpression':
          return this.visitTemplateLiteralExpression(node)
        case 'TemplateElement':
          return this.visitTemplateElement(node)
        case 'TupleExpression':
          return this.visitTupleExpression(node)
        case 'RestElement':
          return this.visitRestElement(node)
        case 'ArrayExpression':
          return this.visitArrayExpression(node)
        case 'IntersectionExpression':
          return this.visitIntersectionExpression(node)
        case 'UnionExpression':
          return this.visitUnionExpression(node)
        case 'ObjectExpression':
          return this.visitObjectExpression(node)
        case 'ObjectExpressionProperty':
          return this.visitObjectExpressionProperty(node)
        case 'IndexedPropertyKey':
          return this.visitIndexedPropertyKey(node)
        case 'NamespaceAccessExpression':
          return this.visitNamespaceAccessExpression(node)
        case 'MacroCallExpression':
          return this.visitMacroCallExpression(node)
        case 'CallExpression':
          return this.visitCallExpression(node)
        case 'PipelineExpression':
          return this.visitPipelineExpression(node)
        case 'IndexedAccessExpression':
          return this.visitIndexedAccessExpression(node)
        case 'ParenthesizedExpression':
          return this.visitParenthesizedExpression(node)
        case 'SwitchExpression':
          return this.visitSwitchExpression(node)
        case 'SwitchExpressionArm':
          return this.visitSwitchExpressionArm(node)
        case 'IfExpression':
          return this.visitIfExpression(node)
        case 'SubtypeRelation':
          return this.visitSubtypeRelation(node)
        case 'ConstInExpression':
          return this.visitConstInExpression(node)
        case 'ConstInBinding':
          return this.visitConstInBinding(node)
        case 'ForExpression':
          return this.visitForExpression(node)
        case 'FunctionDeclaration':
          return this.visitFunctionDeclaration(node)
        case 'Parameter':
          return this.visitParameter(node)
        case 'InferReference':
          return this.visitInferReference(node)
        case 'TypeOperator':
          return this.visitTypeOperator(node)
        case 'ImportDeclaration':
          return this.visitImportDeclaration(node)
        case 'ImportDefaultSpecifier':
          return this.visitImportDefaultSpecifier(node)
        case 'ImportNamespaceSpecifier':
          return this.visitImportNamespaceSpecifier(node)
        case 'ImportNamedSpecifier':
          return this.visitImportNamedSpecifier(node)
      }
    },
    visitProgram(node) {
      visitors.Program?.enter?.(node)
      node.statements.forEach((statement) => this.visit(statement))
      visitors.Program?.exit?.(node)
      return node
    },
    visitIdentifier(node) {
      visitors.Identifier?.enter?.(node)
      visitors.Identifier?.exit?.(node)
      return node
    },
    visitLiteral(node) {
      visitors.Literal?.enter?.(node)
      visitors.Literal?.exit?.(node)
      return node
    },
    visitTemplateLiteralExpression(node) {
      visitors.TemplateLiteralExpression?.enter?.(node)
      node.quasis.forEach((element, index) => {
        this.visitTemplateElement(element)
        const expression = node.expressions[index]
        if (expression) {
          this.visit(expression)
        }
      })
      visitors.TemplateLiteralExpression?.exit?.(node)
      return node
    },
    visitTemplateElement(node) {
      visitors.TemplateElement?.enter?.(node)
      visitors.TemplateElement?.exit?.(node)
      return node
    },
    visitTupleExpression(node) {
      visitors.TupleExpression?.enter?.(node)
      node.elements.forEach((element) => this.visit(element))
      visitors.TupleExpression?.exit?.(node)
      return node
    },
    visitRestElement(node) {
      visitors.RestElement?.enter?.(node)
      this.visit(node.expression)
      visitors.RestElement?.exit?.(node)
      return node
    },
    visitArrayExpression(node) {
      visitors.ArrayExpression?.enter?.(node)
      this.visit(node.element)
      visitors.ArrayExpression?.exit?.(node)
      return node
    },
    visitIntersectionExpression(node) {
      visitors.IntersectionExpression?.enter?.(node)
      node.expressions.forEach((expression) => this.visit(expression))
      visitors.IntersectionExpression?.exit?.(node)
      return node
    },
    visitUnionExpression(node) {
      visitors.UnionExpression?.enter?.(node)
      node.expressions.forEach((expression) => this.visit(expression))
      visitors.UnionExpression?.exit?.(node)
      return node
    },
    visitObjectExpression(node) {
      visitors.ObjectExpression?.enter?.(node)
      node.properties.forEach((property) =>
        this.visitObjectExpressionProperty(property)
      )
      visitors.ObjectExpression?.exit?.(node)
      return node
    },
    visitObjectExpressionProperty(node) {
      visitors.ObjectExpressionProperty?.enter?.(node)
      this.visit(node.key)
      this.visit(node.value)
      visitors.ObjectExpressionProperty?.exit?.(node)
      return node
    },
    visitIndexedPropertyKey(node) {
      visitors.IndexedPropertyKey?.enter?.(node)
      this.visitIdentifier(node.id)
      this.visit(node.expression)
      visitors.IndexedPropertyKey?.exit?.(node)
      return node
    },
    visitNamespaceAccessExpression(node) {
      visitors.NamespaceAccessExpression?.enter?.(node)
      this.visitIdentifier(node.namespace)
      this.visitIdentifier(node.key)
      visitors.NamespaceAccessExpression?.exit?.(node)
      return node
    },
    visitMacroCallExpression(node) {
      visitors.MacroCallExpression?.enter?.(node)
      this.visitIdentifier(node.id)
      node.arguments.forEach((argument) => this.visit(argument))
      visitors.MacroCallExpression?.exit?.(node)
      return node
    },
    visitCallExpression(node) {
      visitors.CallExpression?.enter?.(node)
      this.visitIdentifier(node.callee)
      node.arguments.forEach((argument) => this.visit(argument))
      visitors.CallExpression?.exit?.(node)
      return node
    },
    visitPipelineExpression(node) {
      visitors.PipelineExpression?.enter?.(node)
      this.visit(node.source)
      this.visit(node.transformer)
      visitors.PipelineExpression?.exit?.(node)
      return node
    },
    visitIndexedAccessExpression(node) {
      visitors.IndexedAccessExpression?.enter?.(node)
      this.visit(node.object)
      this.visit(node.index)
      visitors.IndexedAccessExpression?.exit?.(node)
      return node
    },
    visitParenthesizedExpression(node) {
      visitors.ParenthesizedExpression?.enter?.(node)
      this.visit(node.expression)
      visitors.ParenthesizedExpression?.exit?.(node)
      return node
    },
    visitSwitchExpression(node) {
      visitors.SwitchExpression?.enter?.(node)
      this.visit(node.expression)
      node.arms.forEach((arm) => this.visitSwitchExpressionArm(arm))
      visitors.SwitchExpression?.exit?.(node)
      return node
    },
    visitSwitchExpressionArm(node) {
      visitors.SwitchExpressionArm?.enter?.(node)
      this.visit(node.pattern)
      this.visit(node.body)
      visitors.SwitchExpressionArm?.exit?.(node)
      return node
    },
    visitIfExpression(node) {
      visitors.IfExpression?.enter?.(node)
      node.conditions.forEach((condition) =>
        this.visitSubtypeRelation(condition)
      )
      this.visit(node.consequent)
      this.visit(node.alternate)
      visitors.IfExpression?.exit?.(node)
      return node
    },
    visitSubtypeRelation(node) {
      visitors.SubtypeRelation?.enter?.(node)
      this.visit(node.expression)
      this.visit(node.constraint)
      visitors.SubtypeRelation?.exit?.(node)
      return node
    },
    visitConstInExpression(node) {
      visitors.ConstInExpression?.enter?.(node)
      node.bindings.forEach((binding) => this.visitConstInBinding(binding))
      this.visit(node.body)
      visitors.ConstInExpression?.exit?.(node)
      return node
    },
    visitConstInBinding(node) {
      visitors.ConstInBinding?.enter?.(node)
      this.visitIdentifier(node.id)
      this.visit(node.expression)
      visitors.ConstInBinding?.exit?.(node)
      return node
    },
    visitForExpression(node) {
      visitors.ForExpression?.enter?.(node)
      this.visitIdentifier(node.each)
      this.visit(node.collection)
      if (node.mapper) {
        this.visit(node.mapper)
      }
      this.visit(node.body)
      visitors.ForExpression?.exit?.(node)
      return node
    },
    visitFunctionDeclaration(node) {
      visitors.FunctionDeclaration?.enter?.(node)
      this.visitIdentifier(node.id)
      node.parameters.forEach((parameter) => this.visitParameter(parameter))
      this.visit(node.body)
      visitors.FunctionDeclaration?.exit?.(node)
      return node
    },
    visitParameter(node) {
      visitors.Parameter?.enter?.(node)
      this.visitIdentifier(node.id)
      if (node.constraint) {
        this.visit(node.constraint)
      }
      if (node.defaultType) {
        this.visit(node.defaultType)
      }
      visitors.Parameter?.exit?.(node)
      return node
    },
    visitInferReference(node) {
      visitors.InferReference?.enter?.(node)
      this.visitIdentifier(node.id)
      visitors.InferReference?.exit?.(node)
      return node
    },
    visitTypeOperator(node) {
      visitors.TypeOperator?.enter?.(node)
      this.visit(node.expression)
      visitors.TypeOperator?.exit?.(node)
      return node
    },
    visitImportDeclaration(node) {
      visitors.ImportDeclaration?.enter?.(node)
      this.visitLiteral(node.source)
      node.specifiers.forEach((specfiier) => this.visit(specfiier))
      visitors.ImportDeclaration?.exit?.(node)
      return node
    },
    visitImportDefaultSpecifier(node) {
      visitors.ImportDefaultSpecifier?.enter?.(node)
      this.visitIdentifier(node.local)
      visitors.ImportDefaultSpecifier?.exit?.(node)
      return node
    },
    visitImportNamespaceSpecifier(node) {
      visitors.ImportNamespaceSpecifier?.enter?.(node)
      this.visitIdentifier(node.local)
      visitors.ImportNamespaceSpecifier?.exit?.(node)
      return node
    },
    visitImportNamedSpecifier(node) {
      visitors.ImportNamedSpecifier?.enter?.(node)
      this.visitIdentifier(node.imported)
      this.visitIdentifier(node.local)
      visitors.ImportNamedSpecifier?.exit?.(node)
      return node
    },
  }

  return (program: n.Program) => handler.visitProgram(program)
}
