import { hsl as colorHsl, type Hsl } from '@ts-charts/color'
import color, { hue } from './color.ts'

type ColorSpecifier = string | { toString(): string } | null

function hsl(hueFn: (a: number, b: number) => (t: number) => number): (start: ColorSpecifier, end: ColorSpecifier) => (t: number) => string {
  return function (start: ColorSpecifier, end: ColorSpecifier): (t: number) => string {
    const s = colorHsl(start as string) as Hsl
    const e = colorHsl(end as string) as Hsl
    const h = hueFn(s.h, e.h)
    const sat = color(s.s, e.s)
    const l = color(s.l, e.l)
    const opacity = color(s.opacity, e.opacity)
    return function (t: number): string {
      s.h = h(t)
      s.s = sat(t)
      s.l = l(t)
      s.opacity = opacity(t)
      // eslint-disable-next-line pickier/no-unused-vars
      return `${s}`
    }
  }
}

// eslint-disable-next-line pickier/no-unused-vars
export default hsl(hue) as (start: ColorSpecifier, end: ColorSpecifier) => (t: number) => string
export const hslLong: (start: ColorSpecifier, end: ColorSpecifier) => (t: number) => string = hsl(color)
