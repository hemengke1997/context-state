import { type MutableRefObject } from 'react'

export type ShallowEqualFn<T = any> = (prev: T, current: T) => boolean
export type EqualityFn<T = any> = (prev: T, current: T, shallowEqual: ShallowEqualFn<T>) => boolean

export type SelectorFn<Value, Selected> = (value: Value) => Selected

export type Listener<Value> = (v: Value) => void

export interface ContextInnerValue<Value> {
  /* "v"alue     */ v: MutableRefObject<Value>
  /* "l"isteners */ l: Set<Listener<Value>>
}

export interface ContextValue<Value> {
  [CONTEXT_VALUE]: ContextInnerValue<Value>
}

export type UseHookType<InitialValue, Value> = (initialValue: InitialValue) => Value

export const CONTEXT_VALUE = Symbol('CONTEXT_VALUE')

export const EMPTY = Symbol('EMPTY')
