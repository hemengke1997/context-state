import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createContainer } from '../src'

describe('basic spec', () => {
  afterEach(cleanup)

  it('counter', () => {
    const CounterContainer = createContainer(() => {
      const [count, setCount] = React.useState(0)
      const [count2, setCount2] = React.useState(0)
      return {
        count,
        setCount,
        count2,
        setCount2,
      }
    })

    const Counter1 = React.memo(() => {
      const { count, setCount } = CounterContainer.usePicker(['count', 'setCount'])
      // const x = CounterContainer.useSelector((s) => s.count)
      const increment = () => setCount((s) => s + 1)
      const renderCount = React.useRef(0)
      renderCount.current += 1

      return (
        <div>
          <span>{count}</span>
          <button type='button' onClick={increment}>
            ADD1
          </button>
          <span>{renderCount.current}</span>
        </div>
      )
    })

    const Counter2 = React.memo(() => {
      const { count2, setCount2 } = CounterContainer.usePicker(['count2', 'setCount2'])
      const increment = () => setCount2((s) => s + 1)
      const renderCount = React.useRef(0)
      renderCount.current += 1
      return (
        <div>
          <span>{count2}</span>
          <button type='button' onClick={increment}>
            ADD2
          </button>
          <span>{renderCount.current}</span>
        </div>
      )
    })

    const App = () => (
      <CounterContainer.Provider>
        <Counter1 />
        <Counter2 />
      </CounterContainer.Provider>
    )
    const { getAllByText, container } = render(<App />)
    expect(container).toMatchSnapshot()
    fireEvent.click(getAllByText('ADD1')[0])
    expect(container).toMatchSnapshot()
  })
})
