import * as React from 'react'
import {
  extendTheme,
  ChakraProvider,
  Box,
  Center,
  HStack,
} from '@chakra-ui/react'
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
    <Box px="2vw" pt={3}>
      <CodeSnippets />
      <Center>
        <HStack width="full" height="88vh" spacing="60px">
          <TypacroEditor />
          <TypeScriptEditor />
        </HStack>
      </Center>
    </Box>
  </ChakraProvider>
)

export default App
