import type { StackSeries } from '../offset/none.ts'
import ascending from './ascending.ts'

export default function orderDescending(series: StackSeries[]): number[] {
  return ascending(series).reverse()
}
