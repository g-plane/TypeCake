import * as React from 'react'
import { useAtom } from 'jotai'
import { Box } from '@chakra-ui/react'
import { gzip, ungzip } from 'pako'
import { Base64 } from 'js-base64'
import { sourceCodeAtom } from '../states/codeAtom'
import { editorOptions } from '../utils/editor-options'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const TypacroEditor: React.FC = () => {
  const [sourceCode, setSourceCode] = useAtom(sourceCodeAtom)

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
        />
      </React.Suspense>
    </Box>
  )
}

TypacroEditor.displayName = 'TypacroEditor'

export default TypacroEditor
