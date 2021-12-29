# context-state

> 简单、优雅的 React hooks 状态管理方案

[![CI](https://img.shields.io/npm/v/context-state)](https://www.npmjs.com/package/context-state) [![CI](https://img.shields.io/npm/l/context-state)]() [![CI](https://img.shields.io/bundlephobia/minzip/context-state)]()

- **React Hooks** _适用于 React Hooks 组件_
- **专注性能** _减少额外 rerender，运行畅快_
- **无依赖** _仅仅使用了 React，无第三方库的依赖_
- **简单** _只需会 React Hooks，即可上手_
- **TypeScript 编写** _完备的类型提示，轻松编写代码_
- **容易集成** _可渐进式引入，与其他状态管理共存_
- **通用** _组件、模块、应用以及服务端渲染_
- **灵活** _基于 Context，轻松组合 Provider_
- **轻松迁移** _它基于自定义 Hooks 创建_

## codesandbox
[EXAMPLE](https://codesandbox.io/s/delicate-http-rkgv1?file=/src/CounterContainer.tsx)

## 安装

```bash
yarn add context-state
```

## 介绍

React Context 和 useContext 存在一些性能问题，当 context 上下文改变时，所有使用到 context 的组件都会更新渲染。 context-state 为解决性能问题而生。

v1.1.0 之前，它使用 `calculateChangedBits` 来阻止 context 更新，但这个 API 将会被 React 废弃。

v1.1.0 之后，将不再依赖 `calculateChangedBits`

## Example

```tsx
import React from 'react';
import { createContainer, useMemoizedFn } from 'context-state';

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

`useSelector` 的语法糖，更常用的写法

```tsx
function ChildComponent() {
  const { value } = Container.usePicker(['value']);
  return <span>{value}</span>;
}
```

### `Container.withPicker()`

`usePicker` 的高阶组件形式

```tsx
function ChildComponent({ value }) {
  return <span>{value}</span>;
}

Container.withPicker(ChildComponent, ['value']);
```

### `useContextUpdate()`

当 `context` 更新时执行钩子。
此方法在会在 [concurrent 模式](https://zh-hans.reactjs.org/docs/concurrent-mode-intro.html) 中生效

```txs
import { useContextUpdate } from 'context-state';

const update = useContextUpdate();
update(() => setState(...));
```

### `useMemoizedFn`

持久化 `function` 的 `Hook`。（来自 `ahooks` 中 `useMemoizedFn`）

_你可能会需要用 `useCallback` 记住一个回调，但由于内部函数必须经常重新创建，记忆效果不佳，导致子组件重复 render。对于复杂的子组件，重新渲染会对性能造成影响。通过 `useMemoizedFn`，可以保证函数地址永远不会变化。_

### 灵感来源

[unstated-next](https://github.com/jamiebuilds/unstated-next) | [use-context-selector](https://github.com/dai-shi/use-context-selector)
