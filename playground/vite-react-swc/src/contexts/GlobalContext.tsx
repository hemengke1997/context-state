import { createContainer } from 'context-state'
import { useState } from 'react'

const useGlobalContext = () => {
  const [globalState, setGlobalState] = useState<number>(0)

  const Inner = () => {
    return <div>inner</div>
  }

  return { globalState, setGlobalState, Inner }
}

const GlobalContext = createContainer(useGlobalContext)

export { GlobalContext }
