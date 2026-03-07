import { dispatch } from '@ts-charts/dispatch'
import { select, pointer } from '@ts-charts/selection'
import nodrag, { yesdrag } from './nodrag.ts'
import noevent, { nonpassive, nonpassivecapture, nopropagation } from './noevent.ts'
import constant from './constant.ts'
import DragEvent from './event.ts'

// Ignore right-click, since that should open the context menu.
function defaultFilter(event: MouseEvent): boolean {
  return !event.ctrlKey && !event.button
}

function defaultContainer(this: any): any {
  return this.parentNode
}

function defaultSubject(event: any, d: any): any {
  return d == null ? { x: event.x, y: event.y } : d
}

function defaultTouchable(this: any): boolean {
  return !!(navigator.maxTouchPoints || ('ontouchstart' in this))
}

export default function drag(): any {
  let filter: any = defaultFilter
  let container: any = defaultContainer
  let subject: any = defaultSubject
  let touchable: any = defaultTouchable
  const gestures: any = {}
  let listeners = dispatch('start', 'drag', 'end')
  let active = 0
  let mousedownx: number
  let mousedowny: number
  let mousemoving: boolean
  let touchending: any
  let clickDistance2 = 0

  function dragFn(selection: any): void {
    selection
        .on('mousedown.drag', mousedowned)
      .filter(touchable)
        .on('touchstart.drag', touchstarted)
        .on('touchmove.drag', touchmoved, nonpassive)
        .on('touchend.drag touchcancel.drag', touchended)
        .style('touch-action', 'none')
        .style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)')
  }

  function mousedowned(this: any, event: any, d: any): void {
    if (touchending || !filter.call(this, event, d)) return
    const gesture = beforestart(this, container.call(this, event, d), event, d, 'mouse')
    if (!gesture) return
    select(event.view)
      .on('mousemove.drag', mousemoved, nonpassivecapture)
      .on('mouseup.drag', mouseupped, nonpassivecapture)
    nodrag(event.view)
    nopropagation(event)
    mousemoving = false
    mousedownx = event.clientX
    mousedowny = event.clientY
    gesture('start', event)
  }

  function mousemoved(event: any): void {
    noevent(event)
    if (!mousemoving) {
      const dx = event.clientX - mousedownx
      const dy = event.clientY - mousedowny
      mousemoving = dx * dx + dy * dy > clickDistance2
    }
    gestures.mouse('drag', event)
  }

  function mouseupped(event: any): void {
    select(event.view).on('mousemove.drag mouseup.drag', null)
    yesdrag(event.view, mousemoving)
    noevent(event)
    gestures.mouse('end', event)
  }

  function touchstarted(this: any, event: any, d: any): void {
    if (!filter.call(this, event, d)) return
    const touches = event.changedTouches
    const c = container.call(this, event, d)
    const n = touches.length
    let i: number
    let gesture: any

    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation(event)
        gesture('start', event, touches[i])
      }
    }
  }

  function touchmoved(event: any): void {
    const touches = event.changedTouches
    const n = touches.length
    let i: number
    let gesture: any

    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent(event)
        gesture('drag', event, touches[i])
      }
    }
  }

  function touchended(event: any): void {
    const touches = event.changedTouches
    const n = touches.length
    let i: number
    let gesture: any

    if (touchending) clearTimeout(touchending)
    touchending = setTimeout(function () { touchending = null }, 500) // Ghost clicks are delayed!
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation(event)
        gesture('end', event, touches[i])
      }
    }
  }

  function beforestart(that: any, container: any, event: any, d: any, identifier: any, touch?: any): any {
    const disp = listeners.copy()
    let p = pointer(touch || event, container)
    let dx: number
    let dy: number
    let s: any

    if ((s = subject.call(that, new DragEvent('beforestart', {
        sourceEvent: event,
        target: dragFn,
        identifier,
        active,
        x: p[0],
        y: p[1],
        dx: 0,
        dy: 0,
        dispatch: disp
      }), d)) == null) return

    dx = s.x - p[0] || 0
    dy = s.y - p[1] || 0

    return function gesture(type: string, event: any, touch?: any): void {
      const p0 = p
      let n: number
      switch (type) {
        case 'start': gestures[identifier] = gesture, n = active++; break
        case 'end': delete gestures[identifier], --active; p = pointer(touch || event, container), n = active; break
        case 'drag': p = pointer(touch || event, container), n = active; break
      }
      disp.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event,
          subject: s,
          target: dragFn,
          identifier,
          active: n!,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: disp
        }),
        d
      )
    }
  }

  dragFn.filter = function (_?: any): any {
    return arguments.length ? (filter = typeof _ === 'function' ? _ : constant(!!_), dragFn) : filter
  }

  dragFn.container = function (_?: any): any {
    return arguments.length ? (container = typeof _ === 'function' ? _ : constant(_), dragFn) : container
  }

  dragFn.subject = function (_?: any): any {
    return arguments.length ? (subject = typeof _ === 'function' ? _ : constant(_), dragFn) : subject
  }

  dragFn.touchable = function (_?: any): any {
    return arguments.length ? (touchable = typeof _ === 'function' ? _ : constant(!!_), dragFn) : touchable
  }

  dragFn.on = function (...args: any[]): any {
    const value = listeners.on.apply(listeners, args as [string, ((...args: unknown[]) => void)?])
    return value === listeners ? dragFn : value
  }

  dragFn.clickDistance = function (_?: number): any {
    return arguments.length ? (clickDistance2 = (_ = +_!) * _, dragFn) : Math.sqrt(clickDistance2)
  }

  return dragFn
}
