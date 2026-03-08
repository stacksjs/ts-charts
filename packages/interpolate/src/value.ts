import { color, Color } from '@ts-charts/color'
import rgb from './rgb.ts'
import { genericArray } from './array.ts'
import date from './date.ts'
import number from './number.ts'
import object from './object.ts'
import string from './string.ts'
import constant from './constant.ts'
import numberArray, { isNumberArray } from './numberArray.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime type dispatch; return type is any because output depends on b's type
export default function interpolateValue(a: unknown, b: unknown): (t: number) => any {
  const t = typeof b
  let c: Color | null
  return b == null || t === 'boolean' ? constant(b)
      : (t === 'number' ? number
      : t === 'string' ? ((c = color(b as string)) ? (b = c, rgb) : string)
      : b instanceof Color ? rgb
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof (b as Record<string, unknown>).valueOf !== 'function' && typeof (b as Record<string, unknown>).toString !== 'function' || isNaN(b as number) ? object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime polymorphic dispatch
      : number)(a as any, b as any) as (t: number) => unknown
}
