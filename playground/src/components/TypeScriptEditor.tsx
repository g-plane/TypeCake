import * as React from 'react'
import { Box } from '@chakra-ui/react'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const TypeScriptEditor: React.FC = () => {
  return (
    <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
      <React.Suspense fallback={''}>
        <MonacoEditor width="100%" height="100%" defaultLanguage="typescript" />
      </React.Suspense>
    </Box>
  )
}

export default TypeScriptEditor
