import noop from '../noop.ts'

export default function clipBuffer(): any {
  let lines: any[][] = [],
      line: any[]
  return {
    point: function (x: number, y: number, m?: number): void {
      line.push([x, y, m])
    },
    lineStart: function (): void {
      lines.push(line = [])
    },
    lineEnd: noop,
    rejoin: function (): void {
      if (lines.length > 1) lines.push(lines.pop()!.concat(lines.shift()!))
    },
    result: function (): any[][] {
      const result = lines
      lines = []
      line = null as any
      return result
    }
  }
}
