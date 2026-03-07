import max from './max.ts'
import maxIndex from './maxIndex.ts'
import min from './min.ts'
import minIndex from './minIndex.ts'
import quickselect from './quickselect.ts'
import number, { numbers } from './number.ts'
import { ascendingDefined } from './sort.ts'
import greatest from './greatest.ts'

export default function quantile(values: Iterable<any>, p: number, valueof?: (value: any, index: number, values: Iterable<any>) => any): number | undefined {
  const vals = Float64Array.from(numbers(values, valueof))
  const n = vals.length
  if (!n || isNaN(p = +p)) return
  if (p <= 0 || n < 2) return min(vals)
  if (p >= 1) return max(vals)
  const i = (n - 1) * p
  const i0 = Math.floor(i)
  const arr = Array.from(vals) as any[]
  const value0 = max(quickselect(arr, i0).slice(0, i0 + 1))
  const value1 = min(arr.slice(i0 + 1))
  return value0 + (value1 - value0) * (i - i0)
}

export function quantileSorted(values: ArrayLike<any>, p: number, valueof: (value: any, index: number, values: ArrayLike<any>) => number = number): number | undefined {
  const n = values.length
  if (!n || isNaN(p = +p)) return
  if (p <= 0 || n < 2) return +valueof(values[0], 0, values)
  if (p >= 1) return +valueof(values[n - 1], n - 1, values)
  const i = (n - 1) * p
  const i0 = Math.floor(i)
  const value0 = +valueof(values[i0], i0, values)
  const value1 = +valueof(values[i0 + 1], i0 + 1, values)
  return value0 + (value1 - value0) * (i - i0)
}

export function quantileIndex(values: ArrayLike<any>, p: number, valueof: (value: any, index: number, values: ArrayLike<any>) => number = number): number {
  if (isNaN(p = +p)) return -1
  const nums = Float64Array.from(values as any, (_: any, i: number) => number(valueof(values[i], i, values)))
  if (p <= 0) return minIndex(nums)
  if (p >= 1) return maxIndex(nums)
  const index = Array.from(Uint32Array.from(values as any, (_: any, i: number) => i))
  const j = nums.length - 1
  let i = Math.floor(j * p)
  quickselect(index as any, i, 0, j, (a: any, b: any) => ascendingDefined(nums[a], nums[b]))
  i = greatest(index.slice(0, i + 1), (idx: any) => nums[idx]) as any
  return i >= 0 ? i : -1
}
