# 升级到v4

这次升级从 `use-context-selector` 的 ref 不变理念，按需主动触发react渲染，改为了 `hox` 中给的 `useSyncExternalStore` 的思路，这样可以更好的控制组件的更新

也新增了中间件功能，可以实现一些日志功能

同时废弃了不必要的API，减少用户侧的学习成本

## Breaking Changes

1. 废弃 `createContainer`， 使用 `createStore`
2. 废弃 `Consumer`
3. 废弃 `usePicker`/`useSelector`，使用 `useStore`
4. 废弃 `useInContext`
5. 废弃 `Provider` 的 `value` 属性，使用 `useHook` 的参数作为初始值

## Features

1. `createStore` 新增中间件
