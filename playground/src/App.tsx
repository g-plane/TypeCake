import * as React from 'react'
import { ChakraProvider, Center, HStack } from '@chakra-ui/react'
import TypacroEditor from './components/TypacroEditor'
import TypeScriptEditor from './components/TypeScriptEditor'

const App: React.FC = () => (
  <ChakraProvider>
    <Center>
      <HStack width="88vw" height="88vh" spacing="60px">
        <TypacroEditor />
        <TypeScriptEditor />
      </HStack>
    </Center>
  </ChakraProvider>
)

export default App
