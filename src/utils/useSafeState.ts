import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react'

const useUnmountedRef = () => {
  const unmountedRef = useRef(false)
  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
    }
  }, [])
  return unmountedRef
}

function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]

function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]

function useSafeState<S>(initialState?: S | (() => S)) {
  const unmountedRef = useUnmountedRef()
  const [state, setState] = useState(initialState)
  const setCurrentState = useCallback((currentState: S) => {
    /** if component is unmounted, stop update */
    if (unmountedRef.current) return
    setState(currentState)
  }, [])

  return [state, setCurrentState] as const
}

export { useSafeState }
