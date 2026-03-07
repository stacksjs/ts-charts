import { dispatch } from '@ts-charts/dispatch'
import { timer, timeout } from '@ts-charts/timer'

const emptyOn = dispatch('start', 'end', 'cancel', 'interrupt')
const emptyTween: any[] = []

export const CREATED = 0
export const SCHEDULED = 1
export const STARTING = 2
export const STARTED = 3
export const RUNNING = 4
export const ENDING = 5
export const ENDED = 6

export interface TransitionSchedule {
  name: string | null
  index: number
  group: any[]
  on: any
  tween: any[]
  time: number
  delay: number
  duration: number
  ease: (t: number) => number
  timer: any
  state: number
  value?: any
}

export interface TransitionTiming {
  time: number | null
  delay: number
  duration: number
  ease: (t: number) => number
}

export default function schedule(node: any, name: string | null, id: number, index: number, group: any[], timing: TransitionTiming): void {
  const schedules = node.__transition
  if (!schedules) node.__transition = {}
  else if (id in schedules) return
  create(node, id, {
    name,
    index,
    group,
    on: emptyOn,
    tween: emptyTween,
    time: timing.time as number,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED,
  })
}

export function init(node: any, id: number): TransitionSchedule {
  const s = get(node, id)
  if (s.state > CREATED) throw new Error('too late; already scheduled')
  return s
}

export function set(node: any, id: number): TransitionSchedule {
  const s = get(node, id)
  if (s.state > STARTED) throw new Error('too late; already running')
  return s
}

export function get(node: any, id: number): TransitionSchedule {
  const s = node.__transition
  if (!s || !(s[id])) throw new Error('transition not found')
  return s[id]
}

function create(node: any, id: number, self: TransitionSchedule): void {
  const schedules = node.__transition
  let tween: any[]

  schedules[id] = self
  self.timer = timer(scheduleFn, 0, self.time)

  function scheduleFn(elapsed: number): void {
    self.state = SCHEDULED
    self.timer.restart(start, self.delay, self.time)

    if (self.delay <= elapsed) start(elapsed - self.delay)
  }

  function start(elapsed: number): void {
    let i: any, j: number, n: number, o: any

    if (self.state !== SCHEDULED) return stop()

    for (i in schedules) {
      o = schedules[i]
      if (o.name !== self.name) continue

      if (o.state === STARTED) return timeout(start)

      if (o.state === RUNNING) {
        o.state = ENDED
        o.timer.stop()
        o.on.call('interrupt', node, node.__data__, o.index, o.group)
        delete schedules[i]
      }
      else if (+i < id) {
        o.state = ENDED
        o.timer.stop()
        o.on.call('cancel', node, node.__data__, o.index, o.group)
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
    self.on.call('start', node, node.__data__, self.index, self.group)
    if (self.state !== STARTING) return
    self.state = STARTED

    tween = new Array(n = self.tween.length)
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o
      }
    }
    tween.length = j + 1
  }

  function tick(elapsed: number): void {
    const t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1)
    let i = -1
    const n = tween.length

    while (++i < n) {
      tween[i].call(node, t)
    }

    if (self.state === ENDING) {
      self.on.call('end', node, node.__data__, self.index, self.group)
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
