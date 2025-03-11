# Migrate to v4

This upgrade from the concept of `use-context-selector` ref unchanged, actively triggering react rendering on demand, to the idea of `useSyncExternalStore` given in `hox`, which can better control the update of components

Also added middleware functionality, which can implement some logging functions

At the same time, unnecessary APIs are abandoned to reduce the learning cost on the user side

## Breaking Changes

1. Deprecated `createContainer`, use `createStore`
2. Deprecated `Consumer`
3. Deprecated `usePicker`/`useSelector`, use `useStore`
4. Deprecated `useInContext`

## Features

1. `createStore` adds middleware
