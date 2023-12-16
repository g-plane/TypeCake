import type * as n from './ast.js'
import { visitEachChild, visitNode } from './traverser.js'

export enum ScopeKind {
  Global,
  Block,
  Function,
  For,
}

export class Scope {
  public references: Map<string, Set<Reference>>
  public childScopes: Set<Scope>

  constructor(
    public kind: ScopeKind,
    public parent: Scope | null,
    public affectedNode: n.Node,
  ) {
    this.references = new Map()
    this.childScopes = new Set()
  }

  public addReference(node: n.Identifier, kind: ReferenceKind) {
    const refs = this.references.get(node.name)
    if (refs) {
      refs.add({ node, kind })
    } else {
      const refs = new Set<Reference>()
      refs.add({ node, kind })
      this.references.set(node.name, refs)
    }
  }

  public createChildScope(kind: ScopeKind, block: n.Node): Scope {
    const childScope = new Scope(kind, this, block)
    this.childScopes.add(childScope)
    return childScope
  }
}

export enum ReferenceKind {
  Read,
  Write,
}

export interface Reference {
  node: n.Identifier
  kind: ReferenceKind
}

function getCurrentScope(stack: Scope[]): Scope {
  return stack[stack.length - 1]!
}

export function analyzeScope(program: n.Program) {
  const globalScope = new Scope(ScopeKind.Global, null, program)
  const scopesStack: Scope[] = [globalScope]

  visitNode(program, visit)

  function visit(node: n.Node) {
    switch (node.type) {
      case 'FunctionDeclaration':
        const currentScope = getCurrentScope(scopesStack)
        currentScope.addReference(node.id, ReferenceKind.Write)

        const functionScope = currentScope.createChildScope(
          ScopeKind.Function,
          node
        )
        scopesStack.push(functionScope)

        node.parameters.forEach((parameter) => visitNode(parameter, visit))
        visitNode(node.body, visit)

        scopesStack.pop()
        break
      case 'Parameter': {
        const currentScope = getCurrentScope(scopesStack)
        currentScope.addReference(node.id, ReferenceKind.Write)

        if (node.constraint) {
          visitNode(node.constraint, visit)
        }
        if (node.defaultType) {
          visitNode(node.defaultType, visit)
        }
        break
      }
      case 'ImportNamedSpecifier': {
        const currentScope = getCurrentScope(scopesStack)
        currentScope.addReference(node.imported, ReferenceKind.Read)
        // fall through, no break
      }
      case 'ImportNamespaceSpecifier':
      case 'ImportDefaultSpecifier': {
        const currentScope = getCurrentScope(scopesStack)
        currentScope.addReference(node.local, ReferenceKind.Write)
        break
      }
      case 'ConstInExpression': {
        const currentScope = getCurrentScope(scopesStack)
        node.bindings.forEach((binding) => {
          currentScope.addReference(binding.id, ReferenceKind.Write)
          visitNode(binding.expression, visit)
        })
        const constBlockScope = currentScope.createChildScope(
          ScopeKind.Block,
          node.body
        )
        scopesStack.push(constBlockScope)
        visitNode(node.body, visit)
        scopesStack.pop()
        break
      }
      case 'ForExpression': {
        const parentScope = getCurrentScope(scopesStack)
        const scope = parentScope.createChildScope(ScopeKind.For, node)
        scopesStack.push(scope)

        scope.addReference(node.each, ReferenceKind.Write)
        visitNode(node.collection, visit)
        if (node.mapper) {
          visitNode(node.mapper, visit)
        }

        const blockScope = scope.createChildScope(ScopeKind.Block, node.body)
        scopesStack.push(blockScope)
        visitNode(node.body, visit)
        scopesStack.pop()

        scopesStack.pop()
        break
      }
      case 'IfExpression': {
        break
      }
      case 'InferReference': {
        const currentScope = getCurrentScope(scopesStack)
        currentScope.addReference(node.id, ReferenceKind.Write)
        break
      }
      case 'Identifier': {
        const currentScope = getCurrentScope(scopesStack)
        currentScope.addReference(node, ReferenceKind.Read)
        break
      }
      default:
        visitEachChild(node, visit)
    }
  }

  return globalScope
}
