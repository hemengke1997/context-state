import { createContainer } from 'context-state'
import React from 'react'

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

export { CounterContainer }
