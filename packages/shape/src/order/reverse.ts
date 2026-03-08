import type { StackSeries } from '../offset/none.ts'
import none from './none.ts'

export default function orderReverse(series: StackSeries[]): number[] {
  return none(series).reverse()
}
