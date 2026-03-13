import decompose, { identity, type DecomposeResult } from './decompose.ts'

let svgNode: SVGGElement

/* eslint-disable no-undef */
export function parseCss(value: string): DecomposeResult {
  // eslint-disable-next-line pickier/no-unused-vars
  const m = new (typeof DOMMatrix === 'function' ? DOMMatrix : (globalThis as any).WebKitCSSMatrix)(value + '')
  return m.isIdentity ? identity : decompose(m.a, m.b, m.c, m.d, m.e, m.f)
}

export function parseSvg(value: string | null): DecomposeResult {
  if (value == null) return identity
  if (!svgNode) svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
  svgNode.setAttribute('transform', value)
  const consolidated = svgNode.transform.baseVal.consolidate()
  if (!consolidated) return identity
  const matrix = consolidated.matrix
  return decompose(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f)
}
