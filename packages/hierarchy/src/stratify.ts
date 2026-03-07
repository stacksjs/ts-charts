import { optional } from './accessors.ts'
import { HierarchyNode, computeHeight } from './hierarchy/index.ts'

interface PrerootLike {
  depth: number
}

const preroot: PrerootLike = { depth: -1 }
const ambiguous = {}
const imputed = {}

function defaultId(d: any): string {
  return d.id
}

function defaultParentId(d: any): string {
  return d.parentId
}

export interface StratifyLayout<T> {
  (data: Iterable<T>): HierarchyNode<T>
  id(): ((d: T, i: number, data: Iterable<T>) => string | null | undefined) | null
  id(id: (d: T, i: number, data: Iterable<T>) => string | null | undefined): StratifyLayout<T>
  parentId(): ((d: T, i: number, data: Iterable<T>) => string | null | undefined) | null
  parentId(parentId: (d: T, i: number, data: Iterable<T>) => string | null | undefined): StratifyLayout<T>
  path(): ((d: T, i: number, data: Iterable<T>) => string) | null
  path(path: (d: T, i: number, data: Iterable<T>) => string): StratifyLayout<T>
}

export default function stratify<T>(): StratifyLayout<T> {
  let id: any = defaultId
  let parentId: any = defaultParentId
  let path: any = null

  function stratify(data: Iterable<T>): HierarchyNode<T> {
    const nodes: any[] = Array.from(data)
    let currentId = id
    let currentParentId = parentId
    let n: number
    let d: any
    let i: number
    let root: HierarchyNode<T> | undefined
    let parent: any
    let node: any
    let nodeId: any
    let nodeKey: string
    const nodeByKey = new Map<string, any>()

    if (path != null) {
      const I = nodes.map((d: any, i: number) => normalize(path(d, i, data)))
      const P = I.map(parentof)
      const S = new Set(I).add('')
      for (const pi of P) {
        if (!S.has(pi)) {
          S.add(pi)
          I.push(pi)
          P.push(parentof(pi))
          nodes.push(imputed)
        }
      }
      currentId = (_: any, i: number) => I[i]
      currentParentId = (_: any, i: number) => P[i]
    }

    for (i = 0, n = nodes.length; i < n; ++i) {
      d = nodes[i]
      node = nodes[i] = new HierarchyNode(d)
      if ((nodeId = currentId(d, i, data)) != null && (nodeId += '')) {
        nodeKey = node.id = nodeId
        nodeByKey.set(nodeKey, nodeByKey.has(nodeKey) ? ambiguous : node)
      }
      if ((nodeId = currentParentId(d, i, data)) != null && (nodeId += '')) {
        node.parent = nodeId
      }
    }

    for (i = 0; i < n; ++i) {
      node = nodes[i]
      if (nodeId = node.parent) {
        parent = nodeByKey.get(nodeId)
        if (!parent) throw new Error('missing: ' + nodeId)
        if (parent === ambiguous) throw new Error('ambiguous: ' + nodeId)
        if (parent.children) parent.children.push(node)
        else parent.children = [node]
        node.parent = parent
      } else {
        if (root) throw new Error('multiple roots')
        root = node
      }
    }

    if (!root) throw new Error('no root')

    // When imputing internal nodes, only introduce roots if needed.
    // Then replace the imputed marker data with null.
    if (path != null) {
      while ((root as any).data === imputed && (root as any).children.length === 1) {
        root = (root as any).children[0]
        --n
      }
      for (let i = nodes.length - 1; i >= 0; --i) {
        node = nodes[i]
        if (node.data !== imputed) break
        node.data = null
      }
    }

    ;(root as any).parent = preroot
    root!.eachBefore(function (node: HierarchyNode<T>) { node.depth = (node.parent as any).depth + 1; --n }).eachBefore(computeHeight as any)
    ;(root as any).parent = null
    if (n > 0) throw new Error('cycle')

    return root!
  }

  stratify.id = function (x?: any): any {
    return arguments.length ? (id = optional(x), stratify) : id
  }

  stratify.parentId = function (x?: any): any {
    return arguments.length ? (parentId = optional(x), stratify) : parentId
  }

  stratify.path = function (x?: any): any {
    return arguments.length ? (path = optional(x), stratify) : path
  }

  return stratify as StratifyLayout<T>
}

// To normalize a path, we coerce to a string, strip the trailing slash if any
// (as long as the trailing slash is not immediately preceded by another slash),
// and add leading slash if missing.
function normalize(path: any): string {
  let p = `${path}`
  let i = p.length
  if (slash(p, i - 1) && !slash(p, i - 2)) p = p.slice(0, -1)
  return p[0] === '/' ? p : `/${p}`
}

// Walk backwards to find the first slash that is not the leading slash, e.g.:
// "/foo/bar" => "/foo", "/foo" => "/", "/" => "". (The root is special-cased
// because the id of the root must be a truthy value.)
function parentof(path: string): string {
  let i = path.length
  if (i < 2) return ''
  while (--i > 1) if (slash(path, i)) break
  return path.slice(0, i)
}

// Slashes can be escaped; to determine whether a slash is a path delimiter, we
// count the number of preceding backslashes escaping the forward slash: an odd
// number indicates an escaped forward slash.
function slash(path: string, i: number): boolean {
  if (path[i] === '/') {
    let k = 0
    while (i > 0 && path[--i] === '\\') ++k
    if ((k & 1) === 0) return true
  }
  return false
}
