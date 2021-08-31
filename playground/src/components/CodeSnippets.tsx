import * as React from 'react'
import { useImmer } from 'use-immer'
import { useAtom } from 'jotai'
import { Box, Select, Text } from '@chakra-ui/react'
import { sourceCodeAtom } from '../states/codeAtom'

const fileNameMapping = new Map([
  ['basic', 'Basic'],
  ['switch-expr', 'Switch Expression'],
])

const CodeSnippets: React.FC = () => {
  const [, setSourceCode] = useAtom(sourceCodeAtom)
  const [snippets, updateSnippets] = useImmer(new Map<string, string>())

  React.useEffect(() => {
    const loadSnippets = async () => {
      Array.from(fileNameMapping).map(async ([file, name]) => {
        const code = await import(`../snippets/${file}.tpc`)
        updateSnippets((draft) => draft.set(name, code.default))
      })
    }
    loadSnippets()
  }, [])

  const handleSelectCodeSnippet = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = snippets.get(event.target.value)
    if (code) {
      setSourceCode(code)
    }
  }

  return (
    <Box display="flex" alignItems="center" mb={3}>
      <Text>Examples:</Text>
      <Select
        ml={2}
        width="sm"
        placeholder="Language Features"
        onChange={handleSelectCodeSnippet}
      >
        {Array.from(snippets.keys()).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </Box>
  )
}

CodeSnippets.displayName = 'CodeSnippets'

export default CodeSnippets
