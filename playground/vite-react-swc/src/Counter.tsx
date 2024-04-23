import { createContainer } from 'context-state'
import React, { useEffect } from 'react'

const CounterContainer = createContainer(() => {
  const [count, setCount] = React.useState(0)
  const [count2, setCount2] = React.useState(0)

  useEffect(() => {
    console.log(count, 'count')
  }, [count])

  return {
    count,
    setCount,
    count2,
    setCount2,
  }
})

export { CounterContainer }
