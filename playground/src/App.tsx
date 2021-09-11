import {
  extendTheme,
  ChakraProvider,
  Box,
  Center,
  Flex,
  HStack,
} from '@chakra-ui/react'
import HeaderBar from './components/HeaderBar'
import CodeSnippets from './components/CodeSnippets'
import OutputControl from './components/OutputControl'
import TypeCakeEditor from './components/TypeCakeEditor'
import TypeScriptEditor from './components/TypeScriptEditor'
import FooterBar from './components/FooterBar'

const theme = extendTheme({
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
})

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Flex
        flexDirection="column"
        justifyContent="space-between"
        height="100vh"
      >
        <Box>
          <HeaderBar />
          <Box px="2vw" pt={3}>
            <Flex justifyContent="space-between" alignItems="center">
              <CodeSnippets />
              <OutputControl />
            </Flex>
            <Center>
              <HStack width="full" height="80vh" spacing="60px">
                <TypeCakeEditor />
                <TypeScriptEditor />
              </HStack>
            </Center>
          </Box>
        </Box>
        <FooterBar />
      </Flex>
    </ChakraProvider>
  )
}
