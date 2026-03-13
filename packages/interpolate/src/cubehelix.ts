import { cubehelix as colorCubehelix, type Cubehelix } from '@ts-charts/color'
import color, { hue } from './color.ts'

type ColorSpecifier = string | { toString(): string } | null

interface CubehelixInterpolator {
  (start: ColorSpecifier, end: ColorSpecifier): (t: number) => string
  gamma(y: number): CubehelixInterpolator
}

function cubehelix(hueFn: (a: number, b: number) => (t: number) => number): CubehelixInterpolator {
  return (function cubehelixGamma(y: number): CubehelixInterpolator {
    y = +y

    function cubehelixInterp(start: ColorSpecifier, end: ColorSpecifier): (t: number) => string {
      const s = colorCubehelix(start as string) as Cubehelix
      const e = colorCubehelix(end as string) as Cubehelix
      const h = hueFn(s.h, e.h)
      const sat = color(s.s, e.s)
      const l = color(s.l, e.l)
      const opacity = color(s.opacity, e.opacity)
      return function (t: number): string {
        s.h = h(t)
        s.s = sat(t)
        s.l = l(Math.pow(t, y))
        s.opacity = opacity(t)
        // eslint-disable-next-line pickier/no-unused-vars
        return s + ''
      }
    }

    cubehelixInterp.gamma = cubehelixGamma

    return cubehelixInterp
  })(1)
}

export default cubehelix(hue) as CubehelixInterpolator
export const cubehelixLong: CubehelixInterpolator = cubehelix(color)
