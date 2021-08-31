import * as React from 'react'
import { useAtom } from 'jotai'
import { Box } from '@chakra-ui/react'
import type * as monaco from 'monaco-editor'
import { useMonaco } from '@monaco-editor/react'
import { gzip, ungzip } from 'pako'
import { Base64 } from 'js-base64'
import { errorCauseAtom, sourceCodeAtom } from '../states/codeAtom'
import { editorOptions } from '../utils/editor-options'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

export default function TypacroEditor() {
  const [sourceCode, setSourceCode] = useAtom(sourceCodeAtom)
  const [errorCause] = useAtom(errorCauseAtom)
  const monacoInstance = useMonaco()
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  )

  React.useEffect(() => {
    const url = new URL(location.href)
    const encodedCode = url.searchParams.get('code')
    if (!encodedCode) {
      return
    }

    try {
      const decoded = ungzip(Base64.toUint8Array(encodedCode), { to: 'string' })
      setSourceCode(decoded)
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    const gzippedCode = Base64.fromUint8Array(gzip(sourceCode), true)
    const url = new URL(location.href)
    url.searchParams.set('code', gzippedCode)
    history.pushState(null, '', url.toString())
  }, [sourceCode])

  React.useEffect(() => {
    const model = editorRef.current?.getModel()
    if (!model || !monacoInstance) {
      return
    }

    if (!errorCause) {
      monacoInstance.editor.setModelMarkers(model, 'typacro', [])
      return
    }
    monacoInstance.editor.setModelMarkers(model, 'typacro', [
      {
        source: 'Typacro',
        message: errorCause.message,
        severity: monacoInstance.MarkerSeverity.Error,
        startLineNumber: errorCause.token.loc!.start.line,
        startColumn: errorCause.token.loc!.start.column + 1,
        endLineNumber: errorCause.token.loc!.end.line,
        endColumn: errorCause.token.loc!.end.column + 1,
      },
    ])
  }, [errorCause])

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor
  }

  const handleEditorValueChange = (value?: string) => {
    if (value != null) {
      setSourceCode(value)
    }
  }

  return (
    <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
      <React.Suspense fallback={''}>
        <MonacoEditor
          value={sourceCode}
          onChange={handleEditorValueChange}
          options={editorOptions}
          onMount={handleEditorDidMount}
        />
      </React.Suspense>
    </Box>
  )
}
