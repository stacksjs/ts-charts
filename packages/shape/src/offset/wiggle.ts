import none from './none.ts'

export default function offsetWiggle(series: any[], order: number[]): void {
  let n: number, m: number, s0: any
  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return
  let y = 0
  let j = 1
  for (; j < m; ++j) {
    let s1 = 0
    let s2 = 0
    for (let i = 0; i < n; ++i) {
      const si = series[order[i]]
      const sij0 = si[j][1] || 0
      const sij1 = si[j - 1][1] || 0
      let s3 = (sij0 - sij1) / 2
      for (let k = 0; k < i; ++k) {
        const sk = series[order[k]]
        const skj0 = sk[j][1] || 0
        const skj1 = sk[j - 1][1] || 0
        s3 += skj0 - skj1
      }
      s1 += sij0, s2 += s3 * sij0
    }
    s0[j - 1][1] += s0[j - 1][0] = y
    if (s1) y -= s2 / s1
  }
  s0[j - 1][1] += s0[j - 1][0] = y
  none(series, order)
}
