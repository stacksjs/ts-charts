import none from './none.ts'

export default function orderAppearance(series: any[]): number[] {
  const peaks = series.map(peak)
  return none(series).sort(function (a: number, b: number): number { return peaks[a] - peaks[b] })
}

function peak(series: any[]): number {
  let i = -1, j = 0
  const n = series.length
  let vi: number, vj = -Infinity
  while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i
  return j
}
