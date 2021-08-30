import * as React from 'react'
import { Box } from '@chakra-ui/react'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const TypacroEditor: React.FC = () => {
  return (
    <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
      <React.Suspense fallback={''}>
        <MonacoEditor width="100%" height="100%" />
      </React.Suspense>
    </Box>
  )
}

export default TypacroEditor
