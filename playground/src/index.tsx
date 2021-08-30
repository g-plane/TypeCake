import ReactDOM from 'react-dom'
import { enableMapSet } from 'immer'
import App from './App'

enableMapSet()

const container = document.createElement('div')
document.body.appendChild(container)

ReactDOM.render(<App />, container)
