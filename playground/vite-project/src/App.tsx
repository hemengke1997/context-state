import CounterContainer from './Counter'
import A from './components/A'
import B from './components/B'

function App() {
  return (
    <CounterContainer.Provider>
      <A />
      <B />
      <CounterContainer.Consumer>
        {({ count2, setCount2 }) => (
          <div>
            <span>{count2}</span>
            <button type='button' onClick={() => setCount2((s) => s + 1)}>
              ADD2
            </button>
          </div>
        )}
      </CounterContainer.Consumer>
    </CounterContainer.Provider>
  )
}

export default App
