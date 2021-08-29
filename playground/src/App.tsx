import * as React from 'react'
import { Box, ChakraProvider, Center, HStack } from '@chakra-ui/react'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const App: React.FC = () => (
  <ChakraProvider>
    <Center>
      <HStack width="88vw" height="88vh" spacing="60px">
        <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
          <React.Suspense fallback={''}>
            <MonacoEditor width="100%" height="100%" />
          </React.Suspense>
        </Box>
        <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
          <React.Suspense fallback={''}>
            <MonacoEditor width="100%" height="100%" defaultLanguage="typescript" />
          </React.Suspense>
        </Box>
      </HStack>
    </Center>
  </ChakraProvider>
)

export default App
