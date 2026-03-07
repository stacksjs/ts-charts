import none from './none.ts'

export default function orderAscending(series: any[]): number[] {
  const sums = series.map(sum)
  return none(series).sort(function (a: number, b: number): number { return sums[a] - sums[b] })
}

export function sum(series: any[]): number {
  let s = 0, i = -1
  const n = series.length
  let v: number
  while (++i < n) if (v = +series[i][1]) s += v
  return s
}
