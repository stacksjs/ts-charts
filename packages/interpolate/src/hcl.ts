import { hcl as colorHcl } from '@ts-charts/color'
import color, { hue } from './color.ts'

function hcl(hueFn: (a: number, b: number) => (t: number) => number): (start: any, end: any) => (t: number) => string {
  return function (start: any, end: any): (t: number) => string {
    const s = colorHcl(start) as any
    const e = colorHcl(end) as any
    const h = hueFn(s.h, e.h)
    const c = color(s.c, e.c)
    const l = color(s.l, e.l)
    const opacity = color(s.opacity, e.opacity)
    return function (t: number): string {
      s.h = h(t)
      s.c = c(t)
      s.l = l(t)
      s.opacity = opacity(t)
      return s + ''
    }
  }
}

export default hcl(hue) as (start: any, end: any) => (t: number) => string
export const hclLong: (start: any, end: any) => (t: number) => string = hcl(color)
