import * as React from 'react'
import { useAtom } from 'jotai'
import { Box, FormControl, FormLabel, Switch } from '@chakra-ui/react'
import { isShowASTAtom } from '../states/codeAtom'

const OutputControl: React.FC = () => {
  const [isShowAST, setIsShowAST] = useAtom(isShowASTAtom)

  const handleToggleShowAST = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsShowAST(event.target.checked)
  }

  return (
    <Box>
      <FormControl display="flex" alignItems="center">
        <Switch
          id="show-ast"
          checked={isShowAST}
          onChange={handleToggleShowAST}
        />
        <FormLabel htmlFor="show-ast" ml={2} mt={1} display="flex">
          AST
        </FormLabel>
      </FormControl>
    </Box>
  )
}

OutputControl.displayName = 'OutputControl'

export default OutputControl
