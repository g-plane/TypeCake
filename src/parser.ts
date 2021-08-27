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

  private startNode<N extends n.Node = n.Node>(type?: string) {
    return {
      type,
      start: this.current.start,
      end: -1,
      loc: { start: this.current.loc!.start },
    } as N
  }

  private startNodeFromNode<N extends n.Node = n.Node>(
    node: n.Node,
    type: string
  ): N {
    return {
      type,
      start: node.start,
      end: -1,
      loc: { start: node.loc.start },
    } as N
  }

  private finishNode<N extends n.Node = n.Node>(node: N): N {
    node.end = this.last.end
    node.loc.end = this.last.loc!.end

    return node
  }

  private semicolon() {
    if (
      !this.eat(tt.semi) &&
      !this.eat(tt.eof) &&
      this.current.loc!.start.line <= this.last.loc!.end.line
    ) {
      this.raise(this.current, 'Expect a semicolon.')
    }
  }

  private parseProgram(): n.Program {
    const node = this.startNode<n.Program>('Program')
    const statements: n.Statement[] = []
    while (!this.eat(tt.eof)) {
      statements.push(this.parseStatement())
    }
    node.statements = statements

    return this.finishNode(node)
  }

  private parseStatement() {
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

  private parseImportStatement() {
    const node = this.startNode<n.ImportDeclaration>('ImportDeclaration')
    this.expect(tt.name, 'from')
    node.source = this.parseLiteral(tt.string)
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
    node.specifiers = specifiers

    this.semicolon()

    return this.finishNode(node)
  }

  private parseImportDefaultSpecifier(): n.ImportDefaultSpecifier {
    const node = this.startNode<n.ImportDefaultSpecifier>(
      'ImportDefaultSpecifier'
    )
    node.local = this.parseIdentifier()

    return this.finishNode(node)
  }

  private parseImportNamespaceSpecifier(): n.ImportNamespaceSpecifier {
    const node = this.startNode<n.ImportNamespaceSpecifier>(
      'ImportNamespaceSpecifier'
    )
    this.expect(tt.star)
    this.expect(tt.name, 'as')
    node.local = this.parseIdentifier()

    return this.finishNode(node)
  }

  private parseImportNamedSpecifiers(): n.ImportNamedSpecifier[] {
    this.expect(tt.braceL)
    const specifiers: n.ImportNamedSpecifier[] = []
    while (!this.eat(tt.braceR)) {
      const node = this.startNode<n.ImportNamedSpecifier>(
        'ImportNamedSpecifier'
      )
      node.imported = this.parseIdentifier()
      if (this.eat(tt.name, 'as')) {
        node.local = this.parseIdentifier()
      } else {
        node.local = node.imported
      }
      specifiers.push(this.finishNode(node))
      if (this.current.type !== tt.braceR) {
        this.expect(tt.comma)
      }
    }

    return specifiers
  }

  private parseFunctionDeclaration(): n.FunctionDeclaration {
    const node = this.startNode<n.FunctionDeclaration>('FunctionDeclaration')
    this.expect(tt.name, 'fn')
    node.id = this.parseIdentifier()
    this.expect(tt.parenL)
    node.parameters = this.parseParameters()
    this.expect(tt.eq)
    node.body = this.parseExpression()

    return this.finishNode(node)
  }

  private parseIdentifier(): n.Identifier {
    const node = this.startNode<n.Identifier>('Identifier')
    node.name = this.expect(tt.name).value

    return this.finishNode(node)
  }

  private parseLiteral(type?: TokenType): n.Literal {
    if (!type || type === this.current.type) {
      const node = this.startNode<n.Literal>('Literal')
      node.value = this.current.value
      this.nextToken()
      return this.finishNode(node)
    } else {
      this.raise(this.current, '')
    }
  }

  private parseTupleExpression(): n.TupleExpression {
    const node = this.startNode<n.TupleExpression>('TupleExpression')
    this.expect(tt.bracketL)
    const elements: n.Expression[] = []
    while (!this.eat(tt.bracketR)) {
      elements.push(this.parseExpression())
      if (this.current.type !== tt.bracketR) {
        this.expect(tt.comma)
      }
    }
    node.elements = elements

    return this.finishNode(node)
  }

  private parseArrayExpression(element: n.Expression): n.ArrayExpression {
    const node = this.startNodeFromNode<n.ArrayExpression>(
      element,
      'ArrayExpression'
    )
    node.element = element
    this.expect(tt.bracketR)

    return this.finishNode(node)
  }

  private parseParameters() {
    const parameters: n.Parameter[] = []
    while (!this.eat(tt.parenR)) {
      parameters.push(this.parseParameter())
      if (this.current.type !== tt.parenR) {
        this.expect(tt.comma)
      }
    }

    return parameters
  }

  private parseParameter(): n.Parameter {
    const node = this.startNode<n.Parameter>('Parameter')
    node.id = this.parseIdentifier()
    node.constraint = this.eat(tt.colon) ? this.parseExpression() : null
    node.defaultType = this.eat(tt.eq) ? this.parseExpression() : null

    return this.finishNode(node)
  }

  private parseSwitchExpression(): n.SwitchExpression {
    const node = this.startNode<n.SwitchExpression>('SwitchExpression')
    this.expect(tt._switch)
    node.expression = this.parseExpression()
    this.expect(tt.braceL)
    node.arms = this.parseSwitchArms()

    return this.finishNode(node)
  }

  private parseSwitchArms(): n.SwitchExpressionArm[] {
    const arms: n.SwitchExpressionArm[] = []
    while (!this.eat(tt.braceR)) {
      arms.push(this.parseSwitchExpressionArm())
      if (this.current.type !== tt.braceR) {
        this.expect(tt.comma)
      }
    }

    return arms
  }

  private parseSwitchExpressionArm(): n.SwitchExpressionArm {
    const node = this.startNode<n.SwitchExpressionArm>('SwitchExpressionArm')
    node.pattern = this.parseExpression() // TODO: pattern
    this.expect(tt.plusMin, '-')
    this.expect(tt.relational, '>')
    node.body = this.parseExpression()

    return this.finishNode(node)
  }

  private parseIfExpression(): n.IfExpression {
    const node = this.startNode<n.IfExpression>('IfExpression')
    this.expect(tt._if)
    node.test = this.parseExpression()
    this.expect(tt.colon)
    node.constraint = this.parseExpression() // TODO: pattern
    this.expect(tt.braceL)
    node.consequent = this.parseExpression()
    this.expect(tt.braceR)
    this.expect(tt._else)
    if (this.current.type === tt._if) {
      node.alternate = this.parseIfExpression()
    } else if (this.eat(tt.braceL)) {
      node.alternate = this.parseExpression()
      this.expect(tt.braceR)
    } else {
      this.raise(this.current, '')
    }

    return this.finishNode(node)
  }

  private parseIndexedAccessExpression(
    object: n.Expression
  ): n.IndexedAccessExpression {
    const node = this.startNodeFromNode<n.IndexedAccessExpression>(
      object,
      'IndexedAccessExpression'
    )
    node.object = object
    node.index = this.parseExpression()
    this.expect(tt.bracketR)

    return this.finishNode(node)
  }

  private parseCallExpression(callee: n.Expression): n.CallExpression {
    const node = this.startNodeFromNode<n.CallExpression>(
      callee,
      'CallExpression'
    )
    node.callee = callee
    node.arguments = this.parseArguments()

    return this.finishNode(node)
  }

  private parseMacroCallExpression(): n.MacroCallExpression {
    const node = this.startNode<n.MacroCallExpression>('MacroCallExpression')
    this.expect(tt.dot)
    node.id = this.parseIdentifier()
    node.arguments = this.parseArguments()

    return this.finishNode(node)
  }

  private parseArguments(): n.Expression[] {
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
    const node = this.startNode<n.ConstInExpression>('ConstInExpression')
    this.expect(tt._const)
    const bindings: n.ConstInBinding[] = []
    do {
      bindings.push(this.parseConstInBinding())
      if (this.current.type !== tt._in) {
        this.expect(tt.comma)
      }
    } while (!this.eat(tt._in))
    node.bindings = bindings
    node.body = this.parseExpression()

    return this.finishNode(node)
  }

  protected parseConstInBinding(): n.ConstInBinding {
    const node = this.startNode<n.ConstInBinding>('ConstInBinding')
    node.id = this.parseIdentifier()
    this.expect(tt.eq)
    node.expression = this.parseExpression()

    return this.finishNode(node)
  }

  private parseSubscripts(base: n.Expression, canCall: boolean): n.Expression {
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

  private parseExpression(): n.Expression {
    switch (this.current.type) {
      case tt.name:
        return this.parseSubscripts(this.parseIdentifier(), true)
      case tt._switch:
        return this.parseSwitchExpression()
      case tt._if:
        return this.parseIfExpression()
      case tt.bracketL:
        return this.parseSubscripts(this.parseTupleExpression(), false)
      case tt.dot:
        return this.parseMacroCallExpression()
      case tt._const:
        return this.parseConstInExpression()
      case tt.string:
      case tt.num:
      case tt._true:
      case tt._false:
      case tt._null:
        return this.parseSubscripts(this.parseLiteral(), false)
      default:
        this.raise(this.current, '')
    }
  }
}
