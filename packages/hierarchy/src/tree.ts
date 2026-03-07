import { HierarchyNode } from './hierarchy/index.ts'

function defaultSeparation<T>(a: HierarchyNode<T>, b: HierarchyNode<T>): number {
  return a.parent === b.parent ? 1 : 2
}

function nextLeft(v: TreeNode): TreeNode | null {
  const children = v.children
  return children ? children[0] : v.t
}

function nextRight(v: TreeNode): TreeNode | null {
  const children = v.children
  return children ? children[children.length - 1] : v.t
}

function moveSubtree(wm: TreeNode, wp: TreeNode, shift: number): void {
  const change = shift / (wp.i - wm.i)
  wp.c -= change
  wp.s += shift
  wm.c += change
  wp.z += shift
  wp.m += shift
}

function executeShifts(v: TreeNode): void {
  let shift = 0
  let change = 0
  const children = v.children!
  let i = children.length
  let w: TreeNode
  while (--i >= 0) {
    w = children[i]
    w.z += shift
    w.m += shift
    shift += w.s + (change += w.c)
  }
}

function nextAncestor(vim: TreeNode, v: TreeNode, ancestor: TreeNode): TreeNode {
  return vim.a.parent === v.parent ? vim.a : ancestor
}

class TreeNode {
  _: HierarchyNode<any>
  parent: TreeNode | null
  children: TreeNode[] | null
  A: TreeNode | null // default ancestor
  a: TreeNode // ancestor
  z: number // prelim
  m: number // mod
  c: number // change
  s: number // shift
  t: TreeNode | null // thread
  i: number // number

  constructor(node: HierarchyNode<any>, i: number) {
    this._ = node
    this.parent = null
    this.children = null
    this.A = null
    this.a = this
    this.z = 0
    this.m = 0
    this.c = 0
    this.s = 0
    this.t = null
    this.i = i
  }

  // Mirror the HierarchyNode iteration methods needed by the tree layout
  eachAfter(callback: (node: TreeNode) => void): this {
    let node: TreeNode | undefined = this as TreeNode
    const nodes: TreeNode[] = [node]
    const next: TreeNode[] = []
    let children: TreeNode[] | null
    let i: number
    let n: number
    while (node = nodes.pop()) {
      next.push(node)
      if (children = node.children) {
        for (i = 0, n = children.length; i < n; ++i) {
          nodes.push(children[i])
        }
      }
    }
    while (node = next.pop()) {
      callback(node)
    }
    return this
  }

  eachBefore(callback: (node: TreeNode) => void): this {
    let node: TreeNode | undefined = this as TreeNode
    const nodes: TreeNode[] = [node]
    let children: TreeNode[] | null
    let i: number
    while (node = nodes.pop()) {
      callback(node)
      if (children = node.children) {
        for (i = children.length - 1; i >= 0; --i) {
          nodes.push(children[i])
        }
      }
    }
    return this
  }
}

function treeRoot(root: HierarchyNode<any>): TreeNode {
  const tree = new TreeNode(root, 0)
  let node: TreeNode | undefined
  const nodes: TreeNode[] = [tree]
  let child: TreeNode
  let children: HierarchyNode<any>[] | undefined
  let i: number
  let n: number

  while (node = nodes.pop()) {
    if (children = node._.children) {
      node.children = new Array(n = children.length)
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = node.children[i] = new TreeNode(children[i], i))
        child.parent = node
      }
    }
  }

  ;(tree.parent = new TreeNode(null as any, 0)).children = [tree]
  return tree
}

export interface TreeLayout<T> {
  (root: HierarchyNode<T>): HierarchyNode<T>
  separation(): (a: HierarchyNode<T>, b: HierarchyNode<T>) => number
  separation(separation: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number): TreeLayout<T>
  size(): [number, number] | null
  size(size: [number, number]): TreeLayout<T>
  nodeSize(): [number, number] | null
  nodeSize(size: [number, number]): TreeLayout<T>
}

// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
export default function tree<T>(): TreeLayout<T> {
  let separation: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number = defaultSeparation
  let dx = 1
  let dy = 1
  let nodeSize: boolean | null = null

  function tree(root: HierarchyNode<T>): HierarchyNode<T> {
    const t = treeRoot(root)

    // Compute the layout using Buchheim et al.'s algorithm.
    t.eachAfter(firstWalk)
    t.parent!.m = -t.z
    t.eachBefore(secondWalk)

    // If a fixed node size is specified, scale x and y.
    if (nodeSize) root.eachBefore(sizeNode)

    // If a fixed tree size is specified, scale x and y based on the extent.
    // Compute the left-most, right-most, and depth-most nodes for extents.
    else {
      let left = root
      let right = root
      let bottom = root
      root.eachBefore(function (node) {
        if (node.x! < left.x!) left = node
        if (node.x! > right.x!) right = node
        if (node.depth > bottom.depth) bottom = node
      })
      const s = left === right ? 1 : separation(left, right) / 2
      const tx = s - left.x!
      const kx = dx / (right.x! + s + tx)
      const ky = dy / (bottom.depth || 1)
      root.eachBefore(function (node) {
        node.x = (node.x! + tx) * kx
        node.y = node.depth * ky
      })
    }

    return root
  }

  function firstWalk(v: TreeNode): void {
    const children = v.children
    const siblings = v.parent!.children!
    const w: TreeNode | null = v.i ? siblings[v.i - 1] : null
    if (children) {
      executeShifts(v)
      const midpoint = (children[0].z + children[children.length - 1].z) / 2
      if (w) {
        v.z = w.z + separation(v._ as HierarchyNode<T>, w._ as HierarchyNode<T>)
        v.m = v.z - midpoint
      } else {
        v.z = midpoint
      }
    } else if (w) {
      v.z = w.z + separation(v._ as HierarchyNode<T>, w._ as HierarchyNode<T>)
    }
    v.parent!.A = apportion(v, w, v.parent!.A || siblings[0])
  }

  function secondWalk(v: TreeNode): void {
    v._.x = v.z + v.parent!.m
    v.m += v.parent!.m
  }

  function apportion(v: TreeNode, w: TreeNode | null, ancestor: TreeNode): TreeNode {
    if (w) {
      let vip: TreeNode | null = v
      let vop: TreeNode | null = v
      let vim: TreeNode | null = w
      let vom: TreeNode | null = vip.parent!.children![0]
      let sip = vip.m
      let sop = vop.m
      let sim = vim.m
      let som = vom!.m
      let shift: number
      // eslint-disable-next-line no-sequences
      while (vim = nextRight(vim!), vip = nextLeft(vip!), vim && vip) {
        vom = nextLeft(vom!)
        vop = nextRight(vop!)
        ;(vop as TreeNode).a = v
        shift = (vim as TreeNode).z + sim - (vip as TreeNode).z - sip + separation((vim as TreeNode)._ as HierarchyNode<T>, (vip as TreeNode)._ as HierarchyNode<T>)
        if (shift > 0) {
          moveSubtree(nextAncestor(vim as TreeNode, v, ancestor), v, shift)
          sip += shift
          sop += shift
        }
        sim += (vim as TreeNode).m
        sip += (vip as TreeNode).m
        som += (vom as TreeNode).m
        sop += (vop as TreeNode).m
      }
      if (vim && !nextRight(vop!)) {
        vop!.t = vim
        vop!.m += sim - sop
      }
      if (vip && !nextLeft(vom!)) {
        vom!.t = vip
        vom!.m += sip - som
        ancestor = v
      }
    }
    return ancestor
  }

  function sizeNode(node: HierarchyNode<T>): void {
    node.x = node.x! * dx
    node.y = node.depth * dy
  }

  tree.separation = function (x?: (a: HierarchyNode<T>, b: HierarchyNode<T>) => number): any {
    return arguments.length ? (separation = x!, tree) : separation
  }

  tree.size = function (x?: [number, number]): any {
    return arguments.length ? (nodeSize = false, dx = +x![0], dy = +x![1], tree) : (nodeSize ? null : [dx, dy])
  }

  tree.nodeSize = function (x?: [number, number]): any {
    return arguments.length ? (nodeSize = true, dx = +x![0], dy = +x![1], tree) : (nodeSize ? [dx, dy] : null)
  }

  return tree as TreeLayout<T>
}
