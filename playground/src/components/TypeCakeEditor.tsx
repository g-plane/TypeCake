import { Box } from '@chakra-ui/react'
import { useMonaco } from '@monaco-editor/react'
import { useAtom } from 'jotai'
import { Base64 } from 'js-base64'
import type * as monaco from 'monaco-editor'
import { gzip, ungzip } from 'pako'
import * as React from 'react'
import { errorCauseAtom, sourceCodeAtom } from '../states/codeAtom'
import { editorOptions } from '../utils/editor-options'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

export default function TypeCakeEditor() {
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
  }, [setSourceCode])

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
      monacoInstance.editor.setModelMarkers(model, 'typecake', [])
      return
    }
    monacoInstance.editor.setModelMarkers(model, 'typecake', [
      {
        source: 'TypeCake',
        message: errorCause.message,
        severity: monacoInstance.MarkerSeverity.Error,
        startLineNumber: errorCause.token.loc!.start.line,
        startColumn: errorCause.token.loc!.start.column + 1,
        endLineNumber: errorCause.token.loc!.end.line,
        endColumn: errorCause.token.loc!.end.column + 1,
      },
    ])
  }, [errorCause, monacoInstance])

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
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
