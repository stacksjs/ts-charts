export default function roundNode(node: { x0?: number, y0?: number, x1?: number, y1?: number }): void {
  node.x0 = Math.round(node.x0!)
  node.y0 = Math.round(node.y0!)
  node.x1 = Math.round(node.x1!)
  node.y1 = Math.round(node.y1!)
}
