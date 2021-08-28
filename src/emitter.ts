import type * as n from './ast'

export class Emitter {
  private blocks: string[] = []
  private indentLevel = 0

  public emit(program: n.Program): string {
    this.emitProgram(program)

    return this.blocks.join('')
  }

  private add(text: string) {
    this.blocks.push(text)
  }

  private space() {
    this.blocks.push(' ')
  }

  private newLine() {
    this.blocks.push('\n')
  }

  private indent() {
    this.indentLevel += 1
  }

  private dedent() {
    this.indentLevel -= 1
  }

  private printIndent() {
    this.blocks.push('  '.repeat(this.indentLevel))
  }

  protected emitProgram(node: n.Program) {
    node.statements.forEach((stmt, index, stmts) => {
      switch (stmt.type) {
        case 'FunctionDeclaration':
          this.emitFunctionDeclaration(stmt)
          break
        case 'ImportDeclaration':
          this.emitImportDeclaration(stmt)
          break
      }

      const next = stmts[index + 1]
      if (next) {
        this.add('\n'.repeat(next.loc.start.line - stmt.loc.end.line))
      } else {
        this.newLine()
      }
    })
  }

  protected emitImportDeclaration(node: n.ImportDeclaration) {
    this.add('import')
    this.space()

    const first = node.specifiers[0]!
    switch (first.type) {
      case 'ImportNamedSpecifier':
        this.emitImportNamedSpecifiers(
          node.specifiers as n.ImportNamedSpecifier[]
        )
        break
      case 'ImportDefaultSpecifier':
        this.emitImportDefaultSpecifier(first)
        if (node.specifiers.length > 1) {
          this.add(',')
          this.space()
          this.emitImportNamedSpecifiers(
            node.specifiers.slice(1) as n.ImportNamedSpecifier[]
          )
        }
        break
      case 'ImportNamespaceSpecifier':
        this.emitImportNamespaceSpecifier(first)
        break
    }

    this.space()
    this.add('from')
    this.space()
    this.emitLiteral(node.source)
    this.add(';')
  }

  protected emitImportDefaultSpecifier(node: n.ImportDefaultSpecifier) {
    this.emitIdentifier(node.local)
  }

  protected emitImportNamespaceSpecifier(node: n.ImportNamespaceSpecifier) {
    this.add('*')
    this.space()
    this.add('as')
    this.space()
    this.emitIdentifier(node.local)
  }

  protected emitImportNamedSpecifiers(specifiers: n.ImportNamedSpecifier[]) {
    this.add('{')
    this.space()
    specifiers.forEach((specifier, index) => {
      this.emitImportNamedSpecifier(specifier as n.ImportNamedSpecifier)
      if (index !== specifiers.length - 1) {
        this.add(',')
        this.space()
      }
    })
    this.space()
    this.add('}')
  }

  protected emitImportNamedSpecifier(node: n.ImportNamedSpecifier) {
    this.emitIdentifier(node.imported)
    if (node.imported !== node.local) {
      this.space()
      this.add('as')
      this.space()
      this.emitIdentifier(node.local)
    }
  }

  protected emitFunctionDeclaration(node: n.FunctionDeclaration) {
    this.add('type')
    this.space()
    this.emitIdentifier(node.id)
    if (node.parameters.length > 0) {
      this.add('<')
      node.parameters.forEach((parameter, index, parameters) => {
        this.emitParameter(parameter)
        if (index !== parameters.length - 1) {
          this.add(',')
          this.space()
        }
      })
      this.add('>')
    }
    this.space()
    this.add('=')
    this.space()
    this.emitExpression(node.body)
    this.add(';')
  }

  protected emitParameter(node: n.Parameter) {
    this.emitIdentifier(node.id)
    if (node.constraint) {
      this.space()
      this.add('extends')
      this.space()
      this.emitExpression(node.constraint)
    }
    if (node.defaultType) {
      this.space()
      this.add('=')
      this.space()
      this.emitExpression(node.defaultType)
    }
  }

  protected emitExpression(node: n.Expression) {
    switch (node.type) {
      case 'Identifier':
        this.emitIdentifier(node)
        break
      case 'Literal':
        this.emitLiteral(node)
        break
      case 'TupleExpression':
        this.emitTupleExpression(node)
        break
      case 'ArrayExpression':
        this.emitArrayExpression(node)
        break
      case 'ObjectExpression':
        this.emitObjectExpression(node)
        break
      case 'CallExpression':
        this.emitCallExpression(node)
        break
      case 'IndexedAccessExpression':
        this.emitIndexedAccessExpression(node)
        break
      case 'SwitchExpression':
        this.emitSwitchExpression(node)
        break
      case 'IfExpression':
        this.emitIfExpression(node)
        break
      case 'ConstInExpression':
        this.emitConstInExpression(node)
        break
    }
  }

  protected emitCallExpression(node: n.CallExpression) {
    this.emitExpression(node.callee)
    if (node.arguments.length > 0) {
      this.add('<')
      node.arguments.forEach((argument, index, args) => {
        this.emitExpression(argument)
        if (index !== args.length - 1) {
          this.add(',')
          this.space()
        }
      })
      this.add('>')
    }
  }

  protected emitIndexedAccessExpression(node: n.IndexedAccessExpression) {
    this.emitExpression(node.object)
    this.add('[')
    this.emitExpression(node.index)
    this.add(']')
  }

  protected emitConstInExpression(node: n.ConstInExpression) {
    node.bindings.forEach((binding, index, bindings) => {
      this.emitExpression(binding.expression)
      this.space()
      this.add('extends')
      this.space()
      this.add('infer')
      this.space()
      this.emitIdentifier(binding.id)
      this.space()
      this.add('?')
      this.space()
      if (index === bindings.length - 1) {
        this.emitExpression(node.body)
      }
    })
    node.bindings.forEach(() => {
      this.space()
      this.add(':')
      this.space()
      this.add('never')
    })
  }

  protected emitSwitchExpression(node: n.SwitchExpression) {
    if (node.arms.length === 1) {
      const arm = node.arms[0]!
      this.emitExpression(node.expression)
      this.space()
      this.add('extends')
      this.space()
      this.emitPattern(arm.pattern)
      this.space()
      this.add('?')
      this.space()
      this.emitExpression(arm.body)
      this.space()
      this.add(':')
      this.space()
      this.emitExpression(arm.body)
    }

    for (let index = 0, end = node.arms.length - 1; index < end; index += 1) {
      const arm = node.arms[index]!
      this.emitExpression(node.expression)
      this.space()
      this.add('extends')
      this.space()
      this.emitPattern(arm.pattern)
      this.space()
      this.add('?')
      this.space()
      this.emitExpression(arm.body)
      this.space()
      this.add(':')
      this.space()
      if (index === node.arms.length - 2) {
        const lastArm = node.arms[node.arms.length - 1]! // TODO: Array#at(-1)
        this.emitExpression(lastArm.body)
      }
    }
  }

  protected emitIfExpression(node: n.IfExpression) {
    this.emitExpression(node.test)
    this.space()
    this.add('extends')
    this.space()
    this.emitPattern(node.constraint)
    this.space()
    this.add('?')
    this.space()
    this.emitExpression(node.consequent)
    this.space()
    this.add(':')
    this.space()
    this.emitExpression(node.alternate)
  }

  protected emitIdentifier(node: n.Identifier) {
    this.add(node.name)
  }

  protected emitLiteral(node: n.Literal) {
    const { value } = node
    if (typeof value === 'number') {
      this.add(value.toString())
    } else if (value === 'true' || value === 'false' || value === 'null') {
      this.add(value)
    } else {
      this.add('"')
      this.add(value)
      this.add('"')
    }
  }

  protected emitTupleExpression(node: n.TupleExpression) {
    this.add('[')
    node.elements.forEach((element, index, elements) => {
      this.emitExpression(element)
      if (index !== elements.length - 1) {
        this.add(',')
        this.space()
      }
    })
    this.add(']')
  }

  protected emitArrayExpression(node: n.ArrayExpression) {
    if (node.element.type === 'Literal' || node.element.type === 'Identifier') {
      this.emitExpression(node.element)
    } else {
      this.add('(')
      this.emitExpression(node.element)
      this.add(')')
    }
    this.add('[')
    this.add(']')
  }

  protected emitObjectExpression(node: n.ObjectExpression) {
    this.add('{')
    const shouldNewLineAndIndent = node.properties.length > 2
    if (shouldNewLineAndIndent) {
      this.newLine()
      this.indent()
      this.printIndent()
    } else {
      this.space()
    }
    node.properties.forEach((property, index, properties) => {
      this.emitObjectExpressionProperty(property)
      if (index !== properties.length - 1) {
        this.add(',')
        if (shouldNewLineAndIndent) {
          this.newLine()
          this.printIndent()
        } else {
          this.space()
        }
      }
    })
    if (shouldNewLineAndIndent) {
      this.newLine()
      this.dedent()
      this.printIndent()
    } else {
      this.space()
    }
    this.add('}')
  }

  protected emitObjectExpressionProperty(node: n.ObjectExpressionProperty) {
    if (node.key.type === 'Identifier') {
      this.emitIdentifier(node.key)
    } else {
      this.emitIndexedPropertyKey(node.key)
    }
    if (node.optional) {
      this.add('?')
    }
    this.add(':')
    this.space()
    this.emitExpression(node.value)
  }

  protected emitIndexedPropertyKey(node: n.IndexedPropertyKey) {
    this.add('[')
    this.emitIdentifier(node.id)
    this.add(':')
    this.space()
    this.emitExpression(node.expression)
    this.add(']')
  }

  protected emitPattern(node: n.Pattern) {
    switch (node.type) {
      case 'InferReference':
        this.emitInferReference(node)
        break
      case 'Literal':
        this.emitLiteral(node)
        break
      case 'Identifier':
        this.emitIdentifier(node)
        break
      case 'TuplePattern':
        this.emitTuplePattern(node)
        break
      case 'CallPattern':
        this.emitCallPattern(node)
        break
      case 'IndexedAccessPattern':
        this.emitIndexedAccessPattern(node)
        break
    }
  }

  protected emitInferReference(node: n.InferReference) {
    this.add('infer')
    this.space()
    this.emitIdentifier(node.id)
  }

  protected emitTuplePattern(node: n.TuplePattern) {
    this.add('[')
    node.elements.forEach((element, index, elements) => {
      this.emitPattern(element)
      if (index !== elements.length - 1) {
        this.add(',')
        this.space()
      }
    })
    this.add(']')
  }

  protected emitCallPattern(node: n.CallPattern) {
    this.emitPattern(node.callee)
    if (node.arguments.length > 0) {
      this.add('<')
      node.arguments.forEach((argument, index, args) => {
        this.emitPattern(argument)
        if (index !== args.length - 1) {
          this.add(',')
          this.space()
        }
      })
      this.add('>')
    }
  }

  protected emitIndexedAccessPattern(node: n.IndexedAccessPattern) {
    this.emitPattern(node.object)
    this.add('[')
    this.emitExpression(node.index)
    this.add(']')
  }
}
