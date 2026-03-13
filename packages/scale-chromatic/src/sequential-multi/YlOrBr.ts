import colors from '../colors.ts'
import ramp from '../ramp.ts'

export const scheme: readonly (readonly string[])[] = new Array(3).concat(
  'fff7bcfec44fd95f0e',
  'ffffd4fed98efe9929cc4c02',
  'ffffd4fed98efe9929d95f0e993404',
  'ffffd4fee391fec44ffe9929d95f0e993404',
  'ffffd4fee391fec44ffe9929ec7014cc4c028c2d04',
  'ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04',
  'ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506',
).map(colors)

// eslint-disable-next-line pickier/no-unused-vars
export default ramp(scheme) as (t: number) => string
