import { hsl as colorHsl } from '@ts-charts/color'
import color, { hue } from './color.ts'

function hsl(hueFn: (a: number, b: number) => (t: number) => number): (start: any, end: any) => (t: number) => string {
  return function (start: any, end: any): (t: number) => string {
    const s = colorHsl(start) as any
    const e = colorHsl(end) as any
    const h = hueFn(s.h, e.h)
    const sat = color(s.s, e.s)
    const l = color(s.l, e.l)
    const opacity = color(s.opacity, e.opacity)
    return function (t: number): string {
      s.h = h(t)
      s.s = sat(t)
      s.l = l(t)
      s.opacity = opacity(t)
      return s + ''
    }
  }
}

export default hsl(hue)
export const hslLong: (start: any, end: any) => (t: number) => string = hsl(color)
