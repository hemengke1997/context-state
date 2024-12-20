import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { createContainer } from '../src'

describe('render spec', () => {
  const realError = console.error

  afterEach(() => {
    cleanup()
    console.error = realError
  })
  beforeEach(() => {
    console.error = vitest.fn()
  })

  it('should not render with other', () => {
    const CounterContainer = createContainer(() => {
      const [count, setCount] = React.useState(0)
      const [total, increment] = React.useReducer((c) => c + 1, 0)
      return {
        count,
        setCount,
        total,
        increment,
      }
    })

    const Counter1 = React.memo(() => {
      const { count, setCount } = CounterContainer.usePicker(['count', 'setCount'])

      const renderCount = React.useRef(0)

      console.log(renderCount.current, 'current', count, 'count')

      if (renderCount.current !== count) throw new Error('Inconsistent rendering (1)!')

      renderCount.current += 1

      return (
        <div>
          <span>{count}</span>
          <button type='button' onClick={() => setCount((n) => n + 1)}>
            ADD1
          </button>
        </div>
      )
    })

    const Counter2 = React.memo(() => {
      const { total, increment } = CounterContainer.usePicker(['total', 'increment'])

      const renderCount = React.useRef(0)

      if (renderCount.current !== total) throw new Error('Inconsistent rendering (2)!')

      renderCount.current += 1
      return (
        <div>
          <span>{total}</span>
          <button type='button' onClick={increment}>
            ADD2
          </button>
        </div>
      )
    })

    const App = () => (
      <CounterContainer.Provider>
        <Counter1 />
        <Counter2 />
        <CounterContainer.Consumer>
          {({ increment }) => (
            <div>
              <button type='button' onClick={increment}>
                ADD3
              </button>
            </div>
          )}
        </CounterContainer.Consumer>
      </CounterContainer.Provider>
    )
    const { getAllByText } = render(<App />)
    expect(() => fireEvent.click(getAllByText('ADD1')[0])).not.toThrow()
    expect(() => fireEvent.click(getAllByText('ADD2')[0])).not.toThrow()
    expect(() => fireEvent.click(getAllByText('ADD3')[0])).not.toThrow()
  })

  it('should throw error in dev', () => {
    const CounterContainer = createContainer(() => {
      const [count, setCount] = React.useState(0)
      return {
        count,
        setCount,
      }
    })
    const Counter = React.memo(() => {
      const { count } = CounterContainer.usePicker(['count', 'setCount'])
      return (
        <div>
          <span>{count}</span>
        </div>
      )
    })
    const App = () => <Counter />

    expect(() => render(<App />)).toThrowError()
  })

  it('should in context', () => {
    const CounterContainer = createContainer(() => {
      const [count, setCount] = React.useState(0)
      return {
        count,
        setCount,
      }
    })
    const Counter = React.memo(() => {
      const inContext = CounterContainer.useInContext()
      return <>{JSON.stringify(inContext)}</>
    })
    const App = () => (
      <CounterContainer.Provider>
        <Counter />
      </CounterContainer.Provider>
    )
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
  })

  it('should not in context', () => {
    const CounterContainer = createContainer(() => {
      const [count, setCount] = React.useState(0)
      return {
        count,
        setCount,
      }
    })
    const Counter = React.memo(() => {
      const inContext = CounterContainer.useInContext()
      return <>{JSON.stringify(inContext)}</>
    })
    const App = () => <Counter />
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
  })
})
