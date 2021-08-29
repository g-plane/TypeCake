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
  | TemplateLiteralExpression
  | TupleExpression
  | RestElement
  | ArrayExpression
  | ObjectExpression
  | CallExpression
  | PipelineExpression
  | IndexedAccessExpression
  | MacroCallExpression
  | SwitchExpression
  | IfExpression
  | ConstInExpression
  | InferReference

export interface Identifier extends Node {
  type: 'Identifier'
  name: string
}

export interface Literal extends Node {
  type: 'Literal'
  value: string | number | bigint
  raw: string
}

export interface TemplateLiteralExpression extends Node {
  type: 'TemplateLiteralExpression'
  expressions: Expression[]
  quasis: TemplateElement[]
}

export interface TemplateElement extends Node {
  type: 'TemplateElement'
  value: string
  raw: string
}

export interface TupleExpression extends Node {
  type: 'TupleExpression'
  elements: Expression[]
}

export interface RestElement extends Node {
  type: 'RestElement'
  expression: Expression
}

export interface ArrayExpression extends Node {
  type: 'ArrayExpression'
  element: Expression
}

export interface ObjectExpression extends Node {
  type: 'ObjectExpression'
  properties: ObjectExpressionProperty[]
}

export interface ObjectExpressionProperty extends Node {
  type: 'ObjectExpressionProperty'
  key: Identifier | IndexedPropertyKey
  value: Expression
  optional: boolean
}

export interface IndexedPropertyKey extends Node {
  type: 'IndexedPropertyKey'
  id: Identifier
  expression: Identifier | Literal
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

export interface PipelineExpression extends Node {
  type: 'PipelineExpression'
  source: Expression
  transformer: Identifier | CallExpression
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
  pattern: Expression
  body: Expression
}

export interface IfExpression extends Node {
  type: 'IfExpression'
  test: Expression
  constraint: Expression
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

export interface InferReference extends Node {
  type: 'InferReference'
  id: Identifier
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
