import React from 'react'
import { createContainer } from 'context-state'

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

export default CounterContainer
