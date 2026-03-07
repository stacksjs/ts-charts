import sourceEvent from './sourceEvent.ts'

export default function pointer(event: any, node?: any): [number, number] {
  event = sourceEvent(event)
  if (node === undefined) node = event.currentTarget
  if (node) {
    const svg = node.ownerSVGElement || node
    if (svg.createSVGPoint) {
      let point = svg.createSVGPoint()
      point.x = event.clientX
      point.y = event.clientY
      point = point.matrixTransform(node.getScreenCTM().inverse())
      return [point.x, point.y]
    }
    if (node.getBoundingClientRect) {
      const rect = node.getBoundingClientRect()
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop]
    }
  }
  return [event.pageX, event.pageY]
}
