import * as React from 'react'
import { useImmer } from 'use-immer'
import { useAtom } from 'jotai'
import { Box, Select, Text } from '@chakra-ui/react'
import { sourceCodeAtom } from '../states/codeAtom'

const featuresMapping = new Map([
  ['basic', 'Basic'],
  ['object-type', 'Object Type'],
  ['tuples-and-arrays', 'Tuples and arrays'],
  ['if-expr', 'If Expression'],
  ['switch-expr', 'Pattern matching'],
  ['infer', 'Capturing in patterns'],
  ['const-in', 'Const-in expression'],
  ['pipeline', 'Pipeline expression'],
  ['template-literal', 'Template literal'],
  ['import', 'Import declarations'],
])
const realWorldMapping = new Map([['unwrap-promise', 'Unwrap Promise']])

const CodeSnippets: React.FC = () => {
  const [, setSourceCode] = useAtom(sourceCodeAtom)
  const [featureSnippets, updateFeatureSnippets] = useImmer(
    new Map<string, string>()
  )
  const [realWorldSnippets, updateRealWorldSnippets] = useImmer(
    new Map<string, string>()
  )

  React.useEffect(() => {
    const loadSnippets = async () => {
      Array.from(featuresMapping).map(async ([file, name]) => {
        const code = await import(`../snippets/features/${file}.tpc`)
        updateFeatureSnippets((draft) => draft.set(name, code.default))
      })
      Array.from(realWorldMapping).map(async ([file, name]) => {
        const code = await import(`../snippets/real-world/${file}.tpc`)
        updateRealWorldSnippets((draft) => draft.set(name, code.default))
      })
    }
    loadSnippets()
  }, [])

  const handleSelectFeatureSnippet = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = featureSnippets.get(event.target.value)
    if (code) {
      setSourceCode(code)
    }
  }

  const handleSelectRealWorldSnippet = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = realWorldSnippets.get(event.target.value)
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
        onChange={handleSelectFeatureSnippet}
      >
        {Array.from(featureSnippets.keys()).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Text mx={2}>or</Text>
      <Select
        width="sm"
        placeholder="Real World Examples"
        onChange={handleSelectRealWorldSnippet}
      >
        {Array.from(realWorldSnippets.keys()).map((name) => (
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
