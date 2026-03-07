import { color } from '@ts-charts/color'
import { interpolateNumber, interpolateRgb, interpolateString } from '@ts-charts/interpolate'

export default function interpolate(a: any, b: any): (t: number) => any {
  let c: any
  return (typeof b === 'number' ? interpolateNumber
    : b instanceof color ? interpolateRgb
    : (c = color(b)) ? (b = c, interpolateRgb)
    : interpolateString)(a, b)
}
