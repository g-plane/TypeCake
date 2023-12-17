import { type TokenType, tokTypes as tt, tokenizer } from 'acorn'
import * as n from './ast.js'
import type { GetNodeByType } from './utils.js'

const IN_PATTERN = 1

type ExpressionAtom =
  | n.Identifier
  | n.TupleExpression
  | n.ObjectExpression
  | n.TemplateLiteralExpression
  | n.ParenthesizedExpression
  | n.Literal
  | n.InferReference

export class Parser {
  private last!: n.Token
  private current!: n.Token
  private tokens!: ReturnType<typeof tokenizer>
  private isInPattern = 0

  constructor(private input: string) {}

  public parse() {
    this.tokens = tokenizer(this.input, {
      ecmaVersion: 'latest',
      locations: true,
    })
    this.nextToken()

    return this.parseProgram()
  }

  private nextToken(): n.Token {
    this.last = this.current
    const token = this.tokens.getToken()
    this.current = token as n.Token

    return token as n.Token
  }

  private expect(
    type: TokenType,
    value?: string,
    message: string = 'Unexpected token.',
  ): n.Token {
    if (
      this.current.type === type &&
      (!value || value === this.current.value)
    ) {
      const current = this.current
      this.nextToken()
      return current
    } else {
      this.raise(this.current, message)
    }
  }

  private eat(type: TokenType, value?: string): boolean {
    if (
      this.current.type === type &&
      (!value || value === this.current.value)
    ) {
      this.nextToken()
      return true
    } else {
      return false
    }
  }

  private raise(token: n.Token, message: string): never {
    const error = new SyntaxError(
      `${message} (${token.loc!.start.line}:${token.loc!.start.column})`
    )
    // @ts-expect-error
    error.cause = {
      message,
      lastToken: this.last,
      token,
      input: this.input,
    }

    throw error
  }

  private startNode<N extends n.Node['type']>(type: N): n.NodeBase<N> {
    return {
      type,
      start: this.current.start,
      end: -1,
      loc: { start: this.current.loc!.start, end: this.current.loc!.end },
    }
  }

  private startNodeFromNode<N extends n.Node['type']>(
    node: n.NodeBase,
    type: N,
  ): n.NodeBase<N> {
    return {
      type,
      start: node.start,
      end: -1,
      loc: { start: node.loc.start, end: this.current.loc!.end },
    }
  }

  private finishNode<T extends n.Node['type'], N extends GetNodeByType<T>>(
    node: n.NodeBase<T>,
    data: Omit<N, 'type' | 'start' | 'end' | 'loc'>,
  ): N {
    node.end = this.last.end
    node.loc.end = this.last.loc!.end

    return Object.assign(node, data) as N
  }

  protected semicolon() {
    if (
      !this.eat(tt.semi) &&
      !this.eat(tt.eof) &&
      this.current.loc!.start.line <= this.last.loc!.end.line
    ) {
      this.raise(this.current, "Expect a line break or a ';'.")
    }
  }

  protected parseProgram(): n.Program {
    const node = this.startNode('Program')
    const statements: n.Statement[] = []
    while (!this.eat(tt.eof)) {
      if (!this.eat(tt.semi)) {
        statements.push(this.parseStatement())
        this.semicolon()
      }
    }

    return this.finishNode(node, { statements })
  }

  protected parseStatement(): n.Statement {
    if (this.current.type === tt.name) {
      const { value } = this.current
      switch (value) {
        case 'fn':
          return this.parseFunctionDeclaration()
        case 'from':
          return this.parseImportStatement()
        default:
          this.raise(
            this.current,
            'Expect an import declaration or function declaration.'
          )
      }
    } else {
      this.raise(
        this.current,
        'Expect an import declaration or function declaration.'
      )
    }
  }

  protected parseImportStatement() {
    const node = this.startNode('ImportDeclaration')
    this.expect(tt.name, 'from')
    const source = this.parseLiteral(tt.string)
    this.expect(tt._import)
    const specifiers: n.ImportSpecifier[] = []
    switch (this.current.type) {
      case tt.star:
        specifiers.push(this.parseImportNamespaceSpecifier())
        break
      case tt.braceL:
        specifiers.push(...this.parseImportNamedSpecifiers())
        break
      case tt.name:
        specifiers.push(this.parseImportDefaultSpecifier())
        if (this.eat(tt.comma)) {
          specifiers.push(...this.parseImportNamedSpecifiers())
        }
        break
      default:
        this.raise(this.current, "Expect an identifier, '{' or '*'.")
    }

    return this.finishNode(node, { specifiers, source })
  }

  protected parseImportDefaultSpecifier(): n.ImportDefaultSpecifier {
    const node = this.startNode('ImportDefaultSpecifier')
    const local = this.parseIdentifier()

    return this.finishNode(node, { local })
  }

  protected parseImportNamespaceSpecifier(): n.ImportNamespaceSpecifier {
    const node = this.startNode('ImportNamespaceSpecifier')
    this.expect(tt.star)
    this.expect(tt.name, 'as')
    const local = this.parseIdentifier()

    return this.finishNode(node, { local })
  }

  protected parseImportNamedSpecifiers(): n.ImportNamedSpecifier[] {
    this.expect(tt.braceL)
    const specifiers: n.ImportNamedSpecifier[] = []
    while (!this.eat(tt.braceR)) {
      const node = this.startNode('ImportNamedSpecifier')
      const imported = this.parseIdentifier()
      const local = this.eat(tt.name, 'as') ? this.parseIdentifier() : imported
      specifiers.push(this.finishNode(node, { imported, local }))
      if (this.current.type !== tt.braceR) {
        this.expect(tt.comma)
      }
    }

    return specifiers
  }

  protected parseFunctionDeclaration(): n.FunctionDeclaration {
    const node = this.startNode('FunctionDeclaration')
    this.expect(tt.name, 'fn')
    const id = this.parseIdentifier()
    this.expect(tt.parenL)
    const parameters = this.parseParameters()
    this.expect(tt.eq)
    const body = this.parseExpression()

    return this.finishNode(node, { id, parameters, body })
  }

  protected parseIdentifier(): n.Identifier {
    const node = this.startNode('Identifier')
    const name = this.expect(tt.name, undefined, 'Expect an identifier.').value

    return this.finishNode(node, { name })
  }

  protected parseLiteral(type?: TokenType): n.Literal {
    const token = this.current
    const isLiteral = token.type === tt.num ||
      token.type === tt.string ||
      token.type === tt._true ||
      token.type === tt._false ||
      token.type === tt._null
    if ((!type && isLiteral) || type === token.type) {
      const node = this.startNode('Literal')
      const { start, end, value } = token
      const raw = this.input.slice(start, end)
      this.nextToken()
      return this.finishNode(node, { value, raw })
    } else {
      this.raise(this.current, "Expect a literal or 'null'.")
    }
  }

  protected parseExpressionAtom(): ExpressionAtom {
    switch (this.current.type) {
      case tt.name:
        return this.parseIdentifier()
      case tt.bracketL:
        return this.parseTupleExpression()
      case tt.braceL:
        return this.parseObjectExpression()
      case tt.backQuote:
        return this.parseTemplateLiteralExpression()
      case tt.parenL:
        return this.parseParenthesizedExpression()
      case tt.num:
      case tt.string:
      case tt._true:
      case tt._false:
      case tt._null:
        return this.parseLiteral()
      case tt.bitwiseAND:
        if (this.isInPattern & IN_PATTERN) {
          return this.parseInferReference()
        } else {
          this.raise(this.current, "'infer' is only allowed in patterns.")
        }
      default:
        this.raise(
          this.current,
          'Expect an identifier, literal, object literal or tuple.'
        )
    }
  }

  protected parseTemplateLiteralExpression(): n.TemplateLiteralExpression {
    const node = this.startNode('TemplateLiteralExpression')
    this.expect(tt.backQuote)
    const expressions: n.Expression[] = []
    const quasis: n.TemplateElement[] = []
    while (!this.eat(tt.backQuote)) {
      if (this.current.type === tt.template) {
        quasis.push(this.parseTemplateElement())
      } else {
        this.expect(tt.dollarBraceL)
        expressions.push(this.parseExpression())
        this.expect(tt.braceR)
      }
    }

    return this.finishNode(node, { expressions, quasis })
  }

  protected parseTemplateElement(): n.TemplateElement {
    const node = this.startNode('TemplateElement')
    const { value } = this.current
    const raw = this.input.slice(this.current.start, this.current.end)
    this.nextToken()

    return this.finishNode(node, { value, raw })
  }

  protected parseTupleExpression(): n.TupleExpression {
    const node = this.startNode('TupleExpression')
    this.expect(tt.bracketL)
    const elements: n.Expression[] = []
    while (!this.eat(tt.bracketR)) {
      if (this.current.type === tt.ellipsis) {
        elements.push(this.parseRestElement())
      } else {
        elements.push(this.parseExpression())
      }
      if (this.current.type !== tt.bracketR) {
        this.expect(tt.comma)
      }
    }

    return this.finishNode(node, { elements })
  }

  protected parseRestElement(): n.RestElement {
    const node = this.startNode('RestElement')
    this.expect(tt.ellipsis)
    const expression = this.parseExpression()

    return this.finishNode(node, { expression })
  }

  protected parseArrayExpression(element: n.Expression): n.ArrayExpression {
    const node = this.startNodeFromNode(element, 'ArrayExpression')
    this.expect(tt.bracketR)

    return this.finishNode(node, { element })
  }

  protected parseIntersectionType(
    first?: n.Expression,
  ): n.IntersectionExpression {
    const node = first
      ? this.startNodeFromNode(first, 'IntersectionExpression')
      : this.startNode('IntersectionExpression')
    const expressions: n.Expression[] = []
    if (first) {
      expressions.push(first)
    } else {
      this.expect(tt.bitwiseAND)
    }
    do {
      expressions.push(this.parseSubscripts(this.parseExpressionAtom()))
    } while (this.eat(tt.bitwiseAND))

    return this.finishNode(node, { expressions })
  }

  protected parseUnionExpression(first?: n.Expression): n.UnionExpression {
    const node = first
      ? this.startNodeFromNode(first, 'UnionExpression')
      : this.startNode('UnionExpression')
    const expressions: n.Expression[] = []
    if (first) {
      expressions.push(first)
    } else {
      this.expect(tt.bitwiseOR)
    }
    do {
      expressions.push(this.parseNonUnionExpression(this.parseExpressionAtom()))
    } while (this.last.type === tt.bitwiseOR)
    //            ^^^^
    // token '|' was consumed by checking if is pipeline operator,
    // so we may retrieve it by accessing last token

    return this.finishNode(node, { expressions })
  }

  protected parseObjectExpression(): n.ObjectExpression {
    const node = this.startNode('ObjectExpression')
    this.expect(tt.braceL)
    const properties: n.ObjectExpressionProperty[] = []
    while (!this.eat(tt.braceR)) {
      properties.push(this.parseObjectExpressionProperty())
      if (this.current.type !== tt.braceR) {
        this.expect(tt.comma)
      }
    }

    return this.finishNode(node, { properties })
  }

  protected parseObjectExpressionProperty(): n.ObjectExpressionProperty {
    const node = this.startNode('ObjectExpressionProperty')
    const key = this.current.type === tt.bracketL
      ? this.parseIndexedPropertyKey()
      : this.parseIdentifier()
    const optional = this.eat(tt.question)
    this.expect(tt.colon)
    const value = this.parseExpression()

    return this.finishNode(node, { key, value, optional })
  }

  protected parseIndexedPropertyKey(): n.IndexedPropertyKey {
    const node = this.startNode('IndexedPropertyKey')
    this.expect(tt.bracketL)
    const id = this.parseIdentifier()
    this.expect(tt.colon)
    const expression = this.current.type === tt.name
      ? this.parseIdentifier()
      : this.parseLiteral()
    this.expect(tt.bracketR)

    return this.finishNode(node, { id, expression })
  }

  protected parseNamespaceAccessExpression(
    namespace: n.Identifier,
  ): n.NamespaceAccessExpression {
    const node = this.startNodeFromNode(namespace, 'NamespaceAccessExpression')
    this.expect(tt.dot)
    const key = this.parseIdentifier()

    return this.finishNode(node, { namespace, key })
  }

  protected parseParameters() {
    const parameters: n.Parameter[] = []
    while (!this.eat(tt.parenR)) {
      parameters.push(this.parseParameter())
      if (this.current.type !== tt.parenR) {
        this.expect(tt.comma)
      }
    }

    return parameters
  }

  protected parseParameter(): n.Parameter {
    const node = this.startNode('Parameter')
    const id = this.parseIdentifier()
    const constraint = this.eat(tt.colon) ? this.parseExpression() : null
    const defaultType = this.eat(tt.eq) ? this.parseExpression() : null

    return this.finishNode(node, { id, constraint, defaultType })
  }

  protected parseSwitchExpression(): n.SwitchExpression {
    const node = this.startNode('SwitchExpression')
    this.expect(tt._switch)
    const expression = this.parseNonConditionalExpression()
    this.expect(tt.braceL)
    const arms = this.parseSwitchArms()

    return this.finishNode(node, { expression, arms })
  }

  protected parseSwitchArms(): n.SwitchExpressionArm[] {
    const arms: n.SwitchExpressionArm[] = []
    while (!this.eat(tt.braceR)) {
      arms.push(this.parseSwitchExpressionArm())
      if (this.current.type !== tt.braceR) {
        this.expect(tt.comma)
      }
    }

    return arms
  }

  protected parseSwitchExpressionArm(): n.SwitchExpressionArm {
    const node = this.startNode('SwitchExpressionArm')
    this.isInPattern <<= 1
    this.isInPattern |= IN_PATTERN
    const pattern = this.parseNonConditionalExpression()
    this.isInPattern >>= 1
    this.expect(tt.plusMin, '-')
    this.expect(tt.relational, '>')
    const body = this.parseExpression()

    return this.finishNode(node, { pattern, body })
  }

  protected parseIfExpression(): n.IfExpression {
    const node = this.startNode('IfExpression')
    this.expect(tt._if)
    const conditions: n.SubtypeRelation[] = []
    do {
      conditions.push(this.parseSubtypeRelation())
    } while (this.eat(tt.logicalAND))
    this.expect(tt.braceL)
    const consequent = this.parseExpression()
    this.expect(tt.braceR)
    this.expect(
      tt._else,
      undefined,
      "'if' expression must have an 'else' branch."
    )
    let alternate: n.Expression | null = null
    if (this.current.type === tt._if) {
      alternate = this.parseIfExpression()
    } else if (this.eat(tt.braceL)) {
      alternate = this.parseExpression()
      this.expect(tt.braceR)
    } else {
      this.raise(
        this.current,
        "'else' must be followed by another 'if' expression or a block."
      )
    }

    return this.finishNode(node, { conditions, consequent, alternate })
  }

  protected parseSubtypeRelation() {
    const node = this.startNode('SubtypeRelation')
    this.isInPattern <<= 1
    const expression = this.parseNonConditionalExpression()
    let kind
    if (this.eat(tt.equality, '==')) {
      kind = n.SubtypeRelationKind.Equal
    } else {
      this.expect(tt.colon)
      kind = n.SubtypeRelationKind.Subtype
    }
    this.isInPattern |= IN_PATTERN
    const constraint = this.parseNonConditionalExpression()
    this.isInPattern >>= 1

    return this.finishNode(node, { expression, kind, constraint })
  }

  protected parseIndexedAccessExpression(
    object: n.Expression,
  ): n.IndexedAccessExpression {
    const node = this.startNodeFromNode(object, 'IndexedAccessExpression')
    const index = this.parseExpression()
    this.expect(tt.bracketR)

    return this.finishNode(node, { object, index })
  }

  protected parseParenthesizedExpression(): n.ParenthesizedExpression {
    const node = this.startNode('ParenthesizedExpression')
    this.expect(tt.parenL)
    const expression = this.parseExpression()
    this.expect(tt.parenR)

    return this.finishNode(node, { expression })
  }

  protected parseCallExpression(callee: n.Identifier): n.CallExpression {
    const node = this.startNodeFromNode(callee, 'CallExpression')
    const args = this.parseArguments()

    return this.finishNode(node, { callee, arguments: args })
  }

  protected parsePipelineExpression(
    source: n.Expression,
  ): n.PipelineExpression {
    const node = this.startNodeFromNode(source, 'PipelineExpression')
    this.expect(tt.relational, '>')
    const id = this.parseIdentifier()
    const transformer = this.current.type === tt.parenL
      ? this.parseCallExpression(id)
      : id

    return this.finishNode(node, { source, transformer })
  }

  protected parseMacroCallExpression(id: n.Identifier): n.MacroCallExpression {
    const node = this.startNode('MacroCallExpression')
    const args = this.parseArguments()

    return this.finishNode(node, { id, arguments: args })
  }

  protected parseArguments(): n.Expression[] {
    const args: n.Expression[] = []
    this.expect(tt.parenL)
    while (!this.eat(tt.parenR)) {
      args.push(this.parseExpression())
      if (this.current.type !== tt.parenR) {
        this.expect(tt.comma)
      }
    }

    return args
  }

  protected parseConstInExpression(): n.ConstInExpression {
    const node = this.startNode('ConstInExpression')
    this.expect(tt._const)
    const bindings: n.ConstInBinding[] = []
    do {
      bindings.push(this.parseConstInBinding())
      if (this.current.type !== tt._in) {
        this.expect(tt.comma)
      }
    } while (!this.eat(tt._in))
    const body = this.parseExpression()

    return this.finishNode(node, { bindings, body })
  }

  protected parseConstInBinding(): n.ConstInBinding {
    const node = this.startNode('ConstInBinding')
    const id = this.parseIdentifier()
    this.expect(tt.eq)
    const expression = this.parseExpression()

    return this.finishNode(node, { id, expression })
  }

  protected parseForExpression(): n.ForExpression {
    const node = this.startNode('ForExpression')
    this.expect(tt._for)
    const each = this.parseIdentifier()
    this.expect(tt._in)
    const collection = this.parseExpression()
    const mapper = this.eat(tt.name, 'as') ? this.parseExpression() : null
    this.expect(tt.braceL)
    const body = this.parseExpression()
    this.expect(tt.braceR)

    return this.finishNode(node, { each, collection, mapper, body })
  }

  protected parseSubscripts(base: n.Expression): n.Expression {
    while (true) {
      if (base.type === 'Identifier' && this.current.type === tt.parenL) {
        // only identifier can be called
        base = this.parseCallExpression(base)
      } else if (base.type === 'Identifier' && this.current.type === tt.dot) {
        // namespace can only start with an identifier
        base = this.parseNamespaceAccessExpression(base)
      } else if (this.current.type === tt.bracketL) {
        this.nextToken()
        if (this.current.type === tt.bracketR) {
          base = this.parseArrayExpression(base)
        } else {
          base = this.parseIndexedAccessExpression(base)
        }
      } else if (
        this.eat(tt.bitwiseOR) &&
        this.current.type === tt.relational &&
        this.current.value === '>'
      ) {
        base = this.parsePipelineExpression(base)
      } else {
        return base
      }
    }
  }

  protected parseNonUnionExpression(base: n.Expression): n.Expression {
    base = this.parseSubscripts(base)
    return this.eat(tt.bitwiseAND) ? this.parseIntersectionType(base) : base
  }

  protected parseNonConditionalExpression(base?: n.Expression): n.Expression {
    base = this.parseNonUnionExpression(base ?? this.parseExpressionAtom())
    // token '|' was consumed by checking if is pipeline operator,
    // so we may retrieve it by accessing last token
    return this.last.type === tt.bitwiseOR
      ? this.parseUnionExpression(base)
      : base
  }

  protected parseExpression(): n.Expression {
    switch (this.current.type) {
      case tt.name: {
        const identifier = this.parseIdentifier()
        if (this.eat(tt.prefix, '!')) {
          return this.parseMacroCallExpression(identifier)
        } else {
          return this.parseNonConditionalExpression(identifier)
        }
      }
      case tt._switch:
        return this.parseSwitchExpression()
      case tt._if:
        return this.parseIfExpression()
      case tt._for:
        return this.parseForExpression()
      case tt._const:
        return this.parseConstInExpression()
      case tt.bitwiseAND:
        return this.isInPattern & IN_PATTERN
          ? this.parseNonConditionalExpression(this.parseInferReference())
          : this.parseIntersectionType()
      case tt.bitwiseOR:
        return this.parseUnionExpression()
      default:
        return this.parseNonConditionalExpression(this.parseExpressionAtom())
    }
  }

  protected parseInferReference(): n.InferReference {
    const node = this.startNode('InferReference')
    this.expect(tt.bitwiseAND)
    const id = this.parseIdentifier()

    return this.finishNode(node, { id })
  }
}
