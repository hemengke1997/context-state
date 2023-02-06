function pick<T extends Record<string, any>, U extends keyof T>(origin: T, keys: U[]): Pick<T, U> {
  const empty = {} as Pick<T, U>
  if (!origin) {
    return empty
  }
  return Object.assign(empty, ...keys.map((key) => ({ [key]: origin[key] })))
}

export { pick }
