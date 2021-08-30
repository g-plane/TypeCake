import * as React from 'react'
import { useAtom } from 'jotai'
import { Box } from '@chakra-ui/react'
import { generatedCodeAtom } from '../states/codeAtom'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const TypeScriptEditor: React.FC = () => {
  const [[generatedCode]] = useAtom(generatedCodeAtom)

  return (
    <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
      <React.Suspense fallback={''}>
        <MonacoEditor
          width="100%"
          height="100%"
          defaultLanguage="typescript"
          value={generatedCode}
        />
      </React.Suspense>
    </Box>
  )
}

TypeScriptEditor.displayName = 'TypeScriptEditor'

export default TypeScriptEditor
