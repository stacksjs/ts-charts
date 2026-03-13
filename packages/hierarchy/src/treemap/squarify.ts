import treemapDice from './dice.ts'
import treemapSlice from './slice.ts'
import type { TileParent, TileNode } from './dice.ts'

export const phi: number = (1 + Math.sqrt(5)) / 2

export interface SquarifyRow {
  value: number
  dice: boolean
  children: TileNode[]
}

export function squarifyRatio(ratio: number, parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): SquarifyRow[] {
  const rows: SquarifyRow[] = []
  const nodes = parent.children!
  let row: SquarifyRow
  let nodeValue: number
  let i0 = 0
  let i1 = 0
  const n = nodes.length
  let dx: number
  let dy: number
  let value = parent.value!
  let sumValue: number
  let minValue: number
  let maxValue: number
  let newRatio: number
  let minRatio: number
  let alpha: number
  let beta: number

  while (i0 < n) {
    dx = x1 - x0
    dy = y1 - y0

    // Find the next non-empty node.
    // eslint-disable-next-line pickier/no-unused-vars
    do sumValue = nodes[i1++].value!; while (!sumValue && i1 < n)
    minValue = maxValue = sumValue
    alpha = Math.max(dy / dx, dx / dy) / (value * ratio)
    beta = sumValue * sumValue * alpha
    minRatio = Math.max(maxValue / beta, beta / minValue)

    // Keep adding nodes while the aspect ratio maintains or improves.
    for (; i1 < n; ++i1) {
      sumValue += nodeValue = nodes[i1].value!
      if (nodeValue < minValue) minValue = nodeValue
      if (nodeValue > maxValue) maxValue = nodeValue
      beta = sumValue * sumValue * alpha
      newRatio = Math.max(maxValue / beta, beta / minValue)
      // eslint-disable-next-line pickier/no-unused-vars
      if (newRatio > minRatio) { sumValue -= nodeValue; break }
      minRatio = newRatio
    }

    // Position and record the row orientation.
    rows.push(row = { value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1) })
    if (row.dice) treemapDice(row as any, x0, y0, x1, value ? y0 += dy * sumValue / value : y1)
    else treemapSlice(row as any, x0, y0, value ? x0 += dx * sumValue / value : x1, y1)
    value -= sumValue
    i0 = i1
  }

  return rows
}

export interface SquarifyTile {
  (parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): void
  ratio(ratio: number): SquarifyTile
}

const treemapSquarify: SquarifyTile = (function custom(ratio: number): SquarifyTile {
  function squarify(parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): void {
    squarifyRatio(ratio, parent, x0, y0, x1, y1)
  }

  squarify.ratio = function (x: number): SquarifyTile {
    return custom((x = +x) > 1 ? x : 1)
  }

  return squarify
})(phi)

export default treemapSquarify
