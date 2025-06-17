# context-state

> 基于 React Context 的 hooks 状态管理方案
> 类似 `unstated-next`，但是更强大

[English Docs](./README.md)

## 安装

```bash
npm i context-state
```

## 升级

如果你使用v3，请参考[这里](./docs/migrate-v4.zh.md)升级到v4

## 优势

React Context 和 useContext 存在一些性能问题，当 context 变化时，所有使用 context 的组件都会重新渲染。`context-state` 可以解决这个问题，开发者不需要担心 context 穿透问题。

## 例子

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

### `createStore(useHook, options)`

```tsx
import { createStore, useMemoFn } from 'context-state';

function useCustomHook(props: {
  initialValue: string;
}) {
  const [value, setInput] = useState(props.initialValue);
  const onChange = useMemoFn((e) => setValue(e.currentTarget.value));
  return {
    value,
    onChange,
  };
}

const Store = createStore(useCustomHook, {
  // 中间件，用于监听 store 的变化
  middlewares: [{
    onInit: () => {},
    onChange: () => {}
  }]
});
// Store === { Provider, useStore }
```

如果 `useCustomHook` 有参数，可以通过 `Store.Provider` 传递。

### `<Store.Provider>`

```tsx
const Store = createStore(useCustomHook);
function ParentComponent({ children }) {
  return <Store.Provider initialValue={'value'}>{children}</Store.Provider>;
}
```

### `Store.useStore()`

`useStore` 用于获取 `Provider` 中的返回值。

`useStore` 接受3种参数：

1. 数组。只返回对应key的值
```tsx
function App() {
  const { count } = Store.useStore(['count']);
}
```

2. 函数。返回函数的返回值。
```tsx
function App() {
  const count = Store.useStore((store) => store.count);
}
```

3. 无参数。返回所有值。
```tsx
function App() {
  const store = Store.useStore();
}
```

**为了最佳性能，建议使用1、2，这样可以避免不必要的渲染。**

## 灵感来源

[unstated-next](https://github.com/jamiebuilds/unstated-next)

[use-context-selector](https://github.com/dai-shi/use-context-selector)

[hox](https://github.com/umijs/hox)
