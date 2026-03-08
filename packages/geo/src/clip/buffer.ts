import noop from '../noop.ts'
import type { ClipBuffer } from '../types.ts'

export default function clipBuffer(): ClipBuffer {
  let lines: number[][][] = [],
      line: number[][]
  return {
    point: function (x: number, y: number, m?: number): void {
      line.push([x, y, m!])
    },
    lineStart: function (): void {
      lines.push(line = [])
    },
    lineEnd: noop,
    polygonStart: noop,
    polygonEnd: noop,
    rejoin: function (): void {
      if (lines.length > 1) lines.push(lines.pop()!.concat(lines.shift()!))
    },
    result: function (): number[][][] {
      const result = lines
      lines = []
      line = null!
      return result
    }
  }
}
