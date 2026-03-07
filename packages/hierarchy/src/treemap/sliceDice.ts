import treemapDice from './dice.ts'
import treemapSlice from './slice.ts'
import type { TileParent, TileNode } from './dice.ts'

export default function treemapSliceDice(parent: TileParent & TileNode, x0: number, y0: number, x1: number, y1: number): void {
  (parent.depth! & 1 ? treemapSlice : treemapDice)(parent, x0, y0, x1, y1)
}
