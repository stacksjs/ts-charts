import sourceEvent from './sourceEvent.ts'

// eslint-disable-next-line ts/no-empty-object-type -- D3 events can be native or synthetic with sourceEvent chains
interface D3Event extends Event {
  sourceEvent?: D3Event
}

export default function pointer(event: D3Event, node?: Element): [number, number] {
  // D3 events may carry sourceEvent chains; unwrap to get the native event
  const e = sourceEvent(event) as MouseEvent
  if (node === undefined) node = e.currentTarget as Element
  if (node) {
    const svg = (node as SVGElement).ownerSVGElement || node
    if ('createSVGPoint' in svg) {
      let point = (svg as SVGSVGElement).createSVGPoint()
      point.x = e.clientX
      point.y = e.clientY
      point = point.matrixTransform((node as SVGGraphicsElement).getScreenCTM()!.inverse())
      return [point.x, point.y]
    }
    if (node.getBoundingClientRect) {
      const rect = node.getBoundingClientRect()
      return [e.clientX - rect.left - (node as HTMLElement).clientLeft, e.clientY - rect.top - (node as HTMLElement).clientTop]
    }
  }
  return [e.pageX, e.pageY]
}
