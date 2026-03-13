import type { TileParent, TileNode } from './dice.ts'

export default function treemapBinary(parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): void {
  const nodes = parent.children!
  const n = nodes.length
  let sum: number
  const sums = new Array<number>(n + 1)

  sums[0] = sum = 0
  for (let i = 0; i < n; ++i) {
    sums[i + 1] = sum += nodes[i].value!
  }

  partition(0, n, parent.value!, x0, y0, x1, y1)

  function partition(i: number, j: number, value: number, x0: number, y0: number, x1: number, y1: number): void {
    if (i >= j - 1) {
      const node = nodes[i]
      node.x0 = x0
      node.y0 = y0
      node.x1 = x1
      node.y1 = y1
      return
    }

    const valueOffset = sums[i]
    const valueTarget = (value / 2) + valueOffset
    let k = i + 1
    let hi = j - 1

    while (k < hi) {
      const mid = k + hi >>> 1
      if (sums[mid] < valueTarget) k = mid + 1
      else hi = mid
    }

    if ((valueTarget - sums[k - 1]) < (sums[k] - valueTarget) && i + 1 < k) --k

    const valueLeft = sums[k] - valueOffset
    const valueRight = value - valueLeft

    if ((x1 - x0) > (y1 - y0)) {
      const xk = value ? (x0 * valueRight + x1 * valueLeft) / value : x1
      partition(i, k, valueLeft, x0, y0, xk, y1)
      partition(k, j, valueRight, xk, y0, x1, y1)
    // eslint-disable-next-line pickier/no-unused-vars
    } else {
      const yk = value ? (y0 * valueRight + y1 * valueLeft) / value : y1
      partition(i, k, valueLeft, x0, y0, x1, yk)
      partition(k, j, valueRight, x0, yk, x1, y1)
    }
  }
}
