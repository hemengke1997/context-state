import React from 'react';
import type { MutableRefObject } from 'react';
import useIsomorphicLayoutEffect from './utils/useIsomorphicLayoutEffect';
import shallowEqual from './utils/shallowEqual';
import pick from './utils/pick';
import useMemoizedFn from './utils/useMemoizedFn';
import { batchedUpdates } from './utils/batchedUpdates';

type EqualityFC<T = any> = (old: T, now: T) => boolean;

export type SelectorFn<Value, Selected> = (value: Value) => Selected;

export interface ContainerProviderProps<State = void> {
  value?: State;
  children: React.ReactNode;
}

export interface Container<Value, State = void> {
  Provider: React.ComponentType<ContainerProviderProps<State>>;
  useContainer: () => Value;
}

const CONTEXT_VALUE: unique symbol = Symbol();

const EMPTY: unique symbol = Symbol();

type ContextValue<Value> = {
  [CONTEXT_VALUE]: {
    /* "v"alue     */ v: MutableRefObject<Value>;
    /* "l"isteners */ l: Set<(listener: Value) => void>;
    /* "u"pdate    */ u: (thunk: () => void) => void;
  };
};

type UseHookType<Value, State> = (value?: State) => Value;

const ErrorText =
  '[context-state]: Component must be wrapped with <Container.Provider>👻. If component is wrapped, you can try restart project💊';

export function createContainer<Value, State = any>(useHook: UseHookType<Value, State>) {
  const Context = React.createContext<ContextValue<Value> | typeof EMPTY>(EMPTY);

  const context = React.useContext(Context);

  const Provider: React.FC<ContainerProviderProps<State>> = React.memo(({ value, children }) => {
    const providerValue = useHook(value);

    const valueRef = React.useRef(providerValue);

    const contextValue = React.useRef<ContextValue<Value>>();

    if (!contextValue.current) {
      const listeners = new Set<(listener: Value) => void>();

      const update = (thunk: () => void) => {
        batchedUpdates(() => {
          listeners.forEach((listener) => listener(providerValue));
          thunk();
        });
      };
      contextValue.current = {
        [CONTEXT_VALUE]: {
          /* "v"alue     */ v: valueRef,
          /* "l"isteners */ l: listeners,
          /* "u"pdate    */ u: update,
        },
      };
    }

    useIsomorphicLayoutEffect(() => {
      valueRef.current = providerValue;
      (contextValue.current as ContextValue<Value>)?.[CONTEXT_VALUE].l.forEach((listener) => {
        listener(providerValue);
      });
    }, [providerValue]);

    return <Context.Provider value={contextValue.current}>{children}</Context.Provider>;
  });

  function useContainer(): Value {
    if (context === EMPTY) {
      throw new Error(ErrorText);
    }
    return context?.[CONTEXT_VALUE].v.current;
  }

  /**
   * A hook to access the redux store's state. This hook takes a selector function
   * as an argument. The selector is called with the store state.
   *
   * This hook takes an optional equality comparison function as the second parameter
   * that allows you to customize the way the selected state is compared to determine
   * whether the component needs to be re-rendered.
   *
   * @param {Function} selector the selector function
   * @param {Function=} equalityFn the function that will be used to determine equality
   * @returns {any} the selected state
   *
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
    if (process.env.NODE_ENV !== 'production') {
      if (!selector) {
        throw new Error(`[context-state]: You must pass a selector to useSelector👻`);
      }
      if (typeof selector !== 'function') {
        throw new Error(`[context-state]: You must pass a function as a selector to useSelector👻`);
      }
      if (typeof equalityFn !== 'function') {
        throw new Error(`[context-state]: You must pass a function as an equality function to useSelector👻`);
      }
    }

    if (context === EMPTY) {
      throw new Error(ErrorText);
    }

    const contextValue = context?.[CONTEXT_VALUE];

    const {
      /* "v"alue     */ v: { current: value },
      /* "l"isteners */ l: listeners,
    } = contextValue!;

    const [, forceRender] = React.useReducer((s) => s + 1, 0);

    const selected = selector(value);

    const previousRef = React.useRef<
      | {
          selector: SelectorFn<Value, Selected>;
          value: Value;
          selected: Selected;
        }
      | undefined
    >(undefined);

    previousRef.current = {
      selector,
      value,
      selected,
    };

    useIsomorphicLayoutEffect(() => {
      function checkForUpdates(nextValue: Value) {
        try {
          if (!previousRef.current) {
            return;
          }

          const previousCtx = previousRef.current;

          if (previousCtx.value === nextValue) {
            return;
          }

          const newSelected = previousCtx.selector(nextValue);

          if (equalityFn(previousCtx.selected, newSelected)) {
            return;
          }
          forceRender();
        } catch (e) {
          // we ignore all errors here, since when the component
          // is re-rendered, the selectors are called again, and
          // will throw again, if neither props nor store state
          // changed
        }
      }
      // register listener
      listeners.add(checkForUpdates);
      return () => {
        listeners.delete(checkForUpdates);
      };
    }, []);

    return selected;
  }

  /**
   * Syntactic sugar of useSelector
   *
   * @param {Function} selector the selector function
   * @param {Function=} equalityFn the function that will be used to determine equality
   * @returns {any} the selected state
   *
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
    return useSelector((state) => pick(state as Required<Value>, selected), equalityFn);
  }

  /**
   *
   * @param {React.FC} Child
   * @param {string[]} selected
   * @returns {React.FC} High-order component
   */
  function withPicker<T, Selected extends keyof Value>(
    Child: React.FC<T & Pick<Value, Selected>>,
    selected: Selected[],
  ): React.FC<Omit<T, Selected>> {
    return (props) => {
      const picked = usePicker(selected);
      return <Child {...picked} {...(props as T)} />;
    };
  }

  /**
   * This hook returns an update function that accepts a thunk function
   *
   * Use this for a function that will change a value in
   * [Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html).
   * Otherwise, there's no need to use this hook.
   *
   * @example
   * import { useContextUpdate } from 'context-state';
   *
   * const update = useContextUpdate();
   * update(() => setState(...));
   */
  function useContextUpdate() {
    if (context === EMPTY) {
      throw new Error(ErrorText);
    }
    const contextValue = context?.[CONTEXT_VALUE];
    if (typeof process === 'object' && process.env.NODE_ENV !== 'production') {
      if (!contextValue) {
        throw new Error('[context-state]: useContextUpdate requires special context👻');
      }
    }
    const { u: update } = contextValue;
    return update;
  }

  /**
   *
   * @param {React.FC} Child
   * @returns {React.FC}
   */
  function withProvider<T>(Child: React.FC<T>): React.FC<T> {
    return (props) => (
      <Provider>
        <Child {...props} />
      </Provider>
    );
  }

  return {
    Context,
    Provider,
    useContainer,
    useSelector,
    usePicker,
    withPicker,
    useContextUpdate,
    withProvider,
  };
}

export { useMemoizedFn, shallowEqual };
