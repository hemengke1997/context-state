# context-state

> React hooks state management solution

[中文文档](./README.zh.md)

## Install

```bash
npm i context-state
```

## Introduction

React Context and useContext have some performance issues. When the context changes, all components that use the context will re-render. With `context-state`, developers don't need to worry about context penetration issues.

## Example

```tsx
import React from 'react';
import { createContainer } from 'context-state';

function useCounter() {
  const [count, setCount] = React.useState(0);
  const increment = () => setCount((c) => c + 1);

  return {
    count,
    increment,
  };
}

const CounterContainer = createContainer(useCounter);

function CounterDisplay() {
  const { count, increment } = CounterContainer.usePicker(['count', 'increment']);

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
    <CounterContainer.Provider>
      <CounterDisplay />
    </CounterContainer.Provider>
  );
}

render(<App />, document.getElementById('root'));
```

## API

### `createContainer(useHook)`

```tsx
import { createContainer, useMemoizedFn } from 'context-state';

function useCustomHook() {
  const [value, setInput] = useState();
  const onChange = useMemoizedFn((e) => setValue(e.currentTarget.value));
  return {
    value,
    onChange,
  };
}

const Container = createContainer(useCustomHook);
// Container === { Provider, usePicker }
```

### `<Container.Provider>`

```tsx
const Container = createContainer(useCustomHook);
function ParentComponent({ children }) {
  return <Container.Provider>{children}</Container.Provider>;
}
```

### `<Container.Provider value>`

```tsx
function useCustomHook(value = '') {
  const [value, setValue] = useState(value);
  // ...
}

const Container = createContainer(useCustomHook);

function ParentComponent({ children }) {
  return <Container.Provider value='value'>{children}</Container.Provider>;
}
```

### `Container.Consumer`

```tsx
function ChildComponent() {
  return <Container.Consumer>{(value) => <span>{value}</span>}</Container.Consumer>;
}
```

### `Container.useSelector()`

Listen to the selected value in the current container. If the value changes, it triggers a rerender.

```tsx
function ChildComponent() {
  const value = Container.useSelector((state) => state.value);
  return <span>{value}</span>;
}
```

### `Container.usePicker()`

A syntactic sugar for `useSelector`.

```tsx
function ChildComponent() {
  const { value } = Container.usePicker(['value']);
  return <span>{value}</span>;
}
```

### `Container.useInContext()`

Returns true if component is a descendant of a `<Container.Provider>`


## Inspiration

[unstated-next](https://github.com/jamiebuilds/unstated-next) | [use-context-selector](https://github.com/dai-shi/use-context-selector)
