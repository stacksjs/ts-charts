import { rgb as colorRgb, type Rgb } from '@ts-charts/color'
import basis from './basis.ts'
import basisClosed from './basisClosed.ts'
import nogamma, { gamma } from './color.ts'

type ColorSpecifier = string | { toString(): string } | null

interface RgbInterpolator {
  (start: ColorSpecifier, end: ColorSpecifier): (t: number) => string
  gamma(y: number): RgbInterpolator
}

export default (function rgbGamma(y: number): RgbInterpolator {
  const color = gamma(y)

  function rgb(start: ColorSpecifier, end: ColorSpecifier): (t: number) => string {
    const s = colorRgb(start as string) as Rgb
    const e = colorRgb(end as string) as Rgb
    const r = color(s.r, e.r)
    const g = color(s.g, e.g)
    const b = color(s.b, e.b)
    const opacity = nogamma(s.opacity, e.opacity)
    return function (t: number): string {
      s.r = r(t)
      s.g = g(t)
      s.b = b(t)
      s.opacity = opacity(t)
      // eslint-disable-next-line pickier/no-unused-vars
      return s + ''
    }
  }

  rgb.gamma = rgbGamma

  return rgb
})(1) as RgbInterpolator

function rgbSpline(spline: (values: number[]) => (t: number) => number): (colors: ColorSpecifier[]) => (t: number) => string {
  return function (colors: ColorSpecifier[]): (t: number) => string {
    const n = colors.length
    const r = new Array(n)
    const g = new Array(n)
    const b = new Array(n)
    let i: number
    let color!: Rgb
    for (i = 0; i < n; ++i) {
      color = colorRgb(colors[i] as string) as Rgb
      r[i] = color.r || 0
      g[i] = color.g || 0
      b[i] = color.b || 0
    }
    const rInterp = spline(r)
    const gInterp = spline(g)
    const bInterp = spline(b)
    color.opacity = 1
    return function (t: number): string {
      color.r = rInterp(t)
      color.g = gInterp(t)
      color.b = bInterp(t)
      // eslint-disable-next-line pickier/no-unused-vars
      return color + ''
    }
  }
}

export const rgbBasis: (colors: ColorSpecifier[]) => (t: number) => string = rgbSpline(basis)
export const rgbBasisClosed: (colors: ColorSpecifier[]) => (t: number) => string = rgbSpline(basisClosed)
