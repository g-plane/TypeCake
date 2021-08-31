import { atom } from 'jotai'
import type { Token } from 'acorn'
import { Parser, Emitter, codeFrame } from 'typacro'

export const sourceCodeAtom = atom('')

type ErrorCause = {
  message: string
  input: string
  token: Token
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
    return [null, error]
  }
})

export const astJsonAtom = atom((get) => {
  const [ast] = get(astAtom)
  return ast ? JSON.stringify(ast, null, '  ') : null
})

export const generatedCodeAtom = atom((get) => {
  const [ast] = get(astAtom)
  if (!ast) {
    return null
  }

  const emitter = new Emitter()
  return emitter.emit(ast)
})

export const errorCauseAtom = atom((get) => get(astAtom)[1]?.cause)

export const errorOutputAtom = atom((get) => {
  const cause = get(errorCauseAtom)
  if (!cause) {
    return null
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
