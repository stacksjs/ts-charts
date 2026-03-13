let frame = 0 // is an animation frame pending?
let timeoutId: ReturnType<typeof setTimeout> | number = 0 // is a timeout pending?
let intervalId: ReturnType<typeof setInterval> | number = 0 // are any timers active?
const pokeDelay = 1000 // how frequently we check for clock skew
let taskHead: Timer | null = null
let taskTail: Timer | null = null
let clockLast = 0
let clockNow = 0
let clockSkew = 0
const clock: { now(): number } = typeof performance === 'object' && typeof performance.now === 'function' ? performance : Date
const setFrame: (f: () => void) => void = typeof window === 'object' && typeof window.requestAnimationFrame === 'function'
  ? window.requestAnimationFrame.bind(window)
  : (f: () => void) => { setTimeout(f, 17) }

export function now(): number {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew)
}

function clearNow(): void {
  clockNow = 0
}

export class Timer {
  // eslint-disable-next-line pickier/no-unused-vars
  _call: ((elapsed: number) => void) | null
  _time: number
  _next: Timer | null

  constructor() {
    this._call = null
    this._time = 0
    this._next = null
  }

  restart(callback: (elapsed: number) => void, delay?: number | null, time?: number | null): void {
    if (typeof callback !== 'function') throw new TypeError('callback is not a function')
    const resolvedTime = (time == null ? now() : +time) + (delay == null ? 0 : +delay)
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this
      else taskHead = this
      taskTail = this
    }
    this._call = callback
    this._time = resolvedTime
    sleep()
  }

  stop(): void {
    if (this._call) {
      this._call = null
      this._time = Infinity
      sleep()
    }
  }
}

export function timer(callback: (elapsed: number) => void, delay?: number | null, time?: number | null): Timer {
  const t = new Timer()
  t.restart(callback, delay, time)
  return t
}

export function timerFlush(): void {
  now() // Get the current time, if not already set.
  ++frame // Pretend we've set an alarm, if we haven't already.
  let t: Timer | null = taskHead
  let e: number
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call!.call(undefined, e)
    t = t._next
  }
  --frame
}

function wake(): void {
  clockNow = (clockLast = clock.now()) + clockSkew
  frame = 0
  timeoutId = 0
  try {
    timerFlush()
  // eslint-disable-next-line pickier/no-unused-vars
  }
  finally {
    frame = 0
    nap()
    clockNow = 0
  }
}

function poke(): void {
  const n = clock.now()
  const delay = n - clockLast
  if (delay > pokeDelay) clockSkew -= delay, clockLast = n
}

function nap(): void {
  let t0: Timer | null = null
  let t1: Timer | null = taskHead
  let t2: Timer | null
  let time = Infinity
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time
      t0 = t1
      t1 = t1._next
    // eslint-disable-next-line pickier/no-unused-vars
    }
    else {
      t2 = t1._next
      t1._next = null
      t1 = t0 ? t0._next = t2 : taskHead = t2
    }
  }
  taskTail = t0
  sleep(time)
}

function sleep(time?: number): void {
  if (frame) return // Soonest alarm already set, or will be.
  // eslint-disable-next-line pickier/no-unused-vars
  if (timeoutId) {
    clearTimeout(timeoutId as ReturnType<typeof setTimeout>)
    timeoutId = 0
  }
  const delay = (time ?? 0) - clockNow // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time! < Infinity) timeoutId = setTimeout(wake, time! - clock.now() - clockSkew) as ReturnType<typeof setTimeout>
    // eslint-disable-next-line pickier/no-unused-vars
    if (intervalId) {
      clearInterval(intervalId as ReturnType<typeof setInterval>)
      intervalId = 0
    }
  // eslint-disable-next-line pickier/no-unused-vars
  }
  else {
    // eslint-disable-next-line pickier/no-unused-vars
    if (!intervalId) {
      clockLast = clock.now()
      intervalId = setInterval(poke, pokeDelay) as ReturnType<typeof setInterval>
    }
    frame = 1
    setFrame(wake)
  }
}
