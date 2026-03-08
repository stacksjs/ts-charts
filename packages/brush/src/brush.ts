import { dispatch } from '@ts-charts/dispatch'
import { dragDisable, dragEnable } from '@ts-charts/drag'
import { interpolate } from '@ts-charts/interpolate'
import { pointer, select } from '@ts-charts/selection'
import { interrupt } from '@ts-charts/transition'
import constant from './constant.ts'
import BrushEvent from './event.ts'
import noevent, { nopropagation } from './noevent.ts'

const MODE_DRAG = { name: 'drag' }
const MODE_SPACE = { name: 'space' }
const MODE_HANDLE = { name: 'handle' }
const MODE_CENTER = { name: 'center' }

const { abs, max, min } = Math

function number1(e: any): [number, number] {
  return [+e[0], +e[1]]
}

function number2(e: any): [[number, number], [number, number]] {
  return [number1(e[0]), number1(e[1])]
}

interface DimType {
  type: string
}

interface BrushDim {
  name: string
  handles: DimType[]
  input: (val: any, extent?: any) => any
  output: (xy: any) => any
}

const X: BrushDim = {
  name: 'x',
  handles: ['w', 'e'].map(type),
  input(x: any, e: any): any { return x == null ? null : [[+x[0], e[0][1]], [+x[1], e[1][1]]] },
  output(xy: any): any { return xy && [xy[0][0], xy[1][0]] },
}

const Y: BrushDim = {
  name: 'y',
  handles: ['n', 's'].map(type),
  input(y: any, e: any): any { return y == null ? null : [[e[0][0], +y[0]], [e[1][0], +y[1]]] },
  output(xy: any): any { return xy && [xy[0][1], xy[1][1]] },
}

const XY: BrushDim = {
  name: 'xy',
  handles: ['n', 'w', 'e', 's', 'nw', 'ne', 'sw', 'se'].map(type),
  input(xy: any): any { return xy == null ? null : number2(xy) },
  output(xy: any): any { return xy },
}

const cursors: Record<string, string> = {
  overlay: 'crosshair',
  selection: 'move',
  n: 'ns-resize',
  e: 'ew-resize',
  s: 'ns-resize',
  w: 'ew-resize',
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
}

const flipX: Record<string, string> = {
  e: 'w',
  w: 'e',
  nw: 'ne',
  ne: 'nw',
  se: 'sw',
  sw: 'se',
}

const flipY: Record<string, string> = {
  n: 's',
  s: 'n',
  nw: 'sw',
  ne: 'se',
  se: 'ne',
  sw: 'nw',
}

const signsX: Record<string, number | null> = {
  overlay: +1,
  selection: +1,
  n: null,
  e: +1,
  s: null,
  w: -1,
  nw: -1,
  ne: +1,
  se: +1,
  sw: -1,
}

const signsY: Record<string, number | null> = {
  overlay: +1,
  selection: +1,
  n: -1,
  e: null,
  s: +1,
  w: null,
  nw: -1,
  ne: -1,
  se: +1,
  sw: +1,
}

function type(t: string): DimType {
  return { type: t }
}

// Ignore right-click, since that should open the context menu.
function defaultFilter(event: MouseEvent): boolean {
  return !event.ctrlKey && !event.button
}

function defaultExtent(this: any): [[number, number], [number, number]] {
  let svg = this.ownerSVGElement || this
  if (svg.hasAttribute('viewBox')) {
    svg = svg.viewBox.baseVal
    return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]]
  }
  return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]]
}

function defaultTouchable(this: Element): boolean {
  return !!(navigator.maxTouchPoints || ('ontouchstart' in this))
}

// Like d3.local, but with the name "__brush" rather than auto-generated.
function local(node: any): any {
  while (!node.__brush) if (!(node = node.parentNode)) return
  return node.__brush
}

function empty(extent: any): boolean {
  return extent[0][0] === extent[1][0]
    || extent[0][1] === extent[1][1]
}

export function brushSelection(node: any): any {
  const state = node.__brush
  return state ? state.dim.output(state.selection) : null
}

export function brushX(): any {
  return brush(X)
}

export function brushY(): any {
  return brush(Y)
}

export default function brushXY(): any {
  return brush(XY)
}

function brush(dim: BrushDim): any {
  let extent: any = defaultExtent
  let filter: any = defaultFilter
  let touchable: any = defaultTouchable
  let keys = true
  const listeners = dispatch('start', 'brush', 'end')
  let handleSize = 6
  let touchending: any

  function brush(group: any): void {
    let overlay = group
      .property('__brush', initialize)
      .selectAll('.overlay')
      .data([type('overlay')])

    overlay.enter().append('rect')
      .attr('class', 'overlay')
      .attr('pointer-events', 'all')
      .attr('cursor', cursors.overlay)
      .merge(overlay)
      .each(function (this: Element) {
        const extent = local(this).extent
        select(this)
          .attr('x', extent[0][0])
          .attr('y', extent[0][1])
          .attr('width', extent[1][0] - extent[0][0])
          .attr('height', extent[1][1] - extent[0][1])
      })

    group.selectAll('.selection')
      .data([type('selection')])
      .enter().append('rect')
      .attr('class', 'selection')
      .attr('cursor', cursors.selection)
      .attr('fill', '#777')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#fff')
      .attr('shape-rendering', 'crispEdges')

    let handle = group.selectAll('.handle')
      .data(dim.handles, (d: DimType) => d.type)

    handle.exit().remove()

    handle.enter().append('rect')
      .attr('class', (d: DimType) => 'handle handle--' + d.type)
      .attr('cursor', (d: DimType) => cursors[d.type])

    group
      .each(redraw)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mousedown.brush', started)
      .filter(touchable)
      .on('touchstart.brush', started)
      .on('touchmove.brush', touchmoved)
      .on('touchend.brush touchcancel.brush', touchended)
      .style('touch-action', 'none')
      .style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)')
  }

  brush.move = function (group: any, selection: any, event?: any): void {
    if (group.tween) {
      group
        .on('start.brush', function (this: any, event: any) { emitter(this, arguments).beforestart().start(event) })
        .on('interrupt.brush end.brush', function (this: any, event: any) { emitter(this, arguments).end(event) })
        .tween('brush', function (this: any) {
          const that = this
          const state = that.__brush
          const emit = emitter(that, arguments)
          const selection0 = state.selection
          const selection1 = dim.input(typeof selection === 'function' ? selection.apply(this, arguments) : selection, state.extent)
          const i = interpolate(selection0, selection1)

          function tween(t: number): any {
            state.selection = t === 1 && selection1 === null ? null : i(t)
            redraw.call(that)
            emit.brush()
          }

          return selection0 !== null && selection1 !== null ? tween : tween(1)
        })
    } else {
      group
        .each(function (this: any) {
          const that = this
          const args = arguments
          const state = that.__brush
          const selection1 = dim.input(typeof selection === 'function' ? selection.apply(that, args) : selection, state.extent)
          const emit = emitter(that, args).beforestart()

          interrupt(that)
          state.selection = selection1 === null ? null : selection1
          redraw.call(that)
          emit.start(event).brush(event).end(event)
        })
    }
  }

  brush.clear = function (group: any, event?: any): void {
    brush.move(group, null, event)
  }

  function redraw(this: Element): void {
    const group = select(this)
    const selection = local(this).selection

    if (selection) {
      group.selectAll('.selection')
        .style('display', null)
        .attr('x', selection[0][0])
        .attr('y', selection[0][1])
        .attr('width', selection[1][0] - selection[0][0])
        .attr('height', selection[1][1] - selection[0][1])

      group.selectAll('.handle')
        .style('display', null)
        .attr('x', (d: any) => d.type[d.type.length - 1] === 'e' ? selection[1][0] - handleSize / 2 : selection[0][0] - handleSize / 2)
        .attr('y', (d: any) => d.type[0] === 's' ? selection[1][1] - handleSize / 2 : selection[0][1] - handleSize / 2)
        .attr('width', (d: any) => d.type === 'n' || d.type === 's' ? selection[1][0] - selection[0][0] + handleSize : handleSize)
        .attr('height', (d: any) => d.type === 'e' || d.type === 'w' ? selection[1][1] - selection[0][1] + handleSize : handleSize)
    }
    else {
      group.selectAll('.selection,.handle')
        .style('display', 'none')
        .attr('x', null)
        .attr('y', null)
        .attr('width', null)
        .attr('height', null)
    }
  }

  function emitter(that: any, args: any, clean?: boolean): any {
    const emit = that.__brush.emitter
    return emit && (!clean || !emit.clean) ? emit : new (Emitter as any)(that, args, clean)
  }

  function Emitter(this: any, that: any, args: any, clean?: boolean): void {
    this.that = that
    this.args = args
    this.state = that.__brush
    this.active = 0
    this.clean = clean
  }

  Emitter.prototype = {
    beforestart(this: any): any {
      if (++this.active === 1) this.state.emitter = this, this.starting = true
      return this
    },
    start(this: any, event: any, mode?: any): any {
      if (this.starting) this.starting = false, this.emit('start', event, mode)
      else this.emit('brush', event)
      return this
    },
    brush(this: any, event: any, mode?: any): any {
      this.emit('brush', event, mode)
      return this
    },
    end(this: any, event: any, mode?: any): any {
      if (--this.active === 0) delete this.state.emitter, this.emit('end', event, mode)
      return this
    },
    emit(this: any, type: string, event: any, mode?: any): void {
      const d = select(this.that).datum()
      listeners.call(
        type,
        this.that,
        new (BrushEvent as any)(type, {
          sourceEvent: event,
          target: brush,
          selection: dim.output(this.state.selection),
          mode,
          dispatch: listeners,
        }),
        d,
      )
    },
  }

  function started(this: any, event: any): void {
    if (touchending && !event.touches) return
    if (!filter.apply(this, arguments)) return

    const that = this
    let type = event.target.__data__.type
    let mode: any = (keys && event.metaKey ? type = 'overlay' : type) === 'selection' ? MODE_DRAG : (keys && event.altKey ? MODE_CENTER : MODE_HANDLE)
    let signX: any = dim === Y ? null : signsX[type]
    let signY: any = dim === X ? null : signsY[type]
    const state = local(that)
    const extent = state.extent
    let selection = state.selection
    const W = extent[0][0]
    let w0: any, w1: any
    const N = extent[0][1]
    let n0: any, n1: any
    const E = extent[1][0]
    let e0: any, e1: any
    const S = extent[1][1]
    let s0: any, s1: any
    let dx = 0
    let dy = 0
    let moving: any
    let shifting = signX && signY && keys && event.shiftKey
    let lockX: any
    let lockY: any
    const points: any[] = Array.from(event.touches || [event], (t: any) => {
      const i = t.identifier
      t = pointer(t, that)
      t.point0 = t.slice()
      t.identifier = i
      return t
    })

    interrupt(that)
    const emit = emitter(that, arguments, true).beforestart()

    if (type === 'overlay') {
      if (selection) moving = true
      const pts = [points[0], points[1] || points[0]]
      state.selection = selection = [[
        w0 = dim === Y ? W : min(pts[0][0], pts[1][0]),
        n0 = dim === X ? N : min(pts[0][1], pts[1][1]),
      ], [
        e0 = dim === Y ? E : max(pts[0][0], pts[1][0]),
        s0 = dim === X ? S : max(pts[0][1], pts[1][1]),
      ]]
      if (points.length > 1) move(event)
    } else {
      w0 = selection[0][0]
      n0 = selection[0][1]
      e0 = selection[1][0]
      s0 = selection[1][1]
    }

    w1 = w0
    n1 = n0
    e1 = e0
    s1 = s0

    const group = select(that)
      .attr('pointer-events', 'none')

    const overlay = group.selectAll('.overlay')
      .attr('cursor', cursors[type])

    let view: any
    if (event.touches) {
      emit.moved = moved
      emit.ended = ended
    } else {
      view = select(event.view)
        .on('mousemove.brush', moved, true)
        .on('mouseup.brush', ended, true)
      if (keys) view
        .on('keydown.brush', keydowned, true)
        .on('keyup.brush', keyupped, true)

      dragDisable(event.view)
    }

    redraw.call(that)
    emit.start(event, mode.name)

    function moved(event: any): void {
      for (const p of event.changedTouches || [event]) {
        for (const d of points)
          if (d.identifier === p.identifier) d.cur = pointer(p, that)
      }
      if (shifting && !lockX && !lockY && points.length === 1) {
        const point = points[0]
        if (abs(point.cur[0] - point[0]) > abs(point.cur[1] - point[1]))
          lockY = true
        else
          lockX = true
      }
      for (const point of points)
        if (point.cur) point[0] = point.cur[0], point[1] = point.cur[1]
      moving = true
      noevent(event)
      move(event)
    }

    function move(event: any): void {
      const point = points[0], point0 = point.point0
      let t: any

      dx = point[0] - point0[0]
      dy = point[1] - point0[1]

      switch (mode) {
        case MODE_SPACE:
        case MODE_DRAG: {
          if (signX) dx = max(W - w0, min(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx
          if (signY) dy = max(N - n0, min(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy
          break
        }
        case MODE_HANDLE: {
          if (points[1]) {
            if (signX) w1 = max(W, min(E, points[0][0])), e1 = max(W, min(E, points[1][0])), signX = 1
            if (signY) n1 = max(N, min(S, points[0][1])), s1 = max(N, min(S, points[1][1])), signY = 1
          } else {
            if (signX < 0) dx = max(W - w0, min(E - w0, dx)), w1 = w0 + dx, e1 = e0
            else if (signX > 0) dx = max(W - e0, min(E - e0, dx)), w1 = w0, e1 = e0 + dx
            if (signY < 0) dy = max(N - n0, min(S - n0, dy)), n1 = n0 + dy, s1 = s0
            else if (signY > 0) dy = max(N - s0, min(S - s0, dy)), n1 = n0, s1 = s0 + dy
          }
          break
        }
        case MODE_CENTER: {
          if (signX) w1 = max(W, min(E, w0 - dx * signX)), e1 = max(W, min(E, e0 + dx * signX))
          if (signY) n1 = max(N, min(S, n0 - dy * signY)), s1 = max(N, min(S, s0 + dy * signY))
          break
        }
      }

      if (e1 < w1) {
        signX *= -1
        t = w0, w0 = e0, e0 = t
        t = w1, w1 = e1, e1 = t
        if (type in flipX) overlay.attr('cursor', cursors[type = flipX[type]])
      }

      if (s1 < n1) {
        signY *= -1
        t = n0, n0 = s0, s0 = t
        t = n1, n1 = s1, s1 = t
        if (type in flipY) overlay.attr('cursor', cursors[type = flipY[type]])
      }

      if (state.selection) selection = state.selection // May be set by brush.move!
      if (lockX) w1 = selection[0][0], e1 = selection[1][0]
      if (lockY) n1 = selection[0][1], s1 = selection[1][1]

      if (selection[0][0] !== w1
        || selection[0][1] !== n1
        || selection[1][0] !== e1
        || selection[1][1] !== s1) {
        state.selection = [[w1, n1], [e1, s1]]
        redraw.call(that)
        emit.brush(event, mode.name)
      }
    }

    function ended(event: any): void {
      nopropagation(event)
      if (event.touches) {
        if (event.touches.length) return
        if (touchending) clearTimeout(touchending)
        touchending = setTimeout(() => { touchending = null }, 500) // Ghost clicks are delayed!
      } else {
        dragEnable(event.view, moving)
        view.on('keydown.brush keyup.brush mousemove.brush mouseup.brush', null)
      }
      group.attr('pointer-events', 'all')
      overlay.attr('cursor', cursors.overlay)
      if (state.selection) selection = state.selection // May be set by brush.move (on start)!
      if (empty(selection)) state.selection = null, redraw.call(that)
      emit.end(event, mode.name)
    }

    function keydowned(event: KeyboardEvent): void {
      switch (event.keyCode) {
        case 16: { // SHIFT
          shifting = signX && signY
          break
        }
        case 18: { // ALT
          if (mode === MODE_HANDLE) {
            if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX
            if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY
            mode = MODE_CENTER
            move(event)
          }
          break
        }
        case 32: { // SPACE; takes priority over ALT
          if (mode === MODE_HANDLE || mode === MODE_CENTER) {
            if (signX < 0) e0 = e1 - dx; else if (signX > 0) w0 = w1 - dx
            if (signY < 0) s0 = s1 - dy; else if (signY > 0) n0 = n1 - dy
            mode = MODE_SPACE
            overlay.attr('cursor', cursors.selection)
            move(event)
          }
          break
        }
        default: return
      }
      noevent(event)
    }

    function keyupped(event: KeyboardEvent): void {
      switch (event.keyCode) {
        case 16: { // SHIFT
          if (shifting) {
            lockX = lockY = shifting = false
            move(event)
          }
          break
        }
        case 18: { // ALT
          if (mode === MODE_CENTER) {
            if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1
            if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1
            mode = MODE_HANDLE
            move(event)
          }
          break
        }
        case 32: { // SPACE
          if (mode === MODE_SPACE) {
            if (event.altKey) {
              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX
              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY
              mode = MODE_CENTER
            } else {
              if (signX < 0) e0 = e1; else if (signX > 0) w0 = w1
              if (signY < 0) s0 = s1; else if (signY > 0) n0 = n1
              mode = MODE_HANDLE
            }
            overlay.attr('cursor', cursors[type])
            move(event)
          }
          break
        }
        default: return
      }
      noevent(event)
    }
  }

  function touchmoved(this: Element, event: any): void {
    emitter(this, arguments).moved(event)
  }

  function touchended(this: Element, event: any): void {
    emitter(this, arguments).ended(event)
  }

  function initialize(this: any): any {
    const state = this.__brush || { selection: null }
    state.extent = number2(extent.apply(this, arguments))
    state.dim = dim
    return state
  }

  brush.extent = function (_?: any): any {
    return arguments.length ? (extent = typeof _ === 'function' ? _ : constant(number2(_)), brush) : extent
  }

  brush.filter = function (_?: any): any {
    return arguments.length ? (filter = typeof _ === 'function' ? _ : constant(!!_), brush) : filter
  }

  brush.touchable = function (_?: any): any {
    return arguments.length ? (touchable = typeof _ === 'function' ? _ : constant(!!_), brush) : touchable
  }

  brush.handleSize = function (_?: number): any {
    return arguments.length ? (handleSize = +_!, brush) : handleSize
  }

  brush.keyModifiers = function (_?: boolean): any {
    return arguments.length ? (keys = !!_, brush) : keys
  }

  brush.on = function (..._args: any[]): any {
    const value = listeners.on.apply(listeners, arguments as any)
    return value === listeners ? brush : value
  }

  return brush
}
