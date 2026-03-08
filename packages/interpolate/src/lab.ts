import { lab as colorLab, type Lab } from '@ts-charts/color'
import color from './color.ts'

type ColorSpecifier = string | { toString(): string } | null

export default function lab(start: ColorSpecifier, end: ColorSpecifier): (t: number) => string {
  const s = colorLab(start as string) as Lab
  const e = colorLab(end as string) as Lab
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
