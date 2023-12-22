import { createContainer } from 'context-state'
import React from 'react'

const useCounter = () => {
  const [count, setCount] = React.useState(0)
  const [count2, setCount2] = React.useState(0)

  return {
    count,
    setCount,
    count2,
    setCount2,
  }
}

const CounterContainer = createContainer(useCounter)

export default CounterContainer
