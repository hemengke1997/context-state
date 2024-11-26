import { createContext, createElement, type ReactNode, useContext, useRef } from 'react'
import {
  CONTEXT_VALUE,
  type ContextValue,
  EMPTY,
  type EqualityFn,
  type Listener,
  type SelectorFn,
  type UseHookType,
} from './types'
import { pick, shallowEqual, useIsomorphicLayoutEffect, useSafeState } from './utils'

const ErrorText = '[context-state]: Component must be wrapped with <Container.Provider>'

// A hack way for resolving the `Context.Provider` injection
const __ContainerCache__ = new Map<string, ContextValue<any>>()

export function createContainer<Value, InitialValue>(
  useHook: UseHookType<InitialValue, Value>,
  equalityFn: EqualityFn = shallowEqual,
) {
  const _equalityFn = equalityFn

  const Context: React.Context<ContextValue<Value> | symbol> = createContext<ContextValue<Value> | symbol>(EMPTY)

  const Provider = ({ value, children }: { value?: InitialValue; children: ReactNode }) => {
    const inHookValue = useHook(value as InitialValue)
    const valueRef = useRef(inHookValue)
    const contextValue = useRef<ContextValue<Value>>()

    if (!contextValue.current) {
      const listeners = new Set<Listener<Value>>()

      contextValue.current = {
        [CONTEXT_VALUE]: {
          /* "v"alue     */ v: valueRef,
          /* "l"isteners */ l: listeners,
        },
      }
    }

    if (__ContainerCache__.has(useHook.toString())) {
      __ContainerCache__.delete(useHook.toString())
    }

    __ContainerCache__.set(useHook.toString(), contextValue.current)

    useIsomorphicLayoutEffect(() => {
      valueRef.current = inHookValue
      ;(contextValue.current as ContextValue<Value>)?.[CONTEXT_VALUE].l.forEach((listener) => {
        listener(inHookValue)
      })
    }, [inHookValue])

    return createElement(Context.Provider, { value: contextValue.current }, children)
  }

  /**
   * @example
   * import { createContainer } from 'context-state'
   *
   * const Container = createContainer(() => {
   *  const [n, setN] = useState(0)
   * })
   *
   * <Container.Provider>
   *  <Container.Consumer>
   *   {({n}) => <div>{n}</div>}
   *  </Container.Consumer>
   * </Container.Provider>
   */
  const Consumer = ({ children }: { children: (value: Value) => ReactNode }) => {
    return children(useSelector((state) => state))
  }

  /**
   * @example
   * import { useSelector } from 'context-state'
   *
   * export const CounterComponent = () => {
   *   const counter = useSelector(state => state.counter)
   *   return <div>{counter}</div>
   * }
   */
  function useSelector<Selected>(selector: SelectorFn<Value, Selected>, equalityFn?: EqualityFn<Selected>): Selected {
    const eq = equalityFn || _equalityFn

    const context = useContext(Context)

    let contextValue = (context as ContextValue<Value>)?.[CONTEXT_VALUE]

    if (context === EMPTY) {
      const cached = __ContainerCache__.get(useHook.toString())?.[CONTEXT_VALUE]
      if (!cached) {
        throw new Error(ErrorText)
      } else {
        contextValue = cached
      }
    }

    const {
      /* "v"alue     */ v: { current: value },
      /* "l"isteners */ l: listeners,
    } = contextValue

    const [, triggerRender] = useSafeState(0)

    const selected = selector(value)

    const currentRef = useRef<{
      value: Value
      selected: Selected
    }>()

    currentRef.current = {
      value,
      selected,
    }

    useIsomorphicLayoutEffect(() => {
      function checkForUpdates(nextValue: Value) {
        try {
          if (!currentRef.current) {
            return
          }
          if (currentRef.current.value === nextValue) {
            return
          }
          const nextSelected = selector(nextValue)
          if (eq(currentRef.current.selected, nextSelected, shallowEqual)) {
            return
          }
          triggerRender((n) => n + 1)
        } catch {}
      }
      // register listener
      listeners.add(checkForUpdates)
      return () => {
        listeners.delete(checkForUpdates)
      }
    }, [])

    return selected
  }

  /**
   * Syntactic sugar of useSelector
   * @example
   * import { usePicker } from 'context-state'
   *
   * export const CounterComponent = () => {
   *   const { counter } = usePicker(['counter'])
   *   return <div>{counter}</div>
   * }
   */
  function usePicker<Selected extends keyof Value>(
    selected: Selected[],
    equalityFn?: EqualityFn<Pick<Value, Selected>>,
  ): Pick<Value, Selected> {
    return useSelector((state) => pick(state as Required<Value>, selected), equalityFn)
  }

  return {
    Provider,
    Consumer,
    useSelector,
    usePicker,
  }
}
