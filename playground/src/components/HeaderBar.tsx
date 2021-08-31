import * as React from 'react'
import { Box, Heading } from '@chakra-ui/react'

const HeaderBar: React.FC = () => (
  <Box
    px="20px"
    py="12px"
    bg="pink.400"
    color="white"
    borderBottomWidth="1px"
    borderBottomStyle="solid"
    borderBottomColor="gray.300"
  >
    <Heading size="lg" letterSpacing="tight">Typacro Playground</Heading>
  </Box>
)

HeaderBar.displayName = 'HeaderBar'

export default HeaderBar
