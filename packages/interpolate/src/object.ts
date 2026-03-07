import value from './value.ts'

export default function interpolateObject(a: any, b: any): (t: number) => Record<string, any> {
  const i: Record<string, (t: number) => any> = {}
  const c: Record<string, any> = {}
  let k: string

  if (a === null || typeof a !== 'object') a = {}
  if (b === null || typeof b !== 'object') b = {}

  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k])
    } else {
      c[k] = b[k]
    }
  }

  return function (t: number): Record<string, any> {
    for (k in i) c[k] = i[k](t)
    return c
  }
}
