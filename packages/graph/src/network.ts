import type { GraphData, GraphLayoutOptions, GraphLink, GraphNode } from './layout.ts'
import { drag } from '@ts-charts/drag'
import { select } from '@ts-charts/selection'
import { zoom } from '@ts-charts/zoom'
import { createGraphSimulation, graphLayout } from './layout.ts'

export interface NetworkGraphOptions extends GraphLayoutOptions {
  /** Run a live simulation with tick-driven updates; false renders a settled layout once. */
  animated?: boolean
  /** Allow dragging nodes (animated mode only). */
  draggable?: boolean
  /** Allow pan/zoom on the svg. */
  zoomable?: boolean
  nodeRadius?: number | ((node: GraphNode) => number)
  nodeFill?: string | ((node: GraphNode) => string)
  nodeStroke?: string
  nodeLabel?: (node: GraphNode) => string
  linkStroke?: string | ((link: GraphLink) => string)
  linkWidth?: number | ((link: GraphLink) => number)
  onNodeClick?: (node: GraphNode) => void
}

/** Handle returned by networkGraph().render() — owns the svg and simulation. */
export interface NetworkGraphHandle {
  svg: SVGSVGElement
  simulation: any
  stop: () => void
}

const palette = ['#4f8ef7', '#f76e4f', '#37b26c', '#b04ff7', '#f7b64f', '#4ff7e3', '#f74f9e', '#8ef74f']

const defaults = {
  animated: true,
  draggable: true,
  zoomable: true,
  nodeRadius: 8,
  nodeStroke: '#fff',
  linkStroke: '#9ca3af',
  linkWidth: 1.5,
}

function accessor<T, R>(value: R | ((d: T) => R)): (d: T) => R {
  return typeof value === 'function' ? value as (d: T) => R : () => value
}

function defaultFill(): (node: GraphNode) => string {
  const seen = new Map<string | number, string>()
  return (node: GraphNode): string => {
    const group = node.group ?? 0
    if (!seen.has(group))
      seen.set(group, palette[seen.size % palette.length])
    return seen.get(group)!
  }
}

/**
 * Render a force-directed node-link graph into `container`. Creates the svg,
 * wires drag/zoom behaviors, and either animates the simulation or draws a
 * pre-settled layout. Returns a handle for teardown.
 */
export function networkGraph(container: Element, data: GraphData, options: NetworkGraphOptions = {}): NetworkGraphHandle {
  const opts = { ...defaults, width: 800, height: 600, ...options }
  const radius = accessor(opts.nodeRadius)
  const fill = accessor(opts.nodeFill ?? defaultFill())
  const linkStroke = accessor(opts.linkStroke)
  const linkWidth = accessor(opts.linkWidth)

  // Collision defaults to node radius + breathing room unless overridden.
  const layoutOptions: GraphLayoutOptions = {
    ...opts,
    collideRadius: opts.collideRadius ?? ((d: any) => radius(d) + 2),
  }

  const svg = select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${opts.width} ${opts.height}`)
    .attr('width', opts.width)
    .attr('height', opts.height)

  const canvas = svg.append('g').attr('class', 'graph-canvas')

  const linkSel = canvas.append('g')
    .attr('class', 'graph-links')
    .selectAll('line')
    .data(data.links)
    .enter()
    .append('line')
    .attr('stroke', (d: any) => linkStroke(d))
    .attr('stroke-width', (d: any) => linkWidth(d))
    .attr('stroke-opacity', 0.6)

  const nodeSel = canvas.append('g')
    .attr('class', 'graph-nodes')
    .selectAll('circle')
    .data(data.nodes)
    .enter()
    .append('circle')
    .attr('r', (d: any) => radius(d))
    .attr('fill', (d: any) => fill(d))
    .attr('stroke', opts.nodeStroke)
    .attr('stroke-width', 1.5)

  const labelSel = opts.nodeLabel
    ? canvas.append('g')
        .attr('class', 'graph-labels')
        .selectAll('text')
        .data(data.nodes)
        .enter()
        .append('text')
        .attr('font-size', 10)
        .attr('dx', (d: any) => radius(d) + 3)
        .attr('dy', '0.35em')
        .text((d: any) => opts.nodeLabel!(d))
    : null

  if (opts.onNodeClick)
    nodeSel.on('click', (_event: Event, d: GraphNode) => opts.onNodeClick!(d))

  const position = (): void => {
    linkSel
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
    nodeSel
      .attr('cx', (d: any) => d.x!)
      .attr('cy', (d: any) => d.y!)
    labelSel
      ?.attr('x', (d: any) => d.x!)
      .attr('y', (d: any) => d.y!)
  }

  let simulation: any = null
  if (opts.animated) {
    simulation = createGraphSimulation(data, layoutOptions)
    simulation.on('tick', position).restart()

    if (opts.draggable) {
      nodeSel.call(drag()
        .on('start', (event: any, d: GraphNode) => {
          if (!event.active)
            simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: any, d: GraphNode) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: any, d: GraphNode) => {
          if (!event.active)
            simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }))
    }
  }
  else {
    graphLayout(data, layoutOptions)
    position()
  }

  if (opts.zoomable) {
    svg.call(zoom()
      .scaleExtent([0.25, 4])
      .on('zoom', (event: any) => canvas.attr('transform', event.transform)))
  }

  return {
    svg: svg.node() as SVGSVGElement,
    simulation,
    stop: (): void => {
      simulation?.stop()
    },
  }
}
