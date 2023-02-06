import React from "react"
import CounterContainer from "../../Counter"

const A = React.memo(() => {
  const { count, setCount } = CounterContainer.usePicker(['count', 'setCount'])
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
