import toArray from '../array.ts'
import lcg from '../lcg.ts'
import { packEncloseRandom } from './enclose.ts'

interface PackCircle {
  x: number
  y: number
  r: number
}

interface FrontChainNode {
  _: PackCircle
  next: FrontChainNode
  previous: FrontChainNode
}

function place(b: PackCircle, a: PackCircle, c: PackCircle): void {
  const dx = b.x - a.x
  let x: number
  let a2: number
  const dy = b.y - a.y
  let y: number
  let b2: number
  const d2 = dx * dx + dy * dy
  if (d2) {
    a2 = a.r + c.r
    a2 *= a2
    b2 = b.r + c.r
    b2 *= b2
    if (a2 > b2) {
      x = (d2 + b2 - a2) / (2 * d2)
      y = Math.sqrt(Math.max(0, b2 / d2 - x * x))
      c.x = b.x - x * dx - y * dy
      c.y = b.y - x * dy + y * dx
    // eslint-disable-next-line pickier/no-unused-vars
    } else {
      x = (d2 + a2 - b2) / (2 * d2)
      y = Math.sqrt(Math.max(0, a2 / d2 - x * x))
      c.x = a.x + x * dx - y * dy
      c.y = a.y + x * dy + y * dx
    }
  // eslint-disable-next-line pickier/no-unused-vars
  } else {
    c.x = a.x + c.r
    c.y = a.y
  }
}

function intersects(a: PackCircle, b: PackCircle): boolean {
  const dr = a.r + b.r - 1e-6
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dr > 0 && dr * dr > dx * dx + dy * dy
}

function score(node: FrontChainNode): number {
  const a = node._
  const b = node.next._
  const ab = a.r + b.r
  const dx = (a.x * b.r + b.x * a.r) / ab
  const dy = (a.y * b.r + b.y * a.r) / ab
  return dx * dx + dy * dy
}

function createNode(circle: PackCircle): FrontChainNode {
  return {
    _: circle,
    next: null as any,
    previous: null as any,
  }
}

export function packSiblingsRandom(circles: PackCircle[], random: () => number): number {
  const n = (circles = toArray(circles) as PackCircle[]).length
  if (!n) return 0

  let a: FrontChainNode
  let b: FrontChainNode
  let c: FrontChainNode
  let j: FrontChainNode
  let k: FrontChainNode
  let sj: number
  let sk: number
  let aa: number
  let ca: number
  let i: number

  // Place the first circle.
  const c0 = circles[0]
  c0.x = 0
  c0.y = 0
  if (!(n > 1)) return c0.r

  // Place the second circle.
  const c1 = circles[1]
  c0.x = -c1.r
  c1.x = c0.r
  c1.y = 0
  if (!(n > 2)) return c0.r + c1.r

  // Place the third circle.
  place(circles[1], circles[0], circles[2])

  // Initialize the front-chain using the first three circles a, b and c.
  a = createNode(circles[0])
  b = createNode(circles[1])
  c = createNode(circles[2])
  a.next = c.previous = b
  b.next = a.previous = c
  c.next = b.previous = a

  // Attempt to place each remaining circle...
  pack: for (i = 3; i < n; ++i) {
    place(a._, b._, circles[i])
    c = createNode(circles[i])

    // Find the closest intersecting circle on the front-chain, if any.
    j = b.next
    k = a.previous
    sj = b._.r
    sk = a._.r
    do {
      if (sj <= sk) {
        if (intersects(j._, c._)) {
          b = j
          a.next = b
          b.previous = a
          --i
          continue pack
        }
        sj += j._.r
        j = j.next
      // eslint-disable-next-line pickier/no-unused-vars
      } else {
        if (intersects(k._, c._)) {
          a = k
          a.next = b
          b.previous = a
          --i
          continue pack
        }
        sk += k._.r
        k = k.previous
      }
    } while (j !== k.next)

    // Success! Insert the new circle c between a and b.
    c.previous = a
    c.next = b
    a.next = b.previous = b = c

    // Compute the new closest circle pair to the centroid.
    aa = score(a)
    while ((c = c.next) !== b) {
      if ((ca = score(c)) < aa) {
        a = c
        aa = ca
      }
    }
    b = a.next
  }

  // Compute the enclosing circle of the front chain.
  const frontChain: PackCircle[] = [b._]
  let fc = b
  while ((fc = fc.next) !== b) frontChain.push(fc._)
  const enclosing = packEncloseRandom(frontChain, random)

  // Translate the circles to put the enclosing circle around the origin.
  for (i = 0; i < n; ++i) {
    const ci = circles[i]
    ci.x -= enclosing.x
    ci.y -= enclosing.y
  }

  return enclosing.r
}

export default function packSiblings(circles: PackCircle[]): PackCircle[] {
  packSiblingsRandom(circles, lcg())
  return circles
}
