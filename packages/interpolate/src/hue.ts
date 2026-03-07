import { hue } from './color.ts'

export default function interpolateHue(a: number | string, b: number | string): (t: number) => number {
  const i = hue(+a, +b)
  return function (t: number): number {
    const x = i(t)
    return x - 360 * Math.floor(x / 360)
  }
}
