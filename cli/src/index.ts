import { promises as fs } from 'fs'
import { Parser, Emitter } from 'typacro'
;(async () => {
  let code = ''
  if (process.argv[2]) {
    code = await fs.readFile(process.argv[2], 'utf8')
  } else {
    for await (const text of process.stdin) {
      code += text
    }
  }

  const parser = new Parser(code)
  const emitter = new Emitter()
  console.log(emitter.emit(parser.parse()))
})()
