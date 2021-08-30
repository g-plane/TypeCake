import { atom } from 'jotai'
import { Parser, Emitter } from 'typacro'

export const sourceCodeAtom = atom('')

export const generatedCodeAtom = atom((get): [string, SyntaxError | null] => {
  const sourceCode = get(sourceCodeAtom)

  try {
    const parser = new Parser(sourceCode)
    const emitter = new Emitter()

    return [emitter.emit(parser.parse()), null]
  } catch (error) {
    return ['// There may are syntax errors.\n', error]
  }
})
