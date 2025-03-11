export function defaults<T extends Record<string, any>>(options: T, defaultOptions: T): Required<T> {
  const result = {} as Required<T>
  for (const key in defaultOptions) {
    result[key] = options[key] ?? defaultOptions[key]
  }
  return result
}
