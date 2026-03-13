import { hcl as colorHcl, type Hcl } from '@ts-charts/color'
import color, { hue } from './color.ts'

type ColorSpecifier = string | { toString(): string } | null

function hcl(hueFn: (a: number, b: number) => (t: number) => number): (start: ColorSpecifier, end: ColorSpecifier) => (t: number) => string {
  return function (start: ColorSpecifier, end: ColorSpecifier): (t: number) => string {
    const s = colorHcl(start as string) as Hcl
    const e = colorHcl(end as string) as Hcl
    const h = hueFn(s.h, e.h)
    const c = color(s.c, e.c)
    const l = color(s.l, e.l)
    const opacity = color(s.opacity, e.opacity)
    return function (t: number): string {
      s.h = h(t)
      s.c = c(t)
      s.l = l(t)
      s.opacity = opacity(t)
      // eslint-disable-next-line pickier/no-unused-vars
      return `${s}`
    }
  }
}

// eslint-disable-next-line pickier/no-unused-vars
export default hcl(hue) as (start: ColorSpecifier, end: ColorSpecifier) => (t: number) => string
export const hclLong: (start: ColorSpecifier, end: ColorSpecifier) => (t: number) => string = hcl(color)
