import { atom } from 'jotai'
import { Parser, Emitter } from 'typacro'

export const sourceCodeAtom = atom('')

type ParserResult = [ReturnType<Parser['parse']>, null] | [null, SyntaxError]

const astAtom = atom((get): ParserResult => {
  const sourceCode = get(sourceCodeAtom)

  try {
    const parser = new Parser(sourceCode)
    return [parser.parse(), null]
  } catch (error) {
    return [null, error]
  }
})

export const astJsonAtom = atom((get): [string, SyntaxError | null] => {
  const [ast, error] = get(astAtom)
  if (ast) {
    return [JSON.stringify(ast, null, '  '), null]
  }
  return [error.message, error]
})

export const generatedCodeAtom = atom((get): [string, SyntaxError | null] => {
  const [ast, error] = get(astAtom)
  if (ast) {
    const emitter = new Emitter()
    return [emitter.emit(ast), null]
  }
  return [error.message, error]
})

export const isShowASTAtom = atom(false)
