import * as React from 'react'
import { extendTheme, ChakraProvider, Center, HStack } from '@chakra-ui/react'
import HeaderBar from './components/HeaderBar'
import CodeSnippets from './components/CodeSnippets'
import TypacroEditor from './components/TypacroEditor'
import TypeScriptEditor from './components/TypeScriptEditor'

const theme = extendTheme({
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
})

const App: React.FC = () => (
  <ChakraProvider theme={theme}>
    <HeaderBar />
    <CodeSnippets />
    <Center>
      <HStack width="96vw" height="88vh" spacing="60px">
        <TypacroEditor />
        <TypeScriptEditor />
      </HStack>
    </Center>
  </ChakraProvider>
)

export default App
