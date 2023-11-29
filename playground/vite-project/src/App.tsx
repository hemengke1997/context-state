import CounterContainer from './Counter'
import A from './components/A'

function App() {
  return (
    <CounterContainer.Provider>
      <A />
    </CounterContainer.Provider>
  )
}

export default App
