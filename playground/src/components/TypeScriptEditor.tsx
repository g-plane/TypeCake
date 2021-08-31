import * as React from 'react'
import { useAtom } from 'jotai'
import { Box } from '@chakra-ui/react'
import {
  isShowASTAtom,
  generatedCodeAtom,
  astJsonAtom,
  errorOutputAtom,
} from '../states/codeAtom'
import { editorOptions } from '../utils/editor-options'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

export default function TypeScriptEditor() {
  const [isShowAST] = useAtom(isShowASTAtom)
  const [generatedCode] = useAtom(generatedCodeAtom)
  const [ast] = useAtom(astJsonAtom)
  const [errorOutput] = useAtom(errorOutputAtom)

  const language = isShowAST ? 'json' : 'typescript'
  const output = errorOutput ? errorOutput : isShowAST ? ast : generatedCode
  const options = { ...editorOptions, readOnly: isShowAST }

  return (
    <Box width="100%" height="100%" borderWidth="thin" borderColor="gray.400">
      <React.Suspense fallback={''}>
        <MonacoEditor
          defaultLanguage="typescript"
          language={language}
          value={output}
          options={options}
        />
      </React.Suspense>
    </Box>
  )
}
