import type { SourceLocation } from 'acorn'

export interface Node {
  type: string
  start: number
  end: number
  loc: SourceLocation
}

export interface Program extends Node {
  type: 'Program'
  statements: Statement[]
}

export type Expression =
  | Identifier
  | Literal
  | TupleExpression
  | ArrayExpression
  | CallExpression
  | IndexedAccessExpression
  | MacroCallExpression
  | SwitchExpression
  | IfExpression
  | ConstInExpression

export interface Identifier extends Node {
  type: 'Identifier'
  name: string
}

export interface Literal extends Node {
  type: 'Literal'
  value: string | number
}

export interface TupleExpression extends Node {
  type: 'TupleExpression'
  elements: Expression[]
}

export interface ArrayExpression extends Node {
  type: 'ArrayExpression'
  element: Expression
}

export interface MacroCallExpression extends Node {
  type: 'MacroCallExpression'
  id: Identifier
  arguments: Expression[]
}

export interface CallExpression extends Node {
  type: 'CallExpression'
  callee: Expression
  arguments: Expression[]
}

export interface IndexedAccessExpression extends Node {
  type: 'IndexedAccessExpression'
  object: Expression
  index: Expression
}

export interface SwitchExpression extends Node {
  type: 'SwitchExpression'
  expression: Expression
  arms: SwitchExpressionArm[]
}

export interface SwitchExpressionArm extends Node {
  type: 'SwitchExpressionArm'
  pattern: Pattern
  body: Expression
}

export interface IfExpression extends Node {
  type: 'IfExpression'
  test: Expression
  constraint: Pattern
  consequent: Expression
  alternate: Expression
}

export interface ConstInExpression extends Node {
  type: 'ConstInExpression'
  bindings: ConstInBinding[]
  body: Expression
}

export interface ConstInBinding extends Node {
  type: 'ConstInBinding'
  id: Identifier
  expression: Expression
}

export interface FunctionDeclaration extends Node {
  type: 'FunctionDeclaration'
  id: Identifier
  parameters: Parameter[]
  body: Expression
}

export interface Parameter extends Node {
  type: 'Parameter'
  id: Identifier
  constraint: Expression | null
  defaultType: Expression | null
}

export type Pattern =
  | InferReference
  | Literal
  | Identifier
  | TuplePattern
  | CallPattern
  | IndexedAccessPattern

export interface InferReference extends Node {
  type: 'InferReference'
  id: Identifier
}

export interface TuplePattern extends Node {
  type: 'TuplePattern'
  elements: Pattern[]
}

export interface CallPattern extends Node {
  type: 'CallPattern'
  callee: Pattern
  arguments: Pattern[]
}

export interface IndexedAccessPattern extends Node {
  type: 'IndexedAccessPattern'
  object: Pattern
  index: Expression
}

export interface ImportDeclaration extends Node {
  type: 'ImportDeclaration'
  specifiers: ImportSpecifier[]
  source: Literal
}

export type ImportSpecifier =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportNamedSpecifier

export interface ImportDefaultSpecifier extends Node {
  type: 'ImportDefaultSpecifier'
  local: Identifier
}

export interface ImportNamespaceSpecifier extends Node {
  type: 'ImportNamespaceSpecifier'
  local: Identifier
}

export interface ImportNamedSpecifier extends Node {
  type: 'ImportNamedSpecifier'
  imported: Identifier
  local: Identifier
}

export type Statement = ImportDeclaration | FunctionDeclaration
