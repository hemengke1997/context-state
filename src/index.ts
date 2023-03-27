import React, { createElement, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { pick, shallowEqual, useIsomorphicLayoutEffect, useSafeState } from './utils'

const ErrorText = '[context-state]: Component must be wrapped with <Container.Provider> 👻'

type EqualityFC<T = any> = (old: T, now: T) => boolean

export type SelectorFn<Value, Selected> = (value: Value) => Selected

export interface ContainerProviderProps<State = void> {
  value?: State
  children: React.ReactNode
}

export interface Container<Value, State = void> {
  Provider: React.ComponentType<ContainerProviderProps<State>>
  useContainer: () => Value
}

const CONTEXT_VALUE = Symbol('CONTEXT_VALUE')

const EMPTY = Symbol('EMPTY')

interface ContextInnerValue<Value> {
  /* "v"alue     */ v: MutableRefObject<Value>
  /* "l"isteners */ l: Set<(listener: Value) => void>
}

interface ContextValue<Value> {
  [CONTEXT_VALUE]: ContextInnerValue<Value>
}

type UseHookType<Value, State> = (value?: State) => Value

const ContainerCache = new Map()

const isDev = process.env.NODE_ENV !== 'production'

export function createContainer<Value, State = any>(useHook: UseHookType<Value, State>) {
  const Context: React.Context<ContextValue<Value> | typeof EMPTY> = React.createContext<
    ContextValue<Value> | typeof EMPTY
  >(EMPTY)

  const key = useHook.toString().slice(0, 24)

  const Provider: React.FC<ContainerProviderProps<State>> = ({ value, children }) => {
    const providerValue = useHook(value)

    const valueRef = useRef(providerValue)
    const contextValue = useRef<ContextValue<Value>>()

    if (!contextValue.current) {
      const listeners = new Set<(listener: Value) => void>()

      contextValue.current = {
        [CONTEXT_VALUE]: {
          /* "v"alue     */ v: valueRef,
          /* "l"isteners */ l: listeners,
        },
      }
    }

    if (isDev) {
      ContainerCache.set(key, contextValue.current)
    }

    useIsomorphicLayoutEffect(() => {
      valueRef.current = providerValue
      ;(contextValue.current as ContextValue<Value>)?.[CONTEXT_VALUE].l.forEach((listener) => {
        listener(providerValue)
      })
    }, [providerValue])

    return createElement(
      Context.Provider,
      {
        value: contextValue.current,
      },
      children,
    )
  }

  function useContainer(): Value {
    const context = React.useContext(Context)

    if (context === EMPTY) {
      if (isDev) {
        const contextValue = ContainerCache.get(key)[CONTEXT_VALUE].v.current
        if (!contextValue) {
          throw new Error(ErrorText)
        }
        return contextValue
      } else {
        throw new Error(ErrorText)
      }
    }
    return context?.[CONTEXT_VALUE].v.current
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
      /* "l"isteners */ l: listeners,
    } = contextValue

    const [, forceRender] = useSafeState(0)

    const selected = selector(value)

    const previousRef = React.useRef<
      | {
          selector: SelectorFn<Value, Selected>
          value: Value
          selected: Selected
        }
      | undefined
    >(undefined)

    previousRef.current = {
      selector,
      value,
      selected,
    }

    useIsomorphicLayoutEffect(() => {
      function checkForUpdates(nextValue: Value) {
        try {
          if (!previousRef.current) {
            return
          }

          const previousCtx = previousRef.current

          if (previousCtx.value === nextValue) {
            return
          }

          const newSelected = previousCtx.selector(nextValue)

          if (equalityFn(previousCtx.selected, newSelected)) {
            return
          }
          forceRender((n) => n + 1)
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
    Context,
    Provider,
    useContainer,
    useSelector,
    usePicker,
  }
}

export { shallowEqual }
