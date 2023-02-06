export function shallowEqual(origin: any, next: any) {
  if (Object.is(origin, next)) {
    return true
  }
  if (origin && typeof origin === 'object' && next && typeof next === 'object') {
    if (
      [...Object.keys(origin), ...Object.keys(next)].every(
        // eslint-disable-next-line no-prototype-builtins
        (k) => origin[k] === next[k] && origin.hasOwnProperty(k) && next.hasOwnProperty(k),
      )
    ) {
      return true
    }
  }
  return false
}
