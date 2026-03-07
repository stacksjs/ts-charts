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

function number(scale: any, _offset: number): (d: any) => number {
  return (d: any): number => +scale(d)
}

function center(scale: any, offset: number): (d: any) => number {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2
  if (scale.round()) offset = Math.round(offset)
  return (d: any): number => +scale(d) + offset
}

function entering(this: any): boolean {
  return !this.__axis
}

export interface Axis {
  (context: any): void
  scale(): any
  scale(_: any): Axis
  ticks(...args: any[]): Axis
  tickArguments(): any[]
  tickArguments(_: any[] | null): Axis
  tickValues(): any[] | null
  tickValues(_: Iterable<any> | null): Axis
  tickFormat(): any
  tickFormat(_: any): Axis
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

function axis(orient: number, scale: any): Axis {
  let tickArguments: any[] = []
  let tickValues: any[] | null = null
  let tickFormat: any = null
  let tickSizeInner = 6
  let tickSizeOuter = 6
  let tickPadding = 3
  let offset = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5
  const k = orient === top || orient === left ? -1 : 1
  const x = orient === left || orient === right ? 'x' : 'y'
  const transform = orient === top || orient === bottom ? translateX : translateY

  function axis(context: any): void {
    const values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues
    const format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat
    const spacing = Math.max(tickSizeInner, 0) + tickPadding
    const range = scale.range()
    const range0 = +range[0] + offset
    const range1 = +range[range.length - 1] + offset
    const position = (scale.bandwidth ? center : number)(scale.copy(), offset)
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
        .attr('transform', function (this: any, d: any) { return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute('transform') })

      tickEnter
        .attr('opacity', epsilon)
        .attr('transform', function (this: any, d: any) { let p = this.parentNode.__axis; return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset) })
    }

    tickExit.remove()

    path
      .attr('d', orient === left || orient === right
        ? (tickSizeOuter ? 'M' + k * tickSizeOuter + ',' + range0 + 'H' + offset + 'V' + range1 + 'H' + k * tickSizeOuter : 'M' + offset + ',' + range0 + 'V' + range1)
        : (tickSizeOuter ? 'M' + range0 + ',' + k * tickSizeOuter + 'V' + offset + 'H' + range1 + 'V' + k * tickSizeOuter : 'M' + range0 + ',' + offset + 'H' + range1))

    tick
      .attr('opacity', 1)
      .attr('transform', (d: any) => transform(position(d) + offset))

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
      .each(function (this: any) { this.__axis = position })
  }

  axis.scale = function (_?: any): any {
    return arguments.length ? (scale = _, axis) : scale
  }

  axis.ticks = function (...args: any[]): Axis {
    tickArguments = Array.from(args)
    return axis as unknown as Axis
  }

  axis.tickArguments = function (_?: any[] | null): any {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice()
  }

  axis.tickValues = function (_?: Iterable<any> | null): any {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice()
  }

  axis.tickFormat = function (_?: any): any {
    return arguments.length ? (tickFormat = _, axis) : tickFormat
  }

  axis.tickSize = function (_?: number): any {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_!, axis) : tickSizeInner
  }

  axis.tickSizeInner = function (_?: number): any {
    return arguments.length ? (tickSizeInner = +_!, axis) : tickSizeInner
  }

  axis.tickSizeOuter = function (_?: number): any {
    return arguments.length ? (tickSizeOuter = +_!, axis) : tickSizeOuter
  }

  axis.tickPadding = function (_?: number): any {
    return arguments.length ? (tickPadding = +_!, axis) : tickPadding
  }

  axis.offset = function (_?: number): any {
    return arguments.length ? (offset = +_!, axis) : offset
  }

  return axis as unknown as Axis
}

export function axisTop(scale: any): Axis {
  return axis(top, scale)
}

export function axisRight(scale: any): Axis {
  return axis(right, scale)
}

export function axisBottom(scale: any): Axis {
  return axis(bottom, scale)
}

export function axisLeft(scale: any): Axis {
  return axis(left, scale)
}
