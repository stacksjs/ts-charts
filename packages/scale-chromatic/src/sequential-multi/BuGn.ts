import colors from '../colors.ts'
import ramp from '../ramp.ts'

export const scheme: readonly (readonly string[])[] = new Array(3).concat(
  'e5f5f999d8c92ca25f',
  'edf8fbb2e2e266c2a4238b45',
  'edf8fbb2e2e266c2a42ca25f006d2c',
  'edf8fbccece699d8c966c2a42ca25f006d2c',
  'edf8fbccece699d8c966c2a441ae76238b45005824',
  'f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824',
  'f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b',
).map(colors)

// eslint-disable-next-line pickier/no-unused-vars
export default ramp(scheme) as (t: number) => string
