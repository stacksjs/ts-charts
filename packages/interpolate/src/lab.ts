import { lab as colorLab } from '@ts-charts/color'
import color from './color.ts'

export default function lab(start: any, end: any): (t: number) => string {
  const s = colorLab(start) as any
  const e = colorLab(end) as any
  const l = color(s.l, e.l)
  const a = color(s.a, e.a)
  const b = color(s.b, e.b)
  const opacity = color(s.opacity, e.opacity)
  return function (t: number): string {
    s.l = l(t)
    s.a = a(t)
    s.b = b(t)
    s.opacity = opacity(t)
    return s + ''
  }
}
