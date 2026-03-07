import { rgb as colorRgb } from '@ts-charts/color'
import basis from './basis.ts'
import basisClosed from './basisClosed.ts'
import nogamma, { gamma } from './color.ts'

interface RgbInterpolator {
  (start: any, end: any): (t: number) => string
  gamma(y: number): RgbInterpolator
}

export default (function rgbGamma(y: number): RgbInterpolator {
  const color = gamma(y)

  function rgb(start: any, end: any): (t: number) => string {
    const s = colorRgb(start) as any
    const e = colorRgb(end) as any
    const r = color(s.r, e.r)
    const g = color(s.g, e.g)
    const b = color(s.b, e.b)
    const opacity = nogamma(s.opacity, e.opacity)
    return function (t: number): string {
      s.r = r(t)
      s.g = g(t)
      s.b = b(t)
      s.opacity = opacity(t)
      return s + ''
    }
  }

  rgb.gamma = rgbGamma

  return rgb
})(1) as RgbInterpolator

function rgbSpline(spline: (values: number[]) => (t: number) => number): (colors: any[]) => (t: number) => string {
  return function (colors: any[]): (t: number) => string {
    const n = colors.length
    const r = new Array(n)
    const g = new Array(n)
    const b = new Array(n)
    let i: number
    let color: any
    for (i = 0; i < n; ++i) {
      color = colorRgb(colors[i]) as any
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
      return color + ''
    }
  }
}

export const rgbBasis: (colors: any[]) => (t: number) => string = rgbSpline(basis)
export const rgbBasisClosed: (colors: any[]) => (t: number) => string = rgbSpline(basisClosed)
