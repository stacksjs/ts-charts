import treemapDice from './dice.ts'
import treemapSlice from './slice.ts'
import { phi, squarifyRatio } from './squarify.ts'
import type { SquarifyRow, SquarifyTile } from './squarify.ts'
import type { TileParent, TileNode } from './dice.ts'

interface ResquarifyParent extends TileParent, TileNode {
  _squarify?: SquarifyRow[] & { ratio: number }
}

const treemapResquarify: SquarifyTile = (function custom(ratio: number): SquarifyTile {
  function resquarify(parent: ResquarifyParent, x0: number, y0: number, x1: number, y1: number): void {
    let rows: SquarifyRow[] & { ratio: number }
    if ((rows = parent._squarify!) && (rows.ratio === ratio)) {
      let row: SquarifyRow
      let nodes: TileNode[]
      let i: number
      let j = -1
      let n: number
      const m = rows.length
      let value = parent.value!

      while (++j < m) {
        row = rows[j]
        nodes = row.children
        for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value!
        if (row.dice) treemapDice(row as any, x0, y0, x1, value ? y0 += (y1 - y0) * row.value / value : y1)
        else treemapSlice(row as any, x0, y0, value ? x0 += (x1 - x0) * row.value / value : x1, y1)
        value -= row.value
      }
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      const newRows = squarifyRatio(ratio, parent, x0, y0, x1, y1) as SquarifyRow[] & { ratio: number }
      newRows.ratio = ratio
      parent._squarify = newRows
    }
  }

  resquarify.ratio = function (x: number): SquarifyTile {
    return custom((x = +x) > 1 ? x : 1)
  }

  return resquarify as SquarifyTile
})(phi)

export default treemapResquarify
