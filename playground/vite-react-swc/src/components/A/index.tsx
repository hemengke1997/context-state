import React from 'react'
import { CounterContainer } from '../../Counter'
import { GlobalContext } from '../../contexts/GlobalContext'
import useTmp from '../../useTmp'

export function A() {
  const { count, setCount } = CounterContainer.usePicker(['count', 'setCount'])

  const { tmp } = useTmp()

  console.log(tmp)

  const increment = () => setCount((s) => s + 1)
  const renderCount = React.useRef(0)
  renderCount.current += 1

  const { globalState, Inner } = GlobalContext.usePicker(['globalState', 'Inner'])

  console.log(globalState, 'globalState')

  return (
    <div>
      <span>{count}</span>
      <button type='button' onClick={increment}>
        ADD1
      </button>
      <span>{renderCount.current}</span>
      <Inner />
    </div>
  )
}
