import identity from './identity.ts'

const top = 1
const right = 2
const bottom = 3
const left = 4
const epsilon = 1e-6

function translateX(x: number): string {
  return 'translate(' + x + ',0)'
}

function translateY(y: number): string {
  return 'translate(0,' + y + ')'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- scale call signatures vary widely (number, string, Date, etc.)
export interface AxisScale {
  (d: any): number
  bandwidth?(): number
  round?(): boolean
  ticks?(...args: unknown[]): unknown[]
  tickFormat?(...args: unknown[]): (d: unknown) => string
  domain(): unknown[]
  range(): number[]
  copy?(): AxisScale
}

function number(scale: AxisScale, _offset: number): (d: unknown) => number {
  return (d: unknown): number => +scale(d)
}

function center(scale: AxisScale, offset: number): (d: unknown) => number {
  offset = Math.max(0, scale.bandwidth!() - offset * 2) / 2
  if (scale.round!()) offset = Math.round(offset)
  return (d: unknown): number => +scale(d) + offset
}

function entering(this: Element & { __axis?: unknown }): boolean {
  return !this.__axis
}

export interface Axis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 selection/transition context
  (context: any): void
  scale(): AxisScale
  scale(_: AxisScale): Axis
  ticks(...args: unknown[]): Axis
  tickArguments(): unknown[]
  tickArguments(_: unknown[] | null): Axis
  tickValues(): unknown[] | null
  tickValues(_: Iterable<unknown> | null): Axis
  tickFormat(): ((d: unknown) => string) | null
  tickFormat(_: ((d: unknown) => string) | null): Axis
  tickSize(): number
  tickSize(_: number): Axis
  tickSizeInner(): number
  tickSizeInner(_: number): Axis
  tickSizeOuter(): number
  tickSizeOuter(_: number): Axis
  tickPadding(): number
  tickPadding(_: number): Axis
  offset(): number
  offset(_: number): Axis
}

function axis(orient: number, scale: AxisScale): Axis {
  let tickArguments: unknown[] = []
  let tickValues: unknown[] | null = null
  let tickFormat: ((d: unknown) => string) | null = null
  let tickSizeInner = 6
  let tickSizeOuter = 6
  let tickPadding = 3
  let offset = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5
  const k = orient === top || orient === left ? -1 : 1
  const x = orient === left || orient === right ? 'x' : 'y'
  const transform = orient === top || orient === bottom ? translateX : translateY

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- D3 selection/transition context
  function axis(context: any): void {
    const values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues
    const format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat
    const spacing = Math.max(tickSizeInner, 0) + tickPadding
    const range = scale.range()
    const range0 = +range[0] + offset
    const range1 = +range[range.length - 1] + offset
    const position = (scale.bandwidth ? center : number)(scale.copy ? scale.copy() : scale, offset)
    const selection = context.selection ? context.selection() : context
    let path = selection.selectAll('.domain').data([null])
    let tick = selection.selectAll('.tick').data(values, scale).order()
    let tickExit = tick.exit()
    let tickEnter = tick.enter().append('g').attr('class', 'tick')
    let line = tick.select('line')
    let text = tick.select('text')

    path = path.merge(path.enter().insert('path', '.tick')
      .attr('class', 'domain')
      .attr('stroke', 'currentColor'))

    tick = tick.merge(tickEnter)

    line = line.merge(tickEnter.append('line')
      .attr('stroke', 'currentColor')
      .attr(x + '2', k * tickSizeInner))

    text = text.merge(tickEnter.append('text')
      .attr('fill', 'currentColor')
      .attr(x, k * spacing)
      .attr('dy', orient === top ? '0em' : orient === bottom ? '0.71em' : '0.32em'))

    if (context !== selection) {
      path = path.transition(context)
      tick = tick.transition(context)
      line = line.transition(context)
      text = text.transition(context)

      tickExit = tickExit.transition(context)
        .attr('opacity', epsilon)
        .attr('transform', function (this: Element, d: unknown) { let pos = +position(d); return isFinite(pos) ? transform(pos + offset) : (this as Element).getAttribute('transform') })

      tickEnter
        .attr('opacity', epsilon)
        .attr('transform', function (this: Element & { parentNode: Element & { __axis?: (d: unknown) => number } }, d: unknown) { let p: number | undefined = (this.parentNode as Element & { __axis?: (d: unknown) => number }).__axis?.(d); return transform(((p !== undefined && isFinite(p)) ? p : position(d)) + offset) })
    }

    tickExit.remove()

    path
      .attr('d', orient === left || orient === right
        ? (tickSizeOuter ? 'M' + k * tickSizeOuter + ',' + range0 + 'H' + offset + 'V' + range1 + 'H' + k * tickSizeOuter : 'M' + offset + ',' + range0 + 'V' + range1)
        : (tickSizeOuter ? 'M' + range0 + ',' + k * tickSizeOuter + 'V' + offset + 'H' + range1 + 'V' + k * tickSizeOuter : 'M' + range0 + ',' + offset + 'H' + range1))

    tick
      .attr('opacity', 1)
      .attr('transform', (d: unknown) => transform(position(d) + offset))

    line
      .attr(x + '2', k * tickSizeInner)

    text
      .attr(x, k * spacing)
      .text(format)

    selection.filter(entering)
      .attr('fill', 'none')
      .attr('font-size', 10)
      .attr('font-family', 'sans-serif')
      .attr('text-anchor', orient === right ? 'start' : orient === left ? 'end' : 'middle')

    selection
      .each(function (this: Element & { __axis?: unknown }) { this.__axis = position })
  }

  axis.scale = function (_?: AxisScale): AxisScale | Axis {
    return arguments.length ? (scale = _!, axis as unknown as Axis) : scale
  }

  axis.ticks = function (...args: unknown[]): Axis {
    tickArguments = Array.from(args)
    return axis as unknown as Axis
  }

  axis.tickArguments = function (_?: unknown[] | null): unknown[] | Axis {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis as unknown as Axis) : tickArguments.slice()
  }

  axis.tickValues = function (_?: Iterable<unknown> | null): unknown[] | null | Axis {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis as unknown as Axis) : tickValues && tickValues.slice()
  }

  axis.tickFormat = function (_?: ((d: unknown) => string) | null): ((d: unknown) => string) | null | Axis {
    return arguments.length ? (tickFormat = _!, axis as unknown as Axis) : tickFormat
  }

  axis.tickSize = function (_?: number): number | Axis {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_!, axis as unknown as Axis) : tickSizeInner
  }

  axis.tickSizeInner = function (_?: number): number | Axis {
    return arguments.length ? (tickSizeInner = +_!, axis as unknown as Axis) : tickSizeInner
  }

  axis.tickSizeOuter = function (_?: number): number | Axis {
    return arguments.length ? (tickSizeOuter = +_!, axis as unknown as Axis) : tickSizeOuter
  }

  axis.tickPadding = function (_?: number): number | Axis {
    return arguments.length ? (tickPadding = +_!, axis as unknown as Axis) : tickPadding
  }

  axis.offset = function (_?: number): number | Axis {
    return arguments.length ? (offset = +_!, axis as unknown as Axis) : offset
  }

  return axis as unknown as Axis
}

export function axisTop(scale: AxisScale): Axis {
  return axis(top, scale)
}

export function axisRight(scale: AxisScale): Axis {
  return axis(right, scale)
}

export function axisBottom(scale: AxisScale): Axis {
  return axis(bottom, scale)
}

export function axisLeft(scale: AxisScale): Axis {
  return axis(left, scale)
}
