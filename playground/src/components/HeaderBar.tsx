import { Box, Heading } from '@chakra-ui/react'

export default function HeaderBar() {
  return (
    <Box
      as="header"
      px="20px"
      py="12px"
      bg="pink.400"
      color="white"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="gray.300"
    >
      <Heading as="h1" size="lg" letterSpacing="tight">
        🍰 TypeCake Playground
      </Heading>
    </Box>
  )
}
