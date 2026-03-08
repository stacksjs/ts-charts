import { timeYear, timeMonth, timeWeek, timeDay, timeHour, timeMinute, timeSecond, timeTicks, timeTickInterval } from '@ts-charts/time'
import { timeFormat } from '@ts-charts/time-format'
import continuous, { copy, type ContinuousScale } from './continuous.ts'
import { initRange } from './init.ts'
import nice from './nice.ts'

type TimeInterval = (date: Date) => Date
type TicksFn = (start: number, stop: number, count: number) => Date[]
type TickIntervalFn = (start: number, stop: number, count: number) => { range: (start: Date, stop: Date) => Date[], floor: (x: number) => number, ceil: (x: number) => number }
type FormatFn = (specifier: string) => (date: Date) => string

function date(t: number): Date {
  return new Date(t)
}

function number(t: unknown): number {
  return t instanceof Date ? +t : +new Date(+(t as number))
}

export function calendar(ticks: TicksFn, tickInterval: TickIntervalFn, year: TimeInterval, month: TimeInterval, week: TimeInterval, day: TimeInterval, hour: TimeInterval, minute: TimeInterval, second: TimeInterval, format: FormatFn): ContinuousScale {
  const scale = continuous()
  const invert = scale.invert
  const domain = scale.domain as (() => number[]) & ((_: Iterable<unknown>) => ContinuousScale)

  const formatMillisecond = format('.%L')
  const formatSecond = format(':%S')
  const formatMinute = format('%I:%M')
  const formatHour = format('%I %p')
  const formatDay = format('%a %d')
  const formatWeek = format('%b %d')
  const formatMonth = format('%B')
  const formatYear = format('%Y')

  function tickFormat(date: Date): string {
    return (second(date) < date ? formatMillisecond
      : minute(date) < date ? formatSecond
      : hour(date) < date ? formatMinute
      : day(date) < date ? formatHour
      : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
      : year(date) < date ? formatMonth
      : formatYear)(date)
  }

  scale.invert = function (y: number): Date {
    return new Date(invert(y))
  } as unknown as ContinuousScale['invert']

  scale.domain = function (_?: Iterable<unknown>): Date[] | ContinuousScale {
    return arguments.length ? domain(Array.from(_!, number)) : (domain() as number[]).map(date)
  }

  scale.ticks = function (interval?: number): Date[] {
    const d = domain() as number[]
    return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval)
  } as unknown as ContinuousScale['ticks']

  scale.tickFormat = function (_count?: number, specifier?: string): (date: Date) => string {
    return specifier == null ? tickFormat : format(specifier)
  }

  scale.nice = function (interval?: number | { range: Function }): ContinuousScale {
    const d = domain() as number[]
    let iv = interval as { range: Function, floor: (x: number) => number, ceil: (x: number) => number } | undefined
    if (!iv || typeof iv.range !== 'function') iv = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval as number)
    return iv ? domain(nice(d, iv)) : scale
  }

  scale.copy = function (): ContinuousScale {
    return copy(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format))
  }

  return scale
}

export default function time(): ContinuousScale {
  // The time module functions are compatible at runtime; cast needed due to complex overload signatures
  const cal = calendar(
    timeTicks as unknown as TicksFn, timeTickInterval as unknown as TickIntervalFn,
    timeYear as unknown as TimeInterval, timeMonth as unknown as TimeInterval,
    timeWeek as unknown as TimeInterval, timeDay as unknown as TimeInterval,
    timeHour as unknown as TimeInterval, timeMinute as unknown as TimeInterval,
    timeSecond as unknown as TimeInterval, timeFormat as unknown as FormatFn
  )
  const scaled = cal.domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]) as ContinuousScale
  return initRange.apply(scaled, arguments as unknown as []) as unknown as ContinuousScale
}
