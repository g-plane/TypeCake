export interface CodeFrameOptions {
  line: number
  column: number
  endColumn?: number
}

export function codeFrame(input: string, options: CodeFrameOptions): string {
  const lines = input.split(/\r?\n/)
  const topLineNumber = Math.max(0, options.line - 3)
  const bottomLineNumber = Math.min(lines.length, options.line + 1)
  const paddingWidth = bottomLineNumber.toString().length + 1

  const frame = lines
    .slice(topLineNumber, bottomLineNumber + 1)
    .map((line, index) => {
      const lineNumber = index + topLineNumber + 1
      const paddedLineNumber = lineNumber.toString().padStart(paddingWidth)
      const focus = lineNumber === options.line ? ' >' : '  '
      const prefix = `${focus}${paddedLineNumber} | `
      return `${prefix}${line}`
    })

  const totalColumns = lines[options.line - 1]!.length
  const leftPad = ' '.repeat(Math.max(1, options.column) + paddingWidth + 4)
  if (
    options.endColumn != null &&
    (options.endColumn <= options.column || options.endColumn > totalColumns)
  ) {
    throw new RangeError(
      "'endColumn' must be greater than 'column' and less than line length."
    )
  }

  const pointer = '^'.repeat(
    options.endColumn ? options.endColumn - options.column + 1 : 1
  )
  const focus = `${leftPad}${pointer}`
  frame.splice(options.line - topLineNumber, 0, focus)

  return frame.join('\n')
}
