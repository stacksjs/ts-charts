import ascending from './ascending.ts'
import bisector from './bisector.ts'
import number from './number.ts'

const ascendingBisect = bisector(ascending)
export const bisectRight: (a: ArrayLike<any>, x: any, lo?: number, hi?: number) => number = ascendingBisect.right
export const bisectLeft: (a: ArrayLike<any>, x: any, lo?: number, hi?: number) => number = ascendingBisect.left
export const bisectCenter: (a: ArrayLike<any>, x: any, lo?: number, hi?: number) => number = bisector(number).center
export default bisectRight
