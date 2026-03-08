import { type Dispatch, dispatch } from '@ts-charts/dispatch'
import { type Timer, timer, timeout } from '@ts-charts/timer'

const emptyOn = dispatch('start', 'end', 'cancel', 'interrupt')
const emptyTween: TweenEntry[] = []

export const CREATED = 0
export const SCHEDULED = 1
export const STARTING = 2
export const STARTED = 3
export const RUNNING = 4
export const ENDING = 5
export const ENDED = 6

export interface TweenEntry {
  name: string
  value: Function
}

interface TransitionNode extends Element {
  __transition?: Record<number | string, TransitionSchedule>
  __data__?: unknown
}

export interface TransitionSchedule {
  name: string | null
  index: number
  group: Array<Element | null>
  on: Dispatch
  tween: TweenEntry[]
  time: number
  delay: number
  duration: number
  ease: (t: number) => number
  timer: Timer
  state: number
  value?: Record<string, unknown>
}

export interface TransitionTiming {
  time: number | null
  delay: number
  duration: number
  ease: (t: number) => number
}

export default function schedule(node: Element, name: string | null, id: number, index: number, group: Array<Element | null>, timing: TransitionTiming): void {
  const tNode = node as TransitionNode
  const schedules = tNode.__transition
  if (!schedules) tNode.__transition = {}
  else if (id in schedules) return
  create(tNode, id, {
    name,
    index,
    group,
    on: emptyOn,
    tween: emptyTween,
    time: timing.time as number,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null as unknown as Timer,
    state: CREATED,
  })
}

export function init(node: Element, id: number): TransitionSchedule {
  const s = get(node, id)
  if (s.state > CREATED) throw new Error('too late; already scheduled')
  return s
}

export function set(node: Element, id: number): TransitionSchedule {
  const s = get(node, id)
  if (s.state > STARTED) throw new Error('too late; already running')
  return s
}

export function get(node: Element, id: number): TransitionSchedule {
  const s = (node as TransitionNode).__transition
  if (!s || !(s[id])) throw new Error('transition not found')
  return s[id]
}

function create(node: TransitionNode, id: number, self: TransitionSchedule): void {
  const schedules = node.__transition!
  let tween: Array<(t: number) => void>

  schedules[id] = self
  self.timer = timer(scheduleFn, 0, self.time)

  function scheduleFn(elapsed: number): void {
    self.state = SCHEDULED
    self.timer.restart(start, self.delay, self.time)

    if (self.delay <= elapsed) start(elapsed - self.delay)
  }

  function start(elapsed: number): void {
    let i: string, j: number, n: number, o: TransitionSchedule

    if (self.state !== SCHEDULED) return stop()

    for (i in schedules) {
      o = schedules[i]
      if (o.name !== self.name) continue

      if (o.state === STARTED) return void timeout(start)

      if (o.state === RUNNING) {
        o.state = ENDED
        o.timer.stop()
        try {
          o.on.call('interrupt', node, node.__data__, o.index, o.group)
        }
        catch {
          // Ensure transition cleanup still happens when listeners throw.
        }
        delete schedules[i]
      }
      else if (+i < id) {
        o.state = ENDED
        o.timer.stop()
        try {
          o.on.call('cancel', node, node.__data__, o.index, o.group)
        }
        catch {
          // Ensure transition cleanup still happens when listeners throw.
        }
        delete schedules[i]
      }
    }

    timeout(() => {
      if (self.state === STARTED) {
        self.state = RUNNING
        self.timer.restart(tick, self.delay, self.time)
        tick(elapsed)
      }
    })

    self.state = STARTING
    try {
      self.on.call('start', node, node.__data__, self.index, self.group)
    }
    catch {
      return stop()
    }
    if (self.state !== STARTING) return
    self.state = STARTED

    n = self.tween.length
    tween = new Array(n)
    j = -1
    for (let idx = 0; idx < n; ++idx) {
      let tweenResult: ((t: number) => void) | null | undefined
      try {
        tweenResult = self.tween[idx].value.call(node, node.__data__, self.index, self.group) as ((t: number) => void) | null | undefined
      }
      catch {
        return stop()
      }
      if (tweenResult) {
        tween[++j] = tweenResult
      }
    }
    tween.length = j + 1
  }

  function tick(elapsed: number): void {
    const t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1)
    let i = -1
    const n = tween.length

    while (++i < n) {
      try {
        tween[i].call(node, t)
      }
      catch {
        return stop()
      }
    }

    if (self.state === ENDING) {
      try {
        self.on.call('end', node, node.__data__, self.index, self.group)
      }
      catch {
        return stop()
      }
      stop()
    }
  }

  function stop(): void {
    self.state = ENDED
    self.timer.stop()
    delete schedules[id]
    for (const i in schedules) return // eslint-disable-line no-unused-vars
    delete node.__transition
  }
}
