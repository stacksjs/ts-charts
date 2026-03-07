import colors from '../colors.ts'
import ramp from '../ramp.ts'

export const scheme: readonly (readonly string[])[] = new Array(3).concat(
  'efedf5bcbddc756bb1',
  'f2f0f7cbc9e29e9ac86a51a3',
  'f2f0f7cbc9e29e9ac8756bb154278f',
  'f2f0f7dadaebbcbddc9e9ac8756bb154278f',
  'f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486',
  'fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486',
  'fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d',
).map(colors)

export default ramp(scheme)
