import React, { type MutableRefObject, type ReactNode, createElement, useReducer, useRef } from 'react'
import { pick, shallowEqual, useIsomorphicLayoutEffect } from './utils'

const ErrorText = '[context-state]: Component must be wrapped with <Container.Provider> 👻'

type EqualityFC<T = any> = (old: T, now: T) => boolean

export type SelectorFn<Value, Selected> = (value: Value) => Selected

const CONTEXT_VALUE = Symbol('CONTEXT_VALUE')

const EMPTY = Symbol('EMPTY')

type Version = number
type Listener<Value> = (action: { n: Version; v?: Value }) => void

interface ContextInnerValue<Value> {
  /* "v"alue     */ v: MutableRefObject<Value>
  /* versio"n"   */ n: MutableRefObject<Version>
  /* "l"isteners */ l: Set<Listener<Value>>
}

interface ContextValue<Value> {
  [CONTEXT_VALUE]: ContextInnerValue<Value>
}

type UseHookType<InitialValue, Value> = (initialValue: InitialValue) => Value

const ContainerCache = new Map()

const isDev = process.env.NODE_ENV !== 'production'

export function createContainer<Value, InitialValue>(useHook: UseHookType<InitialValue, Value>) {
  const Context: React.Context<ContextValue<Value> | typeof EMPTY> = React.createContext<
    ContextValue<Value> | typeof EMPTY
  >(EMPTY)

  const key = useHook.toString().slice(0, 24)

  const Provider = ({ value, children }: { value?: InitialValue; children: ReactNode }) => {
    const inHookValue = useHook(value as InitialValue)
    const valueRef = useRef(inHookValue)
    const versionRef = useRef(0)
    const contextValue = useRef<ContextValue<Value>>()

    if (!contextValue.current) {
      const listeners = new Set<Listener<Value>>()

      contextValue.current = {
        [CONTEXT_VALUE]: {
          /* "v"alue     */ v: valueRef,
          /* versio"n"   */ n: versionRef,
          /* "l"isteners */ l: listeners,
        },
      }
    }

    if (isDev) {
      ContainerCache.set(key, contextValue.current)
    }

    useIsomorphicLayoutEffect(() => {
      valueRef.current = inHookValue
      versionRef.current += 1
      ;(contextValue.current as ContextValue<Value>)?.[CONTEXT_VALUE].l.forEach((listener) => {
        listener({ n: versionRef.current, v: inHookValue })
      })
    }, [inHookValue])

    return createElement(
      Context.Provider,
      {
        value: contextValue.current,
      },
      children,
    )
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
    const context = React.useContext(Context)

    let contextValue = (context as ContextValue<Value>)?.[CONTEXT_VALUE]

    if (context === EMPTY) {
      if (isDev) {
        contextValue = ContainerCache.get(key)[CONTEXT_VALUE].v.current
        if (!contextValue) {
          throw new Error(ErrorText)
        }
      } else {
        throw new Error(ErrorText)
      }
    }

    const {
      /* "v"alue     */ v: { current: value },
      /* versio"n"   */ n: { current: version },
      /* "l"isteners */ l: listeners,
    } = contextValue

    const selected = selector(value)

    const [state, dispatch] = useReducer(
      (prev: readonly [Value, Selected], action?: Parameters<Listener<Value>>[0]) => {
        if (!action) {
          // case for `dispatch()` below
          return [value, selected] as const
        }
        if (action.n === version) {
          if (equalityFn(prev[1], selected)) {
            return prev // bail out
          }
          return [value, selected] as const
        }
        try {
          if ('v' in action) {
            if (equalityFn(prev[0], action.v)) {
              return prev // do not update
            }
            const nextSelected = selector(action.v!)
            if (equalityFn(prev[1], nextSelected)) {
              return prev // do not update
            }
            return [action.v, nextSelected] as const
          }
        } catch (e) {
          // ignored (stale props or some other reason)
        }
        return [...prev] as const // schedule update
      },
      [value, selected] as const,
    )

    if (!equalityFn(state[1], selected)) {
      // schedule re-render
      // this is safe because it's self contained
      dispatch()
    }

    useIsomorphicLayoutEffect(() => {
      listeners.add(dispatch)
      return () => {
        listeners.delete(dispatch)
      }
    }, [listeners])
    return state[1]
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
    Context,
    Provider,
    Consumer,
    useSelector,
    usePicker,
  }
}

export { shallowEqual }
