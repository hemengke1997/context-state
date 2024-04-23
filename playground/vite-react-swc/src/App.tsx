import { CounterContainer } from './Counter'
import { A } from './components/A'
import { GlobalContext } from './contexts/GlobalContext'

function App() {
  return (
    <GlobalContext.Provider>
      <CounterContainer.Provider>
        <A />
      </CounterContainer.Provider>
    </GlobalContext.Provider>
  )
}

export default App
