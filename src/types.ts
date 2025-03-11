export type ShallowEqualFn<T = any> = (prev: T, current: T) => boolean
export type EqualityFn<T = any> = (prev: T, current: T, shallowEqual: ShallowEqualFn<T>) => boolean

export type SelectorFn<Value, Selected> = (value: Value) => Selected

export type UseHookType<InitialValue, Value> = (initialValue: InitialValue) => Value

export type Middleware<Value> = {
  onInit?: (value: Value) => void
  onChange?: (value: Value) => void
}
