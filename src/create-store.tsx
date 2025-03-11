import { createContext, memo, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { Publisher } from './publisher'
import { type EqualityFn, type Middleware, type SelectorFn, type UseHookType } from './types'
import { pick, shallowEqual, useIsomorphicLayoutEffect } from './utils'
import { defaults } from './utils/defaults'

const ErrorText = '[context-state]: Component must be wrapped with <Store.Provider>'

const fallbackPublisher = new Publisher<any>(() => {})

export function createStore<Value, InitialValue>(
  useHook: UseHookType<InitialValue, Value>,
  options?: {
    /**
     * @description Same as React.memo's second argument
     * Compare the current and next state to determine whether an update should be re-rendered
     * @default shallowEqual
     */
    eq?: EqualityFn
    /**
     * @description Middleware for store
     */
    middlewares?: Middleware<Value>[]
  },
) {
  const { eq, middlewares } = defaults(options || {}, {
    eq: shallowEqual,
    middlewares: [],
  })

  const StoreContext = createContext<Publisher<Value, InitialValue>>(fallbackPublisher)

  const Provider = memo<PropsWithChildren<InitialValue>>((props) => {
    const { children, ...p } = props
    const [publisher] = useState(() => new Publisher<Value, InitialValue>(useHook))
    publisher.data = useHook(p as InitialValue)

    useIsomorphicLayoutEffect(() => {
      publisher.notify()
    })

    useEffect(() => {
      middlewares.forEach((mid) => {
        mid.onInit?.(publisher.data)
      })
    }, [])

    return <StoreContext.Provider value={publisher}>{props.children}</StoreContext.Provider>
  })

  function useStore<Selected extends keyof Value>(selector?: Selected[]): Pick<Value, Selected>
  function useStore<Selected>(selector?: SelectorFn<Value, Selected>, eqFn?: EqualityFn<Selected>): Selected
  function useStore<Selected = Value>(
    selector?: SelectorFn<Value, Selected> | (keyof Value)[],
  ): Selected | Pick<Value, keyof Value> {
    if (!selector) {
      selector = (store) => store as unknown as Selected
    }
    const publisher = useContext(StoreContext)

    if (publisher === fallbackPublisher) {
      console.error(ErrorText)
    }

    const selected = Array.isArray(selector)
      ? pick(publisher.data as Required<Value>, selector)
      : (selector as SelectorFn<Value, Selected>)(publisher.data)

    const store = useSyncExternalStore(
      (onStoreChange) => {
        const listener = (value: Value) => {
          if (!value) return
          const nextSelected = Array.isArray(selector)
            ? pick(value, selector)
            : (selector as SelectorFn<Value, Selected>)(value)
          if (!eq(selected, nextSelected, shallowEqual)) {
            onStoreChange()

            middlewares.forEach((mid) => {
              mid.onChange?.(value)
            })
          }
        }
        publisher.subscribers.add(listener)
        return () => {
          publisher.subscribers.delete(listener)
        }
      },
      () => publisher.data,
      () => publisher.data,
    )

    return Array.isArray(selector)
      ? pick(store as Required<Value>, selector)
      : (selector as SelectorFn<Value, Selected>)(store)
  }

  return {
    useStore,
    Provider,
  }
}
