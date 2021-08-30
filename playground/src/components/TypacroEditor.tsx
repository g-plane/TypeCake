import * as React from 'react'
import { useAtom } from 'jotai'
import { Box } from '@chakra-ui/react'
import { sourceCodeAtom } from '../states/codeAtom'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const TypacroEditor: React.FC = () => {
  const [sourceCode, setSourceCode] = useAtom(sourceCodeAtom)

  const handleEditorValueChange = (value?: string) => {
    if (value != null) {
      setSourceCode(value)
    }
  }

  return (
    <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
      <React.Suspense fallback={''}>
        <MonacoEditor
          width="100%"
          height="100%"
          value={sourceCode}
          onChange={handleEditorValueChange}
        />
      </React.Suspense>
    </Box>
  )
}

TypacroEditor.displayName = 'TypacroEditor'

export default TypacroEditor
