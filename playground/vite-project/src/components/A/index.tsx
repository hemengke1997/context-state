import React, { memo } from 'react'
import CounterContainer from '../../Counter'

const A = memo(() => {
  const { count, setCount } = CounterContainer.usePicker(['count', 'setCount'])
  const renderCount = React.useRef(-1)
  renderCount.current += 1

  return (
    <div>
      <span>{count}</span>
      <button type='button' onClick={() => setCount((t) => t + 1)}>
        ADD1
      </button>
      <span>render times: {renderCount.current}</span>
    </div>
  )
})

export default A
