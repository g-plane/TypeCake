import * as React from 'react'
import { Flex, Link, Text } from '@chakra-ui/react'
import { FiGithub } from 'react-icons/fi'

const FooterBar: React.FC = () => (
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
    <Link href="https://github.com/g-plane/typacro" isExternal>
      <FiGithub size={24} />
    </Link>
  </Flex>
)

FooterBar.displayName = 'FooterBar'

export default FooterBar
