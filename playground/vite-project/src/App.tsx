import A from './components/A'
import CounterContainer from './Counter'

function App() {
  return (
    <CounterContainer.Provider>
      <A />
    </CounterContainer.Provider>
  )
}

export default App
