import { Rgb } from '@ts-charts/color'

const c = new Rgb(0, 0, 0, 1)
const pi_1_3 = Math.PI / 3
const pi_2_3 = Math.PI * 2 / 3

export default function sinebow(t: number): string {
  let x: number
  t = (0.5 - t) * Math.PI
  c.r = 255 * (x = Math.sin(t)) * x
  c.g = 255 * (x = Math.sin(t + pi_1_3)) * x
  c.b = 255 * (x = Math.sin(t + pi_2_3)) * x
  // eslint-disable-next-line pickier/no-unused-vars
  return c + ''
}
