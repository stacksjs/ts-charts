export interface HierarchyLink<T> {
  source: HierarchyNode<T>
  target: HierarchyNode<T>
}

export class HierarchyNode<T> {
  // eslint-disable-next-line pickier/no-unused-vars
  data: T
  depth: number
  height: number
  parent: HierarchyNode<T> | null
  // These are only set when actually used - they must NOT be initialized
  // to undefined so that for...in enumeration matches d3 behavior
  declare children: HierarchyNode<T>[] | undefined
  declare value: number | undefined
  declare id: string | undefined
  declare x: number | undefined
  declare y: number | undefined
  declare r: number | undefined
  declare x0: number | undefined
  declare y0: number | undefined
  declare x1: number | undefined
  declare y1: number | undefined
  declare _squarify: SquarifyRow[] & { ratio: number } | undefined

  constructor(data: T) {
    this.data = data
    this.depth = 0
    this.height = 0
    this.parent = null
  }

  count(): this {
    return this.eachAfter(countNode)
  }

  each(callback: (node: HierarchyNode<T>, index: number, thisNode: HierarchyNode<T>) => void, that?: unknown): this {
    let index = -1
    for (const node of this) {
      callback.call(that, node, ++index, this)
    }
    return this
  }

  eachAfter(callback: (node: HierarchyNode<T>, index: number, thisNode: HierarchyNode<T>) => void, that?: unknown): this {
    let node: HierarchyNode<T> | undefined = this
    const nodes: HierarchyNode<T>[] = [node]
    const next: HierarchyNode<T>[] = []
    let children: HierarchyNode<T>[] | undefined
    let i: number
    let n: number
    let index = -1
    while (node = nodes.pop()) {
      next.push(node)
      if (children = node.children) {
        for (i = 0, n = children.length; i < n; ++i) {
          nodes.push(children[i])
        }
      }
    }
    while (node = next.pop()) {
      callback.call(that, node, ++index, this)
    }
    return this
  }

  eachBefore(callback: (node: HierarchyNode<T>, index: number, thisNode: HierarchyNode<T>) => void, that?: unknown): this {
    let node: HierarchyNode<T> | undefined = this
    const nodes: HierarchyNode<T>[] = [node]
    let children: HierarchyNode<T>[] | undefined
    let i: number
    let index = -1
    while (node = nodes.pop()) {
      callback.call(that, node, ++index, this)
      if (children = node.children) {
        for (i = children.length - 1; i >= 0; --i) {
          nodes.push(children[i])
        }
      }
    }
    return this
  }

  find(callback: (node: HierarchyNode<T>, index: number, thisNode: HierarchyNode<T>) => boolean, that?: unknown): HierarchyNode<T> | undefined {
    let index = -1
    for (const node of this) {
      if (callback.call(that, node, ++index, this)) {
        return node
      }
    }
    return undefined
  }

  sum(value: (d: T) => number): this {
    return this.eachAfter(function (node) {
      let s = +value(node.data) || 0
      const children = node.children
      let i = children && children.length
      if (i) {
        while (--i! >= 0) s += children![i!].value!
      }
      node.value = s
    })
  }

  sort(compare: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number): this {
    return this.eachBefore(function (node) {
      if (node.children) {
        node.children.sort(compare)
      }
    })
  }

  path(end: HierarchyNode<T>): HierarchyNode<T>[] {
    let start: HierarchyNode<T> = this
    const ancestor = leastCommonAncestor(start, end)
    const nodes: HierarchyNode<T>[] = [start]
    while (start !== ancestor!) {
      start = start.parent!
      nodes.push(start)
    }
    const k = nodes.length
    while (end !== ancestor!) {
      nodes.splice(k, 0, end)
      end = end.parent!
    }
    return nodes
  }

  ancestors(): HierarchyNode<T>[] {
    let node: HierarchyNode<T> | null = this
    const nodes: HierarchyNode<T>[] = [node]
    while (node = node.parent) {
      nodes.push(node)
    }
    return nodes
  }

  descendants(): HierarchyNode<T>[] {
    return Array.from(this)
  }

  leaves(): HierarchyNode<T>[] {
    const leaves: HierarchyNode<T>[] = []
    this.eachBefore(function (node) {
      if (!node.children) {
        leaves.push(node)
      }
    })
    return leaves
  }

  links(): HierarchyLink<T>[] {
    const root = this
    const links: HierarchyLink<T>[] = []
    root.each(function (node) {
      if (node !== root) {
        links.push({ source: node.parent!, target: node })
      }
    })
    return links
  }

  copy(): HierarchyNode<T> {
    // eslint-disable-next-line pickier/no-unused-vars
    return hierarchy(this as unknown as T).eachBefore(copyData as (node: HierarchyNode<T>) => void)
  }

  *[Symbol.iterator](): Generator<HierarchyNode<T>, void, undefined> {
    let node: HierarchyNode<T> | undefined = this
    let current: HierarchyNode<T>[]
    let next: HierarchyNode<T>[] = [node]
    let children: HierarchyNode<T>[] | undefined
    let i: number
    let n: number
    do {
      current = next.reverse()
      next = []
      while (node = current.pop()) {
        yield node
        if (children = node.children) {
          for (i = 0, n = children.length; i < n; ++i) {
            next.push(children[i])
          }
        }
      }
    } while (next.length)
  }
}

interface SquarifyRow {
  value: number
  dice: boolean
  children: HierarchyNode<unknown>[]
}

function countNode<T>(node: HierarchyNode<T>): void {
  let sum = 0
  const children = node.children
  let i = children && children.length
  if (!i) sum = 1
  else {
    while (--i! >= 0) sum += children![i!].value!
  }
  node.value = sum
}

function leastCommonAncestor<T>(a: HierarchyNode<T>, b: HierarchyNode<T>): HierarchyNode<T> | null {
  if (a === b) return a
  const aNodes = a.ancestors()
  const bNodes = b.ancestors()
  let c: HierarchyNode<T> | null = null
  let aNode = aNodes.pop()
  let bNode = bNodes.pop()
  while (aNode === bNode) {
    c = aNode!
    aNode = aNodes.pop()
    bNode = bNodes.pop()
  }
  return c
}

function objectChildren<T>(d: T): Iterable<T> | null | undefined {
  return (d as Record<string, unknown>).children as Iterable<T> | undefined
}

function mapChildren<T>(d: T): Iterable<T> | null {
  return Array.isArray(d) ? d[1] as Iterable<T> : null
}

// eslint-disable-next-line pickier/no-unused-vars
function copyData(node: HierarchyNode<{ value?: number; data: unknown }>): void {
  if (node.data.value !== undefined) node.value = node.data.value
  // eslint-disable-next-line pickier/no-unused-vars
  node.data = node.data.data as { value?: number; data: unknown }
}

export function computeHeight<T>(node: HierarchyNode<T>): void {
  let height = 0
  let current: HierarchyNode<T> | null = node
  do
    current.height = height
  while ((current = current.parent) && (current.height < ++height))
}

export default function hierarchy<T>(data: T, children?: (d: T) => Iterable<T> | null | undefined): HierarchyNode<T> {
  if (data instanceof Map) {
    data = [undefined, data] as unknown as T
    // eslint-disable-next-line pickier/no-unused-vars
    if (children === undefined) children = mapChildren as unknown as (d: T) => Iterable<T> | null | undefined
  // eslint-disable-next-line pickier/no-unused-vars
  }
  else if (children === undefined) {
    // eslint-disable-next-line pickier/no-unused-vars
    children = objectChildren as unknown as (d: T) => Iterable<T> | null | undefined
  }

  const root = new HierarchyNode<T>(data)
  let node: HierarchyNode<T> | undefined
  const nodes: HierarchyNode<T>[] = [root]
  let child: HierarchyNode<T>
  let childs: T[] | null
  let i: number
  let n: number

  while (node = nodes.pop()) {
    const result = children!(node.data)
    if (result && (childs = Array.from(result as Iterable<T>)) && (n = childs.length)) {
      node.children = new Array(n)
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = node.children[i] = new HierarchyNode<T>(childs[i]))
        child.parent = node
        child.depth = node.depth + 1
      }
    }
  }

  // eslint-disable-next-line pickier/no-unused-vars
  return root.eachBefore(computeHeight as (node: HierarchyNode<T>) => void)
}
