# context-state

> React hooks 状态管理方案

## 📦 codesandbox

[EXAMPLE](https://codesandbox.io/s/delicate-http-rkgv1?file=/src/CounterContainer.tsx)

## 🔧 安装

```bash
yarn add @minko-fe/context-state
```

## ✨ 介绍

React Context 和 useContext 存在一些性能问题，当 context 上下文改变时，所有使用到 context 的组件都会更新渲染。
使用`context-state`，**开发者不必考虑 context 穿透问题** 👏

v1.1.0 之前，它使用 `calculateChangedBits` 来阻止 context 更新，但这个 API 将会被 React 废弃。

v1.1.0 之后，将不再依赖 `calculateChangedBits`

## 🎈 Example

```tsx
import React from 'react';
import { createContainer, useMemoizedFn } from '@minko-fe/context-state';

function useCounter() {
  const [count, setCount] = React.useState(0);
  const increment = useMemoizedFn(() => setCount((c) => c + 1));

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
      <button type="button" onClick={increment}>
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

## 🐱‍💻 API

### `createContainer(useHook)`

```tsx
import { createContainer, useMemoizedFn } from '@minko-fe/context-state';

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
function ParentComponent() {
  return (
    <Container.Provider>
      <ChildComponent />
    </Container.Provider>
  );
}
```

### `<Container.Provider value>`

```tsx
function useCustomHook(value = '') {
  const [value, setValue] = useState(value);
  // ...
}

function ParentComponent() {
  return (
    <Container.Provider value="value">
      <ChildComponent />
    </Container.Provider>
  );
}
```

### `Container.useSelector()`

监听当前容器中选择后的值，若值发生改变，则触发 `rerender`

```tsx
function ChildComponent() {
  const value = Container.useSelector((state) => state.value);
  return <span>{value}</span>;
}
```

### `Container.usePicker()`

`useSelector` 的语法糖

```tsx
function ChildComponent() {
  const { value } = Container.usePicker(['value']);
  return <span>{value}</span>;
}
```

### `useMemoizedFn`

持久化 `function` 的 `Hook`。（来自 `ahooks` 中 `useMemoizedFn`）

_你可能会需要用 `useCallback` 记住一个回调，但由于内部函数必须经常重新创建，记忆效果不佳，导致子组件重复 render。对于复杂的子组件，重新渲染会对性能造成影响。通过 `useMemoizedFn`，可以保证函数地址永远不会变化。_

## 💡 灵感来源

[unstated-next](https://github.com/jamiebuilds/unstated-next) | [use-context-selector](https://github.com/dai-shi/use-context-selector)
