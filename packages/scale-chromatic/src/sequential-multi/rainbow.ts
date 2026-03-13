import { cubehelix, Cubehelix } from '@ts-charts/color'
import { interpolateCubehelixLong } from '@ts-charts/interpolate'

export const warm: (t: number) => string = interpolateCubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8))

export const cool: (t: number) => string = interpolateCubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8))

const c = new Cubehelix(0, 0, 0, 1)

export default function rainbow(t: number): string {
  if (t < 0 || t > 1) t -= Math.floor(t)
  const ts = Math.abs(t - 0.5)
  c.h = 360 * t - 100
  c.s = 1.5 - 1.5 * ts
  c.l = 0.8 - 0.9 * ts
  // eslint-disable-next-line pickier/no-unused-vars
  return `${c}`
}
