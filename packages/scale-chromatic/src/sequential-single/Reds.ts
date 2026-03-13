import colors from '../colors.ts'
import ramp from '../ramp.ts'

export const scheme: readonly (readonly string[])[] = new Array(3).concat(
  'fee0d2fc9272de2d26',
  'fee5d9fcae91fb6a4acb181d',
  'fee5d9fcae91fb6a4ade2d26a50f15',
  'fee5d9fcbba1fc9272fb6a4ade2d26a50f15',
  'fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d',
  'fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d',
  'fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d',
).map(colors)

// eslint-disable-next-line pickier/no-unused-vars
export default ramp(scheme) as (t: number) => string
