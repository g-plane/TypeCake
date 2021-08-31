import * as React from 'react'
import { useAtom } from 'jotai'
import { Box } from '@chakra-ui/react'
import {
  isShowASTAtom,
  generatedCodeAtom,
  astJsonAtom,
} from '../states/codeAtom'
import { editorOptions } from '../utils/editor-options'

const MonacoEditor = React.lazy(() => import('@monaco-editor/react'))

const TypeScriptEditor: React.FC = () => {
  const [isShowAST] = useAtom(isShowASTAtom)
  const [[generatedCode]] = useAtom(generatedCodeAtom)
  const [[ast]] = useAtom(astJsonAtom)

  const language = isShowAST ? 'json' : 'typescript'
  const output = isShowAST ? ast : generatedCode
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

TypeScriptEditor.displayName = 'TypeScriptEditor'

export default TypeScriptEditor
