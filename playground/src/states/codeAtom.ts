import { atom } from 'jotai'
import { Emitter, Parser, type Token, codeFrame } from 'typecake'

export const sourceCodeAtom = atom('')

type ErrorCause = {
  message: string,
  input: string,
  lastToken: Token,
  token: Token,
}

type ParserResult =
  | [ReturnType<Parser['parse']>, null]
  | [null, SyntaxError & { cause: ErrorCause }]

const astAtom = atom((get): ParserResult => {
  const sourceCode = get(sourceCodeAtom)

  try {
    const parser = new Parser(sourceCode)
    return [parser.parse(), null]
  } catch (error) {
    return [null, error as SyntaxError & { cause: ErrorCause }]
  }
})

export const astJsonAtom = atom((get) => {
  const [ast] = get(astAtom)
  return ast ? JSON.stringify(ast, null, '  ') : ''
})

export const generatedCodeAtom = atom((get) => {
  const [ast] = get(astAtom)
  if (!ast) {
    return ''
  }

  const emitter = new Emitter()
  return emitter.emit(ast)
})

export const errorCauseAtom = atom((get) => get(astAtom)[1]?.cause)

export const errorOutputAtom = atom((get) => {
  const cause = get(errorCauseAtom)
  if (!cause) {
    return ''
  }

  const lines = codeFrame(cause.input, {
    line: cause.token.loc!.start.line,
    column: cause.token.loc!.start.column,
    endColumn: cause.token.loc!.end.column,
  })
    .split('\n')
    .map((line) => `// ${line}`)
  lines.splice(0, 0, `// ${cause.message}`, '//')
  return lines.join('\n')
})

export const isShowASTAtom = atom(false)
