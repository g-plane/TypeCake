import { useAtom } from 'jotai'
import { Box, Select, Text } from '@chakra-ui/react'
import { sourceCodeAtom } from '../states/codeAtom'

const featuresExamples = new Map([
  ['Basic', 'basic'],
  ['Object type', 'object-type'],
  ['Tuples and arrays', 'tuples-and-arrays'],
  ['Intersection type', 'intersection-type'],
  ['Union type', 'union-type'],
  ['If expression', 'if-expr'],
  ['For expression', 'for-expr'],
  ['Pattern matching', 'switch-expr'],
  ['Capturing in patterns', 'infer'],
  ['Const-in expression', 'const-in'],
  ['Pipeline expression', 'pipeline'],
  ['Template literal', 'template-literal'],
  ['Import declarations', 'import'],
])
const realWorldExamples = new Map([
  ['Unwrap promise', 'unwrap-promise'],
  ['Camel case', 'camel-case'],
])

export default function CodeSnippets() {
  const [, setSourceCode] = useAtom(sourceCodeAtom)

  const handleSelectFeatureSnippet = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const file = featuresExamples.get(event.target.value)
    if (file) {
      const code = await import(`../snippets/features/${file}.tc`)
      setSourceCode(code.default)
    }
  }

  const handleSelectRealWorldSnippet = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const file = realWorldExamples.get(event.target.value)
    if (file) {
      const code = await import(`../snippets/real-world/${file}.tc`)
      setSourceCode(code.default)
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
        {Array.from(featuresExamples.keys()).map((name) => (
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
        {Array.from(realWorldExamples.keys()).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </Box>
  )
}
