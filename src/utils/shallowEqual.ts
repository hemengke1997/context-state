export function shallowEqual(origin: any, next: any) {
  if (Object.is(origin, next)) {
    return true
  }
  if (origin && typeof origin === 'object' && next && typeof next === 'object') {
    if (
      [...Object.keys(origin), ...Object.keys(next)].every(
        (k) =>
          origin[k] === next[k] &&
          Object.prototype.hasOwnProperty.call(origin, k) &&
          Object.prototype.hasOwnProperty.call(next, k),
      )
    ) {
      return true
    }
  }
  return false
}
