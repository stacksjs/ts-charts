import value from './value.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts any value, coerces non-objects to {}
export default function interpolateObject(a: any, b: any): (t: number) => Record<string, unknown> {
  const i: Record<string, (t: number) => unknown> = {}
  const c: Record<string, unknown> = {}
  let k: string

  if (a === null || typeof a !== 'object') a = {}
  if (b === null || typeof b !== 'object') b = {}

  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k])
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      c[k] = b[k]
    }
  }

  return function (t: number): Record<string, unknown> {
    for (k in i) c[k] = i[k](t)
    return c
  }
}
