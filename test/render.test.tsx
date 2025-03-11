import React from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vitest } from 'vitest'
import { createStore } from '../src'

describe('render spec', () => {
  let consoleErrorSpy: MockInstance

  afterEach(() => {
    cleanup()
    consoleErrorSpy.mockRestore()
  })
  beforeEach(() => {
    consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should not render with other', () => {
    const CounterStore = createStore(() => {
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
      const { count, setCount } = CounterStore.useStore(['count', 'setCount'])

      const renderCount = React.useRef(0)

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
      const { increment } = CounterStore.useStore(['increment'])

      return (
        <div>
          <button type='button' onClick={increment}>
            ADD2
          </button>
        </div>
      )
    })

    const Counter3 = React.memo(() => {
      const { total, increment } = CounterStore.useStore(['total', 'increment'])

      const renderCount = React.useRef(0)

      if (renderCount.current !== total) throw new Error('Inconsistent rendering (3)!')

      renderCount.current += 1
      return (
        <div>
          <span>{total}</span>
          <button type='button' onClick={increment}>
            ADD3
          </button>
        </div>
      )
    })

    const App = () => (
      <CounterStore.Provider>
        <Counter1 />
        <Counter2 />
        <Counter3 />
      </CounterStore.Provider>
    )
    const { getAllByText } = render(<App />)
    expect(() => fireEvent.click(getAllByText('ADD1')[0])).not.toThrow()
    expect(() => fireEvent.click(getAllByText('ADD2')[0])).not.toThrow()
    expect(() => fireEvent.click(getAllByText('ADD3')[0])).not.toThrow()
  })

  it('should throw error in dev', () => {
    const CounterStore = createStore(() => {
      const [count, setCount] = React.useState(0)
      return {
        count,
        setCount,
      }
    })
    const Counter = React.memo(() => {
      const { count } = CounterStore.useStore(['count', 'setCount'])
      return (
        <div>
          <span>{count}</span>
        </div>
      )
    })
    const App = () => <Counter />
    render(<App />)
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should log error', () => {
    const CounterStore = createStore(() => {
      const [count, setCount] = React.useState(0)
      return {
        count,
        setCount,
      }
    })
    const Counter = React.memo(() => {
      CounterStore.useStore()
      return null
    })
    const App = () => <Counter />
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
