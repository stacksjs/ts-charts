import { Quad } from './quad.ts'
import type { Accessor, QuadtreeInternalNode, QuadtreeLeaf, QuadtreeNode, QuadtreeNodeCallback } from './types.ts'

function defaultX<T>(d: T): number {
  return (d as unknown as number[])[0]
}

function defaultY<T>(d: T): number {
  return (d as unknown as number[])[1]
}

function leafCopy<T>(leaf: QuadtreeLeaf<T>): QuadtreeLeaf<T> {
  const copy: QuadtreeLeaf<T> = { data: leaf.data }
  let next: QuadtreeLeaf<T> = copy
  let current: QuadtreeLeaf<T> | undefined = leaf.next
  while (current) {
    next = next.next = { data: current.data }
    current = current.next
  }
  return copy
}

function isInternalNode<T>(node: QuadtreeNode<T>): node is QuadtreeInternalNode<T> {
  return Array.isArray(node)
}

export class Quadtree<T = [number, number]> {
  _x: Accessor<T>
  _y: Accessor<T>
  _x0: number
  _y0: number
  _x1: number
  _y1: number
  _root: QuadtreeNode<T> | undefined

  constructor(
    x?: Accessor<T>,
    y?: Accessor<T>,
    x0?: number,
    y0?: number,
    x1?: number,
    y1?: number,
  ) {
    this._x = x ?? defaultX as Accessor<T>
    this._y = y ?? defaultY as Accessor<T>
    this._x0 = x0 ?? NaN
    this._y0 = y0 ?? NaN
    this._x1 = x1 ?? NaN
    this._y1 = y1 ?? NaN
    this._root = undefined
  }

  copy(): Quadtree<T> {
    const copy = new Quadtree<T>(this._x, this._y, this._x0, this._y0, this._x1, this._y1)
    let node = this._root

    if (!node) return copy

    if (!isInternalNode(node)) {
      copy._root = leafCopy(node)
      return copy
    }

    const nodes: Array<{ source: QuadtreeInternalNode<T>, target: QuadtreeInternalNode<T> }> = []
    const rootCopy = new Array(4) as QuadtreeInternalNode<T>
    copy._root = rootCopy
    nodes.push({ source: node, target: rootCopy })

    let current: { source: QuadtreeInternalNode<T>, target: QuadtreeInternalNode<T> } | undefined
    while (current = nodes.pop()) {
      for (let i = 0; i < 4; ++i) {
        const child = current.source[i]
        if (child) {
          if (isInternalNode(child)) {
            const childCopy = new Array(4) as QuadtreeInternalNode<T>
            current.target[i] = childCopy
            nodes.push({ source: child, target: childCopy })
          }
          else {
            current.target[i] = leafCopy(child)
          }
        }
      }
    }

    return copy
  }

  add(d: T): this {
    const x = +this._x.call(null, d)
    const y = +this._y.call(null, d)
    addToTree(this.cover(x, y), x, y, d)
    return this
  }

  addAll(data: Iterable<T>): this {
    let dataArray: T[]
    if (!Array.isArray(data)) dataArray = Array.from(data)
    else dataArray = data

    const n = dataArray.length
    const xz = new Float64Array(n)
    const yz = new Float64Array(n)
    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity

    for (let i = 0; i < n; ++i) {
      const d = dataArray[i]
      const x = +this._x.call(null, d)
      const y = +this._y.call(null, d)
      if (isNaN(x) || isNaN(y)) continue
      xz[i] = x
      yz[i] = y
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }

    if (x0 > x1 || y0 > y1) return this

    this.cover(x0, y0).cover(x1, y1)

    for (let i = 0; i < n; ++i) {
      addToTree(this, xz[i], yz[i], dataArray[i])
    }

    return this
  }

  cover(x: number, y: number): this {
    if (isNaN(x = +x) || isNaN(y = +y)) return this

    let x0 = this._x0
    let y0 = this._y0
    let x1 = this._x1
    let y1 = this._y1

    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x)) + 1
      y1 = (y0 = Math.floor(y)) + 1
    }
    else {
      let z = x1 - x0 || 1
      let node = this._root
      let parent: QuadtreeInternalNode<T>
      let i: number

      while (x0 > x || x >= x1 || y0 > y || y >= y1) {
        i = ((y < y0) as unknown as number) << 1 | ((x < x0) as unknown as number)
        parent = new Array(4) as QuadtreeInternalNode<T>
        parent[i] = node
        node = parent
        z *= 2
        switch (i) {
          case 0: x1 = x0 + z; y1 = y0 + z; break
          case 1: x0 = x1 - z; y1 = y0 + z; break
          case 2: x1 = x0 + z; y0 = y1 - z; break
          case 3: x0 = x1 - z; y0 = y1 - z; break
        }
      }

      if (this._root && isInternalNode(this._root)) this._root = node
    }

    this._x0 = x0
    this._y0 = y0
    this._x1 = x1
    this._y1 = y1
    return this
  }

  data(): T[] {
    const data: T[] = []
    this.visit((node) => {
      if (!isInternalNode(node)) {
        let current: QuadtreeLeaf<T> | undefined = node
        do {
          data.push(current!.data)
          current = current!.next
        } while (current)
      }
    })
    return data
  }

  extent(): [[number, number], [number, number]] | undefined
  extent(extent: [[number, number], [number, number]]): this
  extent(extent?: [[number, number], [number, number]]): [[number, number], [number, number]] | undefined | this {
    if (extent !== undefined) {
      return this.cover(+extent[0][0], +extent[0][1]).cover(+extent[1][0], +extent[1][1])
    }
    return isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]]
  }

  find(x: number, y: number, radius?: number | null): T | undefined {
    let data: T | undefined
    let x0 = this._x0
    let y0 = this._y0
    let x1: number
    let y1: number
    let x2: number
    let y2: number
    let x3 = this._x1
    let y3 = this._y1
    const quads: Array<Quad<T>> = []
    let node = this._root
    let q: Quad<T> | undefined
    let i: number

    if (node) quads.push(new Quad(node, x0, y0, x3, y3))
    if (radius == null) radius = Infinity
    else {
      x0 = x - radius
      y0 = y - radius
      x3 = x + radius
      y3 = y + radius
      radius *= radius
    }

    while (q = quads.pop()) {
      if (!(node = q.node!)
        || (x1 = q.x0) > x3
        || (y1 = q.y0) > y3
        || (x2 = q.x1) < x0
        || (y2 = q.y1) < y0) continue

      if (isInternalNode(node)) {
        const xm = (x1! + x2!) / 2
        const ym = (y1! + y2!) / 2

        quads.push(
          new Quad(node[3], xm, ym, x2!, y2!),
          new Quad(node[2], x1!, ym, xm, y2!),
          new Quad(node[1], xm, y1!, x2!, ym),
          new Quad(node[0], x1!, y1!, xm, ym),
        )

        if (i = (((y >= ym) as unknown as number) << 1 | ((x >= xm) as unknown as number))) {
          q = quads[quads.length - 1]
          quads[quads.length - 1] = quads[quads.length - 1 - i]
          quads[quads.length - 1 - i] = q
        }
      }
      else {
        const dx = x - +this._x.call(null, node.data)
        const dy = y - +this._y.call(null, node.data)
        const d2 = dx * dx + dy * dy
        if (d2 < radius!) {
          const d = Math.sqrt(radius = d2)
          x0 = x - d
          y0 = y - d
          x3 = x + d
          y3 = y + d
          data = node.data
        }
      }
    }

    return data
  }

  remove(d: T): this {
    const x = +this._x.call(null, d)
    const y = +this._y.call(null, d)
    if (isNaN(x) || isNaN(y)) return this

    let parent: QuadtreeInternalNode<T> | undefined
    let node = this._root
    let retainer: QuadtreeInternalNode<T> | undefined
    let previous: QuadtreeLeaf<T> | undefined
    let next: QuadtreeLeaf<T> | undefined
    let x0 = this._x0
    let y0 = this._y0
    let x1 = this._x1
    let y1 = this._y1
    let xm: number
    let ym: number
    let right: boolean
    let bottom: boolean
    let i = 0
    let j = 0

    if (!node) return this

    if (isInternalNode(node)) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        right = x >= (xm = (x0 + x1) / 2)
        if (right) x0 = xm; else x1 = xm
        bottom = y >= (ym = (y0 + y1) / 2)
        if (bottom) y0 = ym; else y1 = ym
        i = ((bottom as unknown as number) << 1 | (right as unknown as number))
        parent = node as QuadtreeInternalNode<T>
        node = (node as QuadtreeInternalNode<T>)[i]
        if (!node) return this
        if (!isInternalNode(node)) break
        if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) {
          retainer = parent
          j = i
        }
      }
    }

    let leaf = node as QuadtreeLeaf<T>
    while (leaf.data !== d) {
      previous = leaf
      leaf = leaf.next!
      if (!leaf) return this
    }
    next = leaf.next as QuadtreeLeaf<T> | undefined
    if (next) delete (leaf as Partial<QuadtreeLeaf<T>>).next

    if (previous) {
      if (next) previous.next = next; else delete previous.next
      return this
    }

    if (!parent!) {
      this._root = next
      return this
    }

    if (next) parent![i] = next; else delete (parent as Record<number, unknown>)[i]

    const remaining = ((parent![0] || parent![1] || parent![2] || parent![3]) as QuadtreeNode<T> | undefined)
    if (remaining
      && remaining === (parent![3] || parent![2] || parent![1] || parent![0])
      && !isInternalNode(remaining)) {
      if (retainer) retainer[j] = remaining
      else this._root = remaining
    }

    return this
  }

  removeAll(data: Iterable<T>): this {
    for (const d of data) this.remove(d)
    return this
  }

  root(): QuadtreeNode<T> | undefined {
    return this._root
  }

  size(): number {
    let size = 0
    this.visit((node) => {
      if (!isInternalNode(node)) {
        let current: QuadtreeLeaf<T> | undefined = node
        do {
          ++size
          current = current!.next
        } while (current)
      }
    })
    return size
  }

  visit(callback: QuadtreeNodeCallback<T>): this {
    const quads: Array<Quad<T>> = []
    let q: Quad<T> | undefined
    let node = this._root
    let child: QuadtreeNode<T> | undefined
    let x0: number
    let y0: number
    let x1: number
    let y1: number

    if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1))
    while (q = quads.pop()) {
      if (!callback(node = q.node!, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && isInternalNode(node)) {
        const xm = (x0 + x1) / 2
        const ym = (y0 + y1) / 2
        if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1))
        if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1))
        if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym))
        if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym))
      }
    }
    return this
  }

  visitAfter(callback: QuadtreeNodeCallback<T>): this {
    const quads: Array<Quad<T>> = []
    const next: Array<Quad<T>> = []
    let q: Quad<T> | undefined

    if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1))
    while (q = quads.pop()) {
      const node = q.node!
      if (isInternalNode(node)) {
        let child: QuadtreeNode<T> | undefined
        const x0 = q.x0
        const y0 = q.y0
        const x1 = q.x1
        const y1 = q.y1
        const xm = (x0 + x1) / 2
        const ym = (y0 + y1) / 2
        if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym))
        if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym))
        if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1))
        if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1))
      }
      next.push(q)
    }
    while (q = next.pop()) {
      callback(q.node!, q.x0, q.y0, q.x1, q.y1)
    }
    return this
  }

  x(): Accessor<T>
  x(x: Accessor<T>): this
  x(x?: Accessor<T>): Accessor<T> | this {
    if (x !== undefined) {
      this._x = x
      return this
    }
    return this._x
  }

  y(): Accessor<T>
  y(y: Accessor<T>): this
  y(y?: Accessor<T>): Accessor<T> | this {
    if (y !== undefined) {
      this._y = y
      return this
    }
    return this._y
  }
}

function addToTree<T>(tree: Quadtree<T>, x: number, y: number, d: T): Quadtree<T> {
  if (isNaN(x) || isNaN(y)) return tree

  let parent: QuadtreeInternalNode<T> | undefined
  let node = tree._root
  const leaf: QuadtreeLeaf<T> = { data: d }
  let x0 = tree._x0
  let y0 = tree._y0
  let x1 = tree._x1
  let y1 = tree._y1
  let xm: number
  let ym: number
  let xp: number
  let yp: number
  let right: boolean
  let bottom: boolean
  let i = 0
  let j: number

  if (!node) {
    tree._root = leaf
    return tree
  }

  while (isInternalNode(node)) {
    right = x >= (xm = (x0 + x1) / 2)
    if (right) x0 = xm; else x1 = xm
    bottom = y >= (ym = (y0 + y1) / 2)
    if (bottom) y0 = ym; else y1 = ym
    i = (bottom as unknown as number) << 1 | (right as unknown as number)
    parent = node
    node = node[i]!
    if (!node) {
      parent[i] = leaf
      return tree
    }
  }

  xp = +tree._x.call(null, (node as QuadtreeLeaf<T>).data)
  yp = +tree._y.call(null, (node as QuadtreeLeaf<T>).data)
  if (x === xp && y === yp) {
    leaf.next = node as QuadtreeLeaf<T>
    if (parent) parent[i] = leaf; else tree._root = leaf
    return tree
  }

  do {
    const newNode = new Array(4) as QuadtreeInternalNode<T>
    if (parent) parent[i] = newNode; else tree._root = newNode
    parent = newNode
    right = x >= (xm = (x0 + x1) / 2)
    if (right) x0 = xm; else x1 = xm
    bottom = y >= (ym = (y0 + y1) / 2)
    if (bottom) y0 = ym; else y1 = ym
    i = (bottom as unknown as number) << 1 | (right as unknown as number)
    j = ((yp >= ym) as unknown as number) << 1 | ((xp >= xm) as unknown as number)
  } while (i === j)

  parent[j] = node
  parent[i] = leaf
  return tree
}

export function quadtree<T = [number, number]>(
  nodes?: Iterable<T> | null,
  x?: Accessor<T>,
  y?: Accessor<T>,
): Quadtree<T> {
  const tree = new Quadtree<T>(
    x ?? undefined,
    y ?? undefined,
    NaN,
    NaN,
    NaN,
    NaN,
  )
  return nodes == null ? tree : tree.addAll(nodes)
}
