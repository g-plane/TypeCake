import type { SourceLocation, Token as AcornToken } from 'acorn'

export type Token = Omit<AcornToken, 'loc' | 'range'> &
  Required<Pick<AcornToken, 'loc'>>

export interface NodeBase {
  type: string
  start: number
  end: number
  loc: SourceLocation
}

export type Node =
  | Identifier
  | Literal
  | TemplateLiteralExpression
  | TemplateElement
  | TupleExpression
  | RestElement
  | ArrayExpression
  | ObjectExpression
  | ObjectExpressionProperty
  | IndexedPropertyKey
  | NamespaceAccessExpression
  | MacroCallExpression
  | CallExpression
  | PipelineExpression
  | IndexedAccessExpression
  | SwitchExpression
  | SwitchExpressionArm
  | IfExpression
  | ConstInExpression
  | ConstInBinding
  | FunctionDeclaration
  | Parameter
  | InferReference
  | ImportDeclaration
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportNamedSpecifier

export interface Program extends NodeBase {
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
  | NamespaceAccessExpression
  | CallExpression
  | PipelineExpression
  | IndexedAccessExpression
  | MacroCallExpression
  | SwitchExpression
  | IfExpression
  | ConstInExpression
  | InferReference

export interface Identifier extends NodeBase {
  type: 'Identifier'
  name: string
}

export interface Literal extends NodeBase {
  type: 'Literal'
  value: string | number | bigint
  raw: string
}

export interface TemplateLiteralExpression extends NodeBase {
  type: 'TemplateLiteralExpression'
  expressions: Expression[]
  quasis: TemplateElement[]
}

export interface TemplateElement extends NodeBase {
  type: 'TemplateElement'
  value: string
  raw: string
}

export interface TupleExpression extends NodeBase {
  type: 'TupleExpression'
  elements: Expression[]
}

export interface RestElement extends NodeBase {
  type: 'RestElement'
  expression: Expression
}

export interface ArrayExpression extends NodeBase {
  type: 'ArrayExpression'
  element: Expression
}

export interface ObjectExpression extends NodeBase {
  type: 'ObjectExpression'
  properties: ObjectExpressionProperty[]
}

export interface ObjectExpressionProperty extends NodeBase {
  type: 'ObjectExpressionProperty'
  key: Identifier | IndexedPropertyKey
  value: Expression
  optional: boolean
}

export interface IndexedPropertyKey extends NodeBase {
  type: 'IndexedPropertyKey'
  id: Identifier
  expression: Identifier | Literal
}

export interface NamespaceAccessExpression extends NodeBase {
  type: 'NamespaceAccessExpression'
  namespace: Expression
  key: Identifier
}

export interface MacroCallExpression extends NodeBase {
  type: 'MacroCallExpression'
  id: Identifier
  arguments: Expression[]
}

export interface CallExpression extends NodeBase {
  type: 'CallExpression'
  callee: Expression
  arguments: Expression[]
}

export interface PipelineExpression extends NodeBase {
  type: 'PipelineExpression'
  source: Expression
  transformer: Identifier | CallExpression
}

export interface IndexedAccessExpression extends NodeBase {
  type: 'IndexedAccessExpression'
  object: Expression
  index: Expression
}

export interface SwitchExpression extends NodeBase {
  type: 'SwitchExpression'
  expression: Expression
  arms: SwitchExpressionArm[]
}

export interface SwitchExpressionArm extends NodeBase {
  type: 'SwitchExpressionArm'
  pattern: Expression
  body: Expression
}

export interface IfExpression extends NodeBase {
  type: 'IfExpression'
  test: Expression
  constraint: Expression
  consequent: Expression
  alternate: Expression
}

export interface ConstInExpression extends NodeBase {
  type: 'ConstInExpression'
  bindings: ConstInBinding[]
  body: Expression
}

export interface ConstInBinding extends NodeBase {
  type: 'ConstInBinding'
  id: Identifier
  expression: Expression
}

export interface FunctionDeclaration extends NodeBase {
  type: 'FunctionDeclaration'
  id: Identifier
  parameters: Parameter[]
  body: Expression
}

export interface Parameter extends NodeBase {
  type: 'Parameter'
  id: Identifier
  constraint: Expression | null
  defaultType: Expression | null
}

export interface InferReference extends NodeBase {
  type: 'InferReference'
  id: Identifier
}

export interface ImportDeclaration extends NodeBase {
  type: 'ImportDeclaration'
  specifiers: ImportSpecifier[]
  source: Literal
}

export type ImportSpecifier =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportNamedSpecifier

export interface ImportDefaultSpecifier extends NodeBase {
  type: 'ImportDefaultSpecifier'
  local: Identifier
}

export interface ImportNamespaceSpecifier extends NodeBase {
  type: 'ImportNamespaceSpecifier'
  local: Identifier
}

export interface ImportNamedSpecifier extends NodeBase {
  type: 'ImportNamedSpecifier'
  imported: Identifier
  local: Identifier
}

export type Statement = ImportDeclaration | FunctionDeclaration
