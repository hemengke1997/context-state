import { type MutableRefObject, type ReactNode, createContext, createElement, useContext, useRef } from 'react'
import { pick, shallowEqual, useIsomorphicLayoutEffect, useSafeState } from './utils'

const ErrorText = '[context-state]: Component must be wrapped with <Container.Provider>'

type EqualityFC<T = any> = (old: T, now: T) => boolean

export type SelectorFn<Value, Selected> = (value: Value) => Selected

const CONTEXT_VALUE = Symbol('CONTEXT_VALUE')

const EMPTY = Symbol('EMPTY')

type Listener<Value> = (v: Value) => void

export interface ContextInnerValue<Value> {
  /* "v"alue     */ v: MutableRefObject<Value>
  /* "l"isteners */ l: Set<Listener<Value>>
}

export interface ContextValue<Value> {
  [CONTEXT_VALUE]: ContextInnerValue<Value>
}

type UseHookType<InitialValue, Value> = (initialValue: InitialValue) => Value

let __ContainerCache__: Map<string, ContextValue<any> | undefined>

export function createContainer<Value, InitialValue>(useHook: UseHookType<InitialValue, Value>) {
  const Context: React.Context<ContextValue<Value> | Symbol> = createContext<ContextValue<Value> | Symbol>(EMPTY)

  let __cache_key__: string
  if (import.meta.env?.MODE !== 'production') {
    __cache_key__ = useHook.toString()
  }

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

    if (import.meta.env?.MODE !== 'production') {
      if (import.meta.env?.MODE !== 'production') {
        if (!__ContainerCache__) {
          __ContainerCache__ = new Map()
        }
      }
      __ContainerCache__.set(__cache_key__, contextValue.current)
    }

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
  function useSelector<Selected>(
    selector: SelectorFn<Value, Selected>,
    equalityFn: EqualityFC = shallowEqual,
  ): Selected {
    const context = useContext(Context)

    let contextValue = (context as ContextValue<Value>)?.[CONTEXT_VALUE]

    if (context === EMPTY) {
      if (import.meta.env?.MODE !== 'production') {
        const cached = __ContainerCache__.get(__cache_key__)?.[CONTEXT_VALUE]
        if (!cached) {
          throw new Error(ErrorText)
        } else {
          contextValue = cached
        }
      } else {
        throw new Error(ErrorText)
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
          if (equalityFn(currentRef.current.selected, nextSelected)) {
            return
          }
          triggerRender((n) => n + 1)
        } catch (e) {}
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
    equalityFn: EqualityFC = shallowEqual,
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
