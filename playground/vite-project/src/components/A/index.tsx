import React, { memo } from 'react'
import CounterContainer from '../../Counter'

const A = memo(() => {
  const { count, setCount } = CounterContainer.useSelector((s) => ({ count: s.count, setCount: s.setCount }))
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

export default A
