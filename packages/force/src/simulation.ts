import { dispatch } from '@ts-charts/dispatch'
import { timer } from '@ts-charts/timer'
import lcg from './lcg.ts'
import type { ForceNode } from './center.ts'

export function x(d: ForceNode): number {
  return d.x!
}

export function y(d: ForceNode): number {
  return d.y!
}

const initialRadius = 10
const initialAngle = Math.PI * (3 - Math.sqrt(5))

export interface Simulation {
  tick(iterations?: number): Simulation
  restart(): Simulation
  stop(): Simulation
  nodes(): ForceNode[]
  nodes(_: ForceNode[]): Simulation
  alpha(): number
  alpha(_: number): Simulation
  alphaMin(): number
  alphaMin(_: number): Simulation
  alphaDecay(): number
  alphaDecay(_: number): Simulation
  alphaTarget(): number
  alphaTarget(_: number): Simulation
  velocityDecay(): number
  velocityDecay(_: number): Simulation
  randomSource(): () => number
  randomSource(_: () => number): Simulation
  force(name: string): any
  force(name: string, _: any): Simulation
  find(x: number, y: number, radius?: number): ForceNode | undefined
  on(name: string): any
  on(name: string, _: any): Simulation
}

export default function forceSimulation(nodes?: ForceNode[]): Simulation {
  let simulation: Simulation
  let alpha = 1
  let alphaMin = 0.001
  let alphaDecay = 1 - Math.pow(alphaMin, 1 / 300)
  let alphaTarget = 0
  let velocityDecay = 0.6
  const forces = new Map<string, any>()
  const stepper = timer(step)
  const event = dispatch('tick', 'end')
  let random = lcg()

  if (nodes == null) nodes = []

  function step(): void {
    tick()
    event.call('tick', simulation)
    if (alpha < alphaMin) {
      stepper.stop()
      event.call('end', simulation)
    }
  }

  function tick(iterations?: number): Simulation {
    let i: number
    const n = nodes!.length
    let node: ForceNode

    if (iterations === undefined) iterations = 1

    for (let k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay

      forces.forEach(function (force: any) {
        force(alpha)
      })

      for (i = 0; i < n; ++i) {
        node = nodes![i]
        if (node.fx == null) node.x! += node.vx! *= velocityDecay
        else node.x = node.fx, node.vx = 0
        if (node.fy == null) node.y! += node.vy! *= velocityDecay
        else node.y = node.fy, node.vy = 0
      }
    }

    return simulation
  }

  function initializeNodes(): void {
    for (let i = 0, n = nodes!.length, node: ForceNode; i < n; ++i) {
      node = nodes![i]
      node.index = i
      if (node.fx != null) node.x = node.fx
      if (node.fy != null) node.y = node.fy
      if (isNaN(node.x as number) || isNaN(node.y as number)) {
        const radius = initialRadius * Math.sqrt(0.5 + i)
        const angle = i * initialAngle
        node.x = radius * Math.cos(angle)
        node.y = radius * Math.sin(angle)
      }
      if (isNaN(node.vx as number) || isNaN(node.vy as number)) {
        node.vx = node.vy = 0
      }
    }
  }

  function initializeForce(force: any): any {
    if (force.initialize) force.initialize(nodes, random)
    return force
  }

  initializeNodes()

  return simulation = {
    tick: tick,

    restart: function (): Simulation {
      return stepper.restart(step), simulation
    },

    stop: function (): Simulation {
      return stepper.stop(), simulation
    },

    nodes: function (_?: ForceNode[]): any {
      return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes
    },

    alpha: function (_?: number): any {
      return arguments.length ? (alpha = +_!, simulation) : alpha
    },

    alphaMin: function (_?: number): any {
      return arguments.length ? (alphaMin = +_!, simulation) : alphaMin
    },

    alphaDecay: function (_?: number): any {
      return arguments.length ? (alphaDecay = +_!, simulation) : +alphaDecay
    },

    alphaTarget: function (_?: number): any {
      return arguments.length ? (alphaTarget = +_!, simulation) : alphaTarget
    },

    velocityDecay: function (_?: number): any {
      return arguments.length ? (velocityDecay = 1 - _!, simulation) : 1 - velocityDecay
    },

    randomSource: function (_?: () => number): any {
      return arguments.length ? (random = _!, forces.forEach(initializeForce), simulation) : random
    },

    force: function (name: string, _?: any): any {
      return arguments.length > 1 ? ((_ == null ? forces.delete(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name)
    },

    find: function (x: number, y: number, radius?: number): ForceNode | undefined {
      let i = 0
      const n = nodes!.length
      let dx: number
      let dy: number
      let d2: number
      let node: ForceNode
      let closest: ForceNode | undefined

      if (radius == null) radius = Infinity
      else radius *= radius

      for (i = 0; i < n; ++i) {
        node = nodes![i]
        dx = x - node.x!
        dy = y - node.y!
        d2 = dx * dx + dy * dy
        if (d2 < radius!) closest = node, radius = d2
      }

      return closest
    },

    on: function (name: string, _?: any): any {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name)
    }
  }
}
