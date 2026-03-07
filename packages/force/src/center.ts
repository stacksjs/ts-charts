export interface ForceNode {
  index?: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
  [key: string]: any
}

export interface CenterForce {
  (alpha?: number): void
  initialize(_: ForceNode[]): void
  x(): number
  x(_: number): CenterForce
  y(): number
  y(_: number): CenterForce
  strength(): number
  strength(_: number): CenterForce
}

export default function forceCenter(x?: number | null, y?: number | null): CenterForce {
  let nodes: ForceNode[]
  let strength = 1

  if (x == null) x = 0
  if (y == null) y = 0

  function force(): void {
    let i: number
    const n = nodes.length
    let node: ForceNode
    let sx = 0
    let sy = 0

    for (i = 0; i < n; ++i) {
      node = nodes[i]
      sx += node.x!
      sy += node.y!
    }

    for (sx = (sx / n - (x as number)) * strength, sy = (sy / n - (y as number)) * strength, i = 0; i < n; ++i) {
      node = nodes[i]
      node.x! -= sx
      node.y! -= sy
    }
  }

  force.initialize = function (_: ForceNode[]): void {
    nodes = _
  }

  force.x = function (_?: number): any {
    return arguments.length ? (x = +_!, force) : x
  }

  force.y = function (_?: number): any {
    return arguments.length ? (y = +_!, force) : y
  }

  force.strength = function (_?: number): any {
    return arguments.length ? (strength = +_!, force) : strength
  }

  return force as CenterForce
}
