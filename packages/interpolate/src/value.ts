import { color, Color } from '@ts-charts/color'
import rgb from './rgb.ts'
import { genericArray } from './array.ts'
import date from './date.ts'
import number from './number.ts'
import object from './object.ts'
import string from './string.ts'
import constant from './constant.ts'
import numberArray, { isNumberArray } from './numberArray.ts'

export default function interpolateValue(a: any, b: any): (t: number) => any {
  const t = typeof b
  let c: any
  return b == null || t === 'boolean' ? constant(b)
      : (t === 'number' ? number
      : t === 'string' ? ((c = color(b)) ? (b = c, rgb) : string)
      : b instanceof Color ? rgb
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b) ? object
      : number)(a, b) as (t: number) => any
}
