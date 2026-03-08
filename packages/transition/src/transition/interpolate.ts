import { color } from '@ts-charts/color'
import { interpolateNumber, interpolateRgb, interpolateString } from '@ts-charts/interpolate'

export default function interpolate(a: string | number, b: string | number): (t: number) => string | number {
  let c: ReturnType<typeof color>
  return ((typeof b === 'number' ? interpolateNumber
    : (b as unknown) instanceof color ? interpolateRgb
    : (c = color(b as string)) ? (b = c as unknown as number, interpolateRgb)
    : interpolateString) as (a: unknown, b: unknown) => (t: number) => string | number)(a, b)
}
