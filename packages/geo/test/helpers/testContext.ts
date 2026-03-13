export function testContext(): {
  arc(x: number, y: number, r: number): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  closePath(): void
  result(): any[]
} {
  let buffer: any[] = []
  return {
    arc(x: number, y: number, r: number): void { buffer.push({ type: 'arc', x: Math.round(x), y: Math.round(y), r: r }) },
    moveTo(x: number, y: number): void { buffer.push({ type: 'moveTo', x: Math.round(x), y: Math.round(y) }) },
    lineTo(x: number, y: number): void { buffer.push({ type: 'lineTo', x: Math.round(x), y: Math.round(y) }) },
    closePath(): void { buffer.push({ type: 'closePath' }) },
    // eslint-disable-next-line pickier/no-unused-vars
    result(): any[] { const result = buffer; buffer = []; return result }
  }
}
