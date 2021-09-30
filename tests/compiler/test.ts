import * as assert from 'node:assert'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { isExist } from '../utils'
import { Parser, Emitter } from '../../src'

const normalizeTestName = (name: string) => name.replace(/-/g, ' ')

const snapshotDir = path.join(__dirname, 'snapshots')

describe.each(
  fs
    .readdirSync(path.join(__dirname, 'fixtures'))
    .map((category) => ({ category, testName: normalizeTestName(category) }))
)('$testName', ({ category }) => {
  it.each(
    fs
      .readdirSync(path.join(__dirname, 'fixtures', category))
      .map((fileName) => ({
        fileName,
        testName: normalizeTestName(path.basename(fileName, '.tc')),
      }))
  )('$testName', async ({ fileName }) => {
    const code = await fs.promises.readFile(
      path.join(__dirname, 'fixtures', category, fileName),
      'utf8'
    )
    const parser = new Parser(code)
    const ast = parser.parse()

    const snapshotPath = path.join(
      snapshotDir,
      category,
      path.basename(fileName, '.tc')
    )
    if (!(await isExist(snapshotPath))) {
      await fs.promises.mkdir(snapshotPath, { recursive: true })
    }

    const astSnapshot = path.join(snapshotPath, 'parser.json')
    if (await isExist(astSnapshot)) {
      const snapshot = JSON.parse(
        await fs.promises.readFile(astSnapshot, 'utf8')
      )
      assert.deepStrictEqual(JSON.parse(JSON.stringify(ast)), snapshot)
    } else {
      await fs.promises.writeFile(astSnapshot, JSON.stringify(ast, null, 2))
    }

    const emitter = new Emitter()
    const emittedCode = emitter.emit(ast)
    const outputSnapshot = path.join(snapshotPath, 'output.ts')
    if (await isExist(outputSnapshot)) {
      const snapshot = await fs.promises.readFile(outputSnapshot, 'utf8')
      assert.strictEqual(emittedCode, snapshot)
    } else {
      await fs.promises.writeFile(outputSnapshot, emittedCode)
    }
  })
})
