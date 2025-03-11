# context-state

> React state management solution with Context
> Like unstated-next, but Pro

[中文文档](./README.zh.md)

## Install

```bash
npm i context-state
```

## Migrate

If you are using v3, please refer to [here](./docs/migrate-v4.md) to upgrade to v4

## Advantage

React Context and useContext have some performance issues. When the context changes, all components that use the context will re-render. With `context-state`, developers don't need to worry about context penetration issues.

## Example

```tsx
import React from 'react';
import { createStore } from 'context-state';

function useCounter() {
  const [count, setCount] = React.useState(0);
  const increment = () => setCount((c) => c + 1);

  return {
    count,
    increment,
  };
}

const CounterStore = createStore(useCounter);

function CounterDisplay() {
  const { count, increment } = CounterStore.usePicker(['count', 'increment']);

  return (
    <div>
      {count}
      <button
        type='button'
        onClick={increment}
      >
        ADD
      </button>
    </div>
  );
}

function App() {
  return (
    <CounterStore.Provider>
      <CounterDisplay />
    </CounterStore.Provider>
  );
}

render(<App />, document.getElementById('root'));
```


## API

### `createContainer(useHook, options)`

```tsx
import { createStore, useMemoizedFn } from 'context-state';

function useCustomHook(props: {
  initialValue: string;
}) {
  const [value, setInput] = useState(props.initialValue);
  const onChange = useMemoizedFn((e) => setValue(e.currentTarget.value));
  return {
    value,
    onChange,
  };
}

const Store = createStore(useCustomHook, {
  // middlewares, used to listen to store changes
  middlewares: [{
    onInit: () => {},
    onChange: () => {}
  }]
});
// Store === { Provider, useStore }
```

If `useCustomHook` has parameters, they can be passed through `Store.Provider`.

### `<Container.Provider>`

```tsx
const Container = createContainer(useCustomHook);
function ParentComponent({ children }) {
  return <Container.Provider>{children}</Container.Provider>;
}
```

### `<Store.Provider>`

```tsx
const Store = createStore(useCustomHook);
function ParentComponent({ children }) {
  return <Store.Provider initialValue={'value'}>{children}</Store.Provider>;
}
```

### `Store.useStore()`

`useStore` is used to get the return value from the Provider.

`useStore` accepts 3 types of parameters:

1. Array. Only returns the values corresponding to the keys.
  
```tsx
function App() {
  const { count } = Store.useStore(['count']);
}
```

2. Function. Returns the return value of the function.

```tsx
function App() {
  const count = Store.useStore((store) => store.count);
}
```

3. No parameters. Returns all values.

```tsx
function App() {
  const store = Store.useStore();
}
```

**For best performance, it is recommended to use 1 and 2, which can avoid unnecessary rendering.**

## Inspiration

[unstated-next](https://github.com/jamiebuilds/unstated-next)

[use-context-selector](https://github.com/dai-shi/use-context-selector)

[hox](https://github.com/umijs/hox)
