import { Color, Rgb, rgbConvert, darker, brighter } from './color.ts'
import { degrees, radians } from './math.ts'

const A = -0.14861
const B = +1.78277
const C = -0.29227
const D = -0.90649
const E = +1.97294
const ED = E * D
const EB = E * B
const BC_DA = B * C - D * A

function cubehelixConvert(o: Color | string): Cubehelix {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity)
  if (!(o instanceof Rgb)) o = rgbConvert(o)
  const c = o as Rgb
  const r = c.r / 255
  const g = c.g / 255
  const b = c.b / 255
  const l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB)
  const bl = b - l
  const k = (E * (g - l) - C * bl) / D
  const s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)) // NaN if l=0 or l=1
  const h = s ? Math.atan2(k, bl) * degrees - 120 : NaN
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, c.opacity)
}

export function cubehelix(h: number | string | Color, s?: number, l?: number, opacity?: number): Cubehelix {
  if (s === undefined && l === undefined) return cubehelixConvert(h as Color | string)
  return new Cubehelix(h as number, s as number, l as number, opacity == null ? 1 : opacity)
}

export class Cubehelix extends Color {
  h: number
  s: number
  l: number
  declare opacity: number

  constructor(h: number, s: number, l: number, opacity: number) {
    super()
    this.h = +h
    this.s = +s
    this.l = +l
    this.opacity = +opacity
  }

  brighter(k?: number): Cubehelix {
    k = k == null ? brighter : Math.pow(brighter, k)
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity)
  }

  darker(k?: number): Cubehelix {
    k = k == null ? darker : Math.pow(darker, k)
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity)
  }

  override rgb(): Rgb {
    const h = isNaN(this.h) ? 0 : (this.h + 120) * radians
    const l = +this.l
    const a = isNaN(this.s) ? 0 : this.s * l * (1 - l)
    const cosh = Math.cos(h)
    const sinh = Math.sin(h)
    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity,
    )
  }
}
