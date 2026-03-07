export function optional<T>(f: T | null | undefined): T | null {
  return f == null ? null : required(f)
}

export function required<T>(f: T): T {
  if (typeof f !== 'function') throw new Error()
  return f
}
