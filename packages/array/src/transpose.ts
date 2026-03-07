import min from './min.ts'

export default function transpose(matrix: ArrayLike<ArrayLike<any>>): any[][] {
  const n = matrix.length
  if (!n) return []
  const m = min(Array.from(matrix), length)
  const result: any[][] = new Array(m)
  for (let i = 0; i < m; ++i) {
    const row: any[] = result[i] = new Array(n)
    for (let j = 0; j < n; ++j) {
      row[j] = matrix[j][i]
    }
  }
  return result
}

function length(d: ArrayLike<any>): number {
  return d.length
}
