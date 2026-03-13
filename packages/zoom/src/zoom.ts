import { dispatch } from '@ts-charts/dispatch'
import { dragDisable, dragEnable } from '@ts-charts/drag'
import { interpolateZoom } from '@ts-charts/interpolate'
import { select, pointer } from '@ts-charts/selection'
import { interrupt } from '@ts-charts/transition'
import constant from './constant.ts'
import ZoomEvent from './event.ts'
import { Transform, identity, type TransformInstance } from './transform.ts'
import noevent, { nopropagation } from './noevent.ts'

// Ignore right-click, since that should open the context menu.
// except for pinch-to-zoom, which is sent as a wheel+ctrlKey event
function defaultFilter(event: MouseEvent | WheelEvent): boolean {
  return (!event.ctrlKey || event.type === 'wheel') && !(event as MouseEvent).button
}

function defaultExtent(this: Element): [[number, number], [number, number]] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DOM element may be SVG with viewBox or HTML with clientWidth
  let e: any = this
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e
    if (e.hasAttribute('viewBox')) {
      e = e.viewBox.baseVal
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]]
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]
  }
  return [[0, 0], [e.clientWidth || 0, e.clientHeight || 0]]
}

function defaultTransform(this: Element & { __zoom?: TransformInstance }): TransformInstance {
  return this.__zoom || identity
}

function defaultWheelDelta(event: WheelEvent): number {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1)
}

function defaultTouchable(this: Element): boolean {
  return !!(navigator.maxTouchPoints || ('ontouchstart' in this))
}

function defaultConstrain(transform: TransformInstance, extent: [[number, number], [number, number]], translateExtent: [[number, number], [number, number]]): TransformInstance {
  const dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0]
  const dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0]
  const dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1]
  const dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1]
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1),
  )
}

export default function zoomBehavior(): any {
  let filter: any = defaultFilter
  let extent: any = defaultExtent
  let constrain: any = defaultConstrain
  let wheelDelta: any = defaultWheelDelta
  let touchable: any = defaultTouchable
  const scaleExtent = [0, Infinity]
  const translateExtent: [[number, number], [number, number]] = [[-Infinity, -Infinity], [Infinity, Infinity]]
  let duration = 250
  let interpolate: typeof interpolateZoom = interpolateZoom
  const listeners = dispatch('start', 'zoom', 'end')
  let touchstarting: ReturnType<typeof setTimeout> | null
  let touchfirst: [number, number]
  let touchending: ReturnType<typeof setTimeout> | null
  const touchDelay = 500
  const wheelDelay = 150
  let clickDistance2 = 0
  let tapDistance = 10

  function zoom(selection: any): void {
    selection
      .property('__zoom', defaultTransform)
      .on('wheel.zoom', wheeled, { passive: false })
      .on('mousedown.zoom', mousedowned)
      .on('dblclick.zoom', dblclicked)
      .filter(touchable)
      .on('touchstart.zoom', touchstarted)
      .on('touchmove.zoom', touchmoved)
      .on('touchend.zoom touchcancel.zoom', touchended)
      .style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)')
  }

  zoom.transform = function (collection: any, transform: any, point?: any, event?: any): void {
    const selection = collection.selection ? collection.selection() : collection
    selection.property('__zoom', defaultTransform)
    if (collection !== selection) {
      schedule(collection, transform, point, event)
    }
    else {
      selection.interrupt().each(function (this: any) {
        gesture(this, arguments)
          .event(event)
          .start()
          .zoom(null, typeof transform === 'function' ? transform.apply(this, arguments) : transform)
          .end()
      })
    }
  }

  zoom.scaleBy = function (selection: any, k: any, p?: any, event?: any): void {
    zoom.scaleTo(selection, function (this: any) {
      const k0 = this.__zoom.k
      const k1 = typeof k === 'function' ? k.apply(this, arguments) : k
      return k0 * k1
    }, p, event)
  }

  zoom.scaleTo = function (selection: any, k: any, p?: any, event?: any): void {
    zoom.transform(selection, function (this: any) {
      const e = extent.apply(this, arguments)
      const t0 = this.__zoom
      const p0 = p == null ? centroid(e) : typeof p === 'function' ? p.apply(this, arguments) : p
      const p1 = t0.invert(p0)
      const k1 = typeof k === 'function' ? k.apply(this, arguments) : k
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent)
    }, p, event)
  }

  zoom.translateBy = function (selection: any, x: any, y: any, event?: any): void {
    zoom.transform(selection, function (this: any) {
      return constrain(this.__zoom.translate(
        typeof x === 'function' ? x.apply(this, arguments) : x,
        typeof y === 'function' ? y.apply(this, arguments) : y,
      ), extent.apply(this, arguments), translateExtent)
    }, null, event)
  }

  zoom.translateTo = function (selection: any, x: any, y: any, p?: any, event?: any): void {
    zoom.transform(selection, function (this: any) {
      const e = extent.apply(this, arguments)
      const t = this.__zoom
      const p0 = p == null ? centroid(e) : typeof p === 'function' ? p.apply(this, arguments) : p
      return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === 'function' ? -x.apply(this, arguments) : -x,
        typeof y === 'function' ? -y.apply(this, arguments) : -y,
      ), e, translateExtent)
    }, p, event)
  }

  function scale(transform: TransformInstance, k: number): TransformInstance {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k))
    return k === transform.k ? transform : new (Transform as unknown as new (k: number, x: number, y: number) => TransformInstance)(k, transform.x, transform.y)
  }

  function translate(transform: TransformInstance, p0: [number, number], p1: [number, number]): TransformInstance {
    const x = p0[0] - p1[0] * transform.k
    const y = p0[1] - p1[1] * transform.k
    return x === transform.x && y === transform.y ? transform : new (Transform as unknown as new (k: number, x: number, y: number) => TransformInstance)(transform.k, x, y)
  }

  function centroid(extent: [[number, number], [number, number]]): [number, number] {
    return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2]
  }

  function schedule(transition: any, transform: any, point: any, event: any): void {
    transition
      .on('start.zoom', function (this: any) { gesture(this, arguments).event(event).start() })
      .on('interrupt.zoom end.zoom', function (this: any) { gesture(this, arguments).event(event).end() })
      .tween('zoom', function (this: any) {
        const that = this
        const args = arguments
        const g = gesture(that, args).event(event)
        const e = extent.apply(that, args)
        const p = point == null ? centroid(e) : typeof point === 'function' ? point.apply(that, args) : point
        const w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1])
        const a = that.__zoom
        const b = typeof transform === 'function' ? transform.apply(that, args) : transform
        const i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k))
        return function (t: number): void {
          if (t === 1) {
            t = b // Avoid rounding error on end.
          }
          else {
            const l = i(t)
            const k = w / l[2]
            t = new (Transform as any)(k, p[0] - l[0] * k, p[1] - l[1] * k)
          }
          g.zoom(null, t)
        }
      })
  }

  function gesture(that: any, args: any, clean?: boolean): any {
    return (!clean && that.__zooming) || new (Gesture as any)(that, args)
  }

  function Gesture(this: any, that: any, args: any): void {
    this.that = that
    this.args = args
    this.active = 0
    this.sourceEvent = null
    this.extent = extent.apply(that, args)
    this.taps = 0
  }

  Gesture.prototype = {
    event(this: any, event: any): any {
      if (event) this.sourceEvent = event
      return this
    },
    start(this: any): any {
      if (++this.active === 1) {
        this.that.__zooming = this
        this.emit('start')
      }
      return this
    },
    zoom(this: any, key: any, transform: any): any {
      if (this.mouse && key !== 'mouse') this.mouse[1] = transform.invert(this.mouse[0])
      if (this.touch0 && key !== 'touch') this.touch0[1] = transform.invert(this.touch0[0])
      if (this.touch1 && key !== 'touch') this.touch1[1] = transform.invert(this.touch1[0])
      this.that.__zoom = transform
      this.emit('zoom')
      return this
    },
    end(this: any): any {
      if (--this.active === 0) {
        delete this.that.__zooming
        this.emit('end')
      }
      return this
    },
    emit(this: any, type: string): void {
      const d = select(this.that).datum()
      listeners.call(
        type,
        this.that,
        new (ZoomEvent as any)(type, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          type,
          transform: this.that.__zoom,
          dispatch: listeners,
        }),
        d,
      )
    },
  }

  // eslint-disable-next-line pickier/no-unused-vars
  function wheeled(this: Element & { __zoom: TransformInstance; __zooming?: any }, event: WheelEvent, ..._args: unknown[]): void {
    if (!filter.apply(this, arguments)) return
    const g = gesture(this, _args).event(event)
    const t = this.__zoom
    const k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments))))
    const p = pointer(event)

    // If the mouse is in the same location as before, reuse it.
    // If there were recent wheel events, reset the wheel idle timeout.
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p)
      }
      clearTimeout(g.wheel)
    }

    // If this wheel event won't trigger a transform change, ignore it.
    else if (t.k === k) return

    // Otherwise, capture the mouse point and location at the start.
    else {
      g.mouse = [p, t.invert(p)]
      interrupt(this)
      g.start()
    }

    noevent(event)
    g.wheel = setTimeout(wheelidled, wheelDelay)
    g.zoom('mouse', constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent))

    function wheelidled(): void {
      g.wheel = null
      g.end()
    }
  }

  // eslint-disable-next-line pickier/no-unused-vars
  function mousedowned(this: Element & { __zoom: TransformInstance; __zooming?: any }, event: MouseEvent, ..._args: unknown[]): void {
    if (touchending || !filter.apply(this, arguments)) return
    const currentTarget = event.currentTarget as Element
    const g = gesture(this, _args, true).event(event)
    const v = select(event.view).on('mousemove.zoom', mousemoved, true).on('mouseup.zoom', mouseupped, true)
    const p = pointer(event, currentTarget)
    const x0 = event.clientX
    const y0 = event.clientY

    dragDisable(event.view)
    nopropagation(event)
    g.mouse = [p, this.__zoom.invert(p)]
    interrupt(this)
    g.start()

    function mousemoved(event: MouseEvent): void {
      noevent(event)
      if (!g.moved) {
        const dx = event.clientX - x0
        const dy = event.clientY - y0
        g.moved = dx * dx + dy * dy > clickDistance2
      }
      g.event(event)
        .zoom('mouse', constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event, currentTarget), g.mouse[1]), g.extent, translateExtent))
    }

    function mouseupped(event: MouseEvent): void {
      v.on('mousemove.zoom mouseup.zoom', null)
      dragEnable(event.view, g.moved)
      noevent(event)
      g.event(event).end()
    }
  }

  function dblclicked(this: Element & { __zoom: TransformInstance }, event: MouseEvent | TouchEvent, ..._args: unknown[]): void {
    if (!filter.apply(this, arguments)) return
    const t0 = this.__zoom
    const p0 = pointer((event as TouchEvent).changedTouches ? (event as TouchEvent).changedTouches[0] as unknown as Event : event, this)
    const p1 = t0.invert(p0)
    const k1 = t0.k * (event.shiftKey ? 0.5 : 2)
    const t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, _args), translateExtent)

    noevent(event)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- duration() returns Transition when called with argument, but typed as union
    if (duration > 0) (select(this).transition().duration(duration) as any).call(schedule, t1, p0, event)
    else select(this).call(zoom.transform, t1, p0, event)
  }

  // eslint-disable-next-line pickier/no-unused-vars
  function touchstarted(this: Element & { __zoom: TransformInstance; __zooming?: any }, event: TouchEvent, ..._args: unknown[]): void {
    if (!filter.apply(this, arguments)) return
    const touches = event.touches
    const n = touches.length
    const g = gesture(this, _args, event.changedTouches.length === n).event(event)
    let started: boolean | undefined
    let i: number
    let t: Touch
    let p: any

    nopropagation(event)
    for (i = 0; i < n; ++i) {
      t = touches[i]
      p = pointer(t as unknown as Event, this)
      p = [p, this.__zoom.invert(p), t.identifier]
      if (!g.touch0) {
        g.touch0 = p
        started = true
        g.taps = 1 + +!!touchstarting
      }
      else if (!g.touch1 && g.touch0[2] !== p[2]) {
        g.touch1 = p
        g.taps = 0
      }
    }

    if (touchstarting) {
      clearTimeout(touchstarting)
      touchstarting = null
    }

    if (started) {
      if (g.taps < 2) {
        touchfirst = p![0]
        touchstarting = setTimeout(() => { touchstarting = null }, touchDelay)
      }
      interrupt(this)
      g.start()
    }
  }

  // eslint-disable-next-line pickier/no-unused-vars
  function touchmoved(this: Element & { __zooming?: any; __zoom: TransformInstance }, event: TouchEvent, ..._args: unknown[]): void {
    if (!this.__zooming) return
    const g = gesture(this, _args).event(event)
    const touches = event.changedTouches
    const n = touches.length
    let i: number, t: any, p: any, l: any

    noevent(event)
    for (i = 0; i < n; ++i) {
      t = touches[i]
      p = pointer(t, this)
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p
    }
    t = g.that.__zoom
    if (g.touch1) {
      const p0 = g.touch0[0]
      const l0 = g.touch0[1]
      const p1 = g.touch1[0]
      const l1 = g.touch1[1]
      // eslint-disable-next-line pickier/no-unused-vars
      var dp: any = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp
      // eslint-disable-next-line pickier/no-unused-vars
      var dl: any = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl
      t = scale(t, Math.sqrt(dp / dl))
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2]
    }
    else if (g.touch0) {
      p = g.touch0[0]
      l = g.touch0[1]
    }
    else return

    g.zoom('touch', constrain(translate(t, p, l), g.extent, translateExtent))
  }

  // eslint-disable-next-line pickier/no-unused-vars
  function touchended(this: Element & { __zooming?: any; __zoom: TransformInstance }, event: TouchEvent, ..._args: unknown[]): void {
    if (!this.__zooming) return
    const g = gesture(this, _args).event(event)
    const touches = event.changedTouches
    const n = touches.length
    let i: number, t: any

    nopropagation(event)
    if (touchending) clearTimeout(touchending)
    touchending = setTimeout(() => { touchending = null }, touchDelay)
    for (i = 0; i < n; ++i) {
      t = touches[i]
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1
    }
    if (g.touch1 && !g.touch0) {
      g.touch0 = g.touch1
      delete g.touch1
    }
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0])
    else {
      g.end()
      // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
      if (g.taps === 2) {
        t = pointer(t, this)
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          const p = select(this).on('dblclick.zoom')
          if (p) p.apply(this, arguments)
        }
      }
    }
  }

  zoom.wheelDelta = function (_?: any): any {
    return arguments.length ? (wheelDelta = typeof _ === 'function' ? _ : constant(+_), zoom) : wheelDelta
  }

  zoom.filter = function (_?: any): any {
    return arguments.length ? (filter = typeof _ === 'function' ? _ : constant(!!_), zoom) : filter
  }

  zoom.touchable = function (_?: any): any {
    return arguments.length ? (touchable = typeof _ === 'function' ? _ : constant(!!_), zoom) : touchable
  }

  zoom.extent = function (_?: any): any {
    return arguments.length ? (extent = typeof _ === 'function' ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent
  }

  zoom.scaleExtent = function (_?: any): any {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]]
  }

  zoom.translateExtent = function (_?: any): any {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]]
  }

  zoom.constrain = function (_?: any): any {
    return arguments.length ? (constrain = _, zoom) : constrain
  }

  zoom.duration = function (_?: number): any {
    return arguments.length ? (duration = +_!, zoom) : duration
  }

  zoom.interpolate = function (_?: any): any {
    return arguments.length ? (interpolate = _, zoom) : interpolate
  }

  zoom.on = function (..._args: any[]): any {
    const value = listeners.on.apply(listeners, arguments as any)
    return value === listeners ? zoom : value
  }

  zoom.clickDistance = function (_?: number): any {
    return arguments.length ? (clickDistance2 = (_ = +_!) * _, zoom) : Math.sqrt(clickDistance2)
  }

  zoom.tapDistance = function (_?: number): any {
    return arguments.length ? (tapDistance = +_!, zoom) : tapDistance
  }

  return zoom
}
