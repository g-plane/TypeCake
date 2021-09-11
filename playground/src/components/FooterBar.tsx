import { Flex, Link, Text } from '@chakra-ui/react'
import { FiGithub } from 'react-icons/fi'

export default function FooterBar() {
  return (
    <Flex
      width="full"
      px={4}
      py={3}
      bg="pink.100"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text>
        By{' '}
        <Link href="https://github.com/g-plane" isExternal>
          Pig Fang
        </Link>
      </Text>
      <Link href="https://github.com/g-plane/typecake" isExternal>
        <FiGithub size={24} />
      </Link>
    </Flex>
  )
}
