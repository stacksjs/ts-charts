export function testContext() {
  let buffer: any[] = []
  return {
    arc(x: number, y: number, r: number) { buffer.push({ type: 'arc', x: Math.round(x), y: Math.round(y), r: r }) },
    moveTo(x: number, y: number) { buffer.push({ type: 'moveTo', x: Math.round(x), y: Math.round(y) }) },
    lineTo(x: number, y: number) { buffer.push({ type: 'lineTo', x: Math.round(x), y: Math.round(y) }) },
    closePath() { buffer.push({ type: 'closePath' }) },
    result() { const result = buffer; buffer = []; return result }
  }
}
