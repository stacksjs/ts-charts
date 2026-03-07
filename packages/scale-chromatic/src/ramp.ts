import { interpolateRgbBasis } from '@ts-charts/interpolate'

export default function ramp(scheme: readonly (readonly string[])[]): (t: number) => string {
  return interpolateRgbBasis(scheme[scheme.length - 1] as string[])
}
