import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const App: React.FC = () => (
  <ChakraProvider>
    <div>hi</div>
    <MonacoEditor height="400px" width="400px" defaultLanguage="javascript" />
  </ChakraProvider>
)

export default App
