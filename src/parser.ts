import { tokenizer, tokTypes as tt } from 'acorn'
import type { TokenType, Token } from 'acorn'
import type * as n from './ast'

export class Parser {
  private last!: Token
  private current!: Token
  private tokens!: ReturnType<typeof tokenizer>

  constructor(private input: string) {}

  public parse() {
    this.tokens = tokenizer(this.input, {
      ecmaVersion: 'latest',
      locations: true,
    })
    this.nextToken()

    return this.parseProgram()
  }

  private nextToken() {
    this.last = this.current
    const token = this.tokens.getToken()
    this.current = token

    return token
  }

  private expect(
    type: TokenType,
    value?: string,
    message: string = 'Unexpected token.'
  ): Token {
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

  private raise(token: Token, message: string): never {
    throw new SyntaxError(
      `${message} (${token.loc!.start.line}:${token.loc!.start.column}) (${
        token.value
      })`
    )
  }

  private startNode(type: string): n.Node {
    return {
      type,
      start: this.current.start,
      end: -1,
      loc: { start: this.current.loc!.start, end: this.current.loc!.end },
    }
  }

  private startNodeFromNode(node: n.Node, type: string): n.Node {
    return {
      type,
      start: node.start,
      end: -1,
      loc: { start: node.loc.start, end: this.current.loc!.end },
    }
  }

  private finishNode<N extends n.Node>(
    node: n.Node,
    data: Omit<N, 'type' | 'start' | 'end' | 'loc'>
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
      this.raise(this.current, 'Expect a semicolon.')
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

    return this.finishNode<n.Program>(node, {
      statements,
    })
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
          this.raise(this.current, 'unexpected token')
      }
    } else {
      this.raise(this.current, 'unexpected token')
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
        this.raise(this.current, '')
    }

    return this.finishNode<n.ImportDeclaration>(node, { specifiers, source })
  }

  protected parseImportDefaultSpecifier(): n.ImportDefaultSpecifier {
    const node = this.startNode('ImportDefaultSpecifier')
    const local = this.parseIdentifier()

    return this.finishNode<n.ImportDefaultSpecifier>(node, { local })
  }

  protected parseImportNamespaceSpecifier(): n.ImportNamespaceSpecifier {
    const node = this.startNode('ImportNamespaceSpecifier')
    this.expect(tt.star)
    this.expect(tt.name, 'as')
    const local = this.parseIdentifier()

    return this.finishNode<n.ImportNamespaceSpecifier>(node, { local })
  }

  protected parseImportNamedSpecifiers(): n.ImportNamedSpecifier[] {
    this.expect(tt.braceL)
    const specifiers: n.ImportNamedSpecifier[] = []
    while (!this.eat(tt.braceR)) {
      const node = this.startNode('ImportNamedSpecifier')
      const imported = this.parseIdentifier()
      const local = this.eat(tt.name, 'as') ? this.parseIdentifier() : imported
      specifiers.push(
        this.finishNode<n.ImportNamedSpecifier>(node, { imported, local })
      )
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

    return this.finishNode<n.FunctionDeclaration>(node, {
      id,
      parameters,
      body,
    })
  }

  protected parseIdentifier(): n.Identifier {
    const node = this.startNode('Identifier')
    const name = this.expect(tt.name).value

    return this.finishNode<n.Identifier>(node, { name })
  }

  protected parseLiteral(type?: TokenType): n.Literal {
    if (!type || type === this.current.type) {
      const node = this.startNode('Literal')
      const value = this.current.value
      const raw = this.input.slice(this.current.start, this.current.end)
      this.nextToken()
      return this.finishNode<n.Literal>(node, { value, raw })
    } else {
      this.raise(this.current, '')
    }
  }

  protected parseTupleExpression(): n.TupleExpression {
    const node = this.startNode('TupleExpression')
    this.expect(tt.bracketL)
    const elements: n.Expression[] = []
    while (!this.eat(tt.bracketR)) {
      if (this.current.type === tt.ellipsis) {
        elements.push(this.parseRestExpression())
      } else {
        elements.push(this.parseExpression())
      }
      if (this.current.type !== tt.bracketR) {
        this.expect(tt.comma)
      }
    }

    return this.finishNode<n.TupleExpression>(node, { elements })
  }

  protected parseRestExpression(): n.RestExpression {
    const node = this.startNode('RestExpression')
    this.expect(tt.ellipsis)
    const expression = this.parseExpression()

    return this.finishNode<n.RestExpression>(node, { expression })
  }

  protected parseArrayExpression(element: n.Expression): n.ArrayExpression {
    const node = this.startNodeFromNode(element, 'ArrayExpression')
    this.expect(tt.bracketR)

    return this.finishNode<n.ArrayExpression>(node, { element })
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

    return this.finishNode<n.ObjectExpression>(node, { properties })
  }

  protected parseObjectExpressionProperty(): n.ObjectExpressionProperty {
    const node = this.startNode('ObjectExpressionProperty')
    const key =
      this.current.type === tt.bracketL
        ? this.parseIndexedPropertyKey()
        : this.parseIdentifier()
    const optional = this.eat(tt.question)
    this.expect(tt.colon)
    const value = this.parseExpression()

    return this.finishNode<n.ObjectExpressionProperty>(node, {
      key,
      value,
      optional,
    })
  }

  protected parseIndexedPropertyKey(): n.IndexedPropertyKey {
    const node = this.startNode('IndexedPropertyKey')
    this.expect(tt.bracketL)
    const id = this.parseIdentifier()
    this.expect(tt.colon)
    const expression =
      this.current.type === tt.name
        ? this.parseIdentifier()
        : this.parseLiteral()
    this.expect(tt.bracketR)

    return this.finishNode<n.IndexedPropertyKey>(node, { id, expression })
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

    return this.finishNode<n.Parameter>(node, { id, constraint, defaultType })
  }

  protected parseSwitchExpression(): n.SwitchExpression {
    const node = this.startNode('SwitchExpression')
    this.expect(tt._switch)
    const expression = this.parseExpression()
    this.expect(tt.braceL)
    const arms = this.parseSwitchArms()

    return this.finishNode<n.SwitchExpression>(node, { expression, arms })
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
    const pattern = this.parsePattern()
    this.expect(tt.plusMin, '-')
    this.expect(tt.relational, '>')
    const body = this.parseExpression()

    return this.finishNode<n.SwitchExpressionArm>(node, { pattern, body })
  }

  protected parseIfExpression(): n.IfExpression {
    const node = this.startNode('IfExpression')
    this.expect(tt._if)
    const test = this.parseExpression()
    this.expect(tt.colon)
    const constraint = this.parsePattern()
    this.expect(tt.braceL)
    const consequent = this.parseExpression()
    this.expect(tt.braceR)
    this.expect(tt._else)
    let alternate: n.Expression | null = null
    if (this.current.type === tt._if) {
      alternate = this.parseIfExpression()
    } else if (this.eat(tt.braceL)) {
      alternate = this.parseExpression()
      this.expect(tt.braceR)
    } else {
      this.raise(this.current, '')
    }

    return this.finishNode<n.IfExpression>(node, {
      test,
      constraint,
      consequent,
      alternate,
    })
  }

  protected parseIndexedAccessExpression(
    object: n.Expression
  ): n.IndexedAccessExpression {
    const node = this.startNodeFromNode(object, 'IndexedAccessExpression')
    const index = this.parseExpression()
    this.expect(tt.bracketR)

    return this.finishNode<n.IndexedAccessExpression>(node, { object, index })
  }

  protected parseCallExpression(callee: n.Expression): n.CallExpression {
    const node = this.startNodeFromNode(callee, 'CallExpression')
    const args = this.parseArguments()

    return this.finishNode<n.CallExpression>(node, { callee, arguments: args })
  }

  protected parseMacroCallExpression(id: n.Identifier): n.MacroCallExpression {
    const node = this.startNode('MacroCallExpression')
    const args = this.parseArguments()

    return this.finishNode<n.MacroCallExpression>(node, { id, arguments: args })
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

    return this.finishNode<n.ConstInExpression>(node, { bindings, body })
  }

  protected parseConstInBinding(): n.ConstInBinding {
    const node = this.startNode('ConstInBinding')
    const id = this.parseIdentifier()
    this.expect(tt.eq)
    const expression = this.parseExpression()

    return this.finishNode<n.ConstInBinding>(node, { id, expression })
  }

  protected parseExpressionSubscripts(
    base: n.Expression,
    canCall: boolean
  ): n.Expression {
    while (true) {
      if (canCall && this.current.type === tt.parenL) {
        return this.parseCallExpression(base)
      } else if (this.current.type === tt.bracketL) {
        this.nextToken()
        if (this.current.type === tt.bracketR) {
          base = this.parseArrayExpression(base)
        } else {
          base = this.parseIndexedAccessExpression(base)
        }
      } else {
        return base
      }
    }
  }

  protected parseExpression(): n.Expression {
    switch (this.current.type) {
      case tt.name: {
        const identifier = this.parseIdentifier()
        if (this.eat(tt.prefix, '!')) {
          return this.parseMacroCallExpression(identifier)
        } else {
          return this.parseExpressionSubscripts(identifier, true)
        }
      }
      case tt._switch:
        return this.parseSwitchExpression()
      case tt._if:
        return this.parseIfExpression()
      case tt.bracketL:
        return this.parseExpressionSubscripts(
          this.parseTupleExpression(),
          false
        )
      case tt.braceL:
        return this.parseExpressionSubscripts(
          this.parseObjectExpression(),
          false
        )
      case tt._const:
        return this.parseConstInExpression()
      case tt.string:
      case tt.num:
      case tt._true:
      case tt._false:
      case tt._null:
        return this.parseExpressionSubscripts(this.parseLiteral(), false)
      default:
        this.raise(this.current, '')
    }
  }

  protected parseInferReference(): n.InferReference {
    const node = this.startNode('InferReference')
    this.expect(tt.bitwiseAND)
    const id = this.parseIdentifier()

    return this.finishNode<n.InferReference>(node, { id })
  }

  protected parseTuplePattern(): n.TuplePattern {
    const node = this.startNode('TuplePattern')
    this.expect(tt.bracketL)
    const elements: n.Pattern[] = []
    while (!this.eat(tt.bracketR)) {
      if (this.current.type === tt.ellipsis) {
        elements.push(this.parseRestPattern())
      } else {
        elements.push(this.parsePattern())
      }
      if (this.current.type !== tt.bracketR) {
        this.expect(tt.comma)
      }
    }

    return this.finishNode<n.TuplePattern>(node, { elements })
  }

  protected parseRestPattern(): n.RestPattern {
    const node = this.startNode('RestPattern')
    this.expect(tt.ellipsis)
    const pattern = this.parsePattern()

    return this.finishNode<n.RestPattern>(node, { pattern })
  }

  protected parseCallPattern(callee: n.Pattern): n.CallPattern {
    const node = this.startNodeFromNode(callee, 'CallPattern')
    const args: n.Pattern[] = []
    this.expect(tt.parenL)
    while (!this.eat(tt.parenR)) {
      args.push(this.parsePattern())
      if (this.current.type !== tt.parenR) {
        this.expect(tt.comma)
      }
    }

    return this.finishNode<n.CallPattern>(node, { callee, arguments: args })
  }

  protected parseIndexedAccessPattern(
    object: n.Pattern
  ): n.IndexedAccessPattern {
    const node = this.startNodeFromNode(object, 'IndexedAccessPattern')
    const index = this.parseExpression()
    this.expect(tt.bracketR)

    return this.finishNode<n.IndexedAccessPattern>(node, { object, index })
  }

  protected parsePatternSubscripts(base: n.Pattern): n.Pattern {
    while (true) {
      if (this.current.type === tt.parenL) {
        return this.parseCallPattern(base)
      } else if (this.current.type === tt.bracketL) {
        this.nextToken()
        if (this.current.type === tt.bracketR) {
          // base = this.parseArrayPattern(base)
        } else {
          base = this.parseIndexedAccessPattern(base)
        }
      } else {
        return base
      }
    }
  }

  protected parsePattern(): n.Pattern {
    switch (this.current.type) {
      case tt.bitwiseAND:
        return this.parseInferReference()
      case tt.name:
        return this.parsePatternSubscripts(this.parseIdentifier())
      case tt.bracketL:
        return this.parseTuplePattern()
      case tt.string:
      case tt.num:
      case tt._true:
      case tt._false:
      case tt._null:
        return this.parsePatternSubscripts(this.parseLiteral())
      default:
        this.raise(this.current, '')
    }
  }
}
