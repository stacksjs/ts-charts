import { timeYear, timeMonth, timeWeek, timeDay, timeHour, timeMinute, timeSecond, timeTicks, timeTickInterval } from '@ts-charts/time'
import { timeFormat } from '@ts-charts/time-format'
import continuous, { copy } from './continuous.ts'
import { initRange } from './init.ts'
import nice from './nice.ts'

function date(t: number): Date {
  return new Date(t)
}

function number(t: any): number {
  return t instanceof Date ? +t : +new Date(+t)
}

export function calendar(ticks: any, tickInterval: any, year: any, month: any, week: any, day: any, hour: any, minute: any, second: any, format: any): any {
  const scale = continuous()
  const invert = scale.invert
  const domain = scale.domain

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

  scale.invert = function (y: any): Date {
    return new Date(invert(y))
  }

  scale.domain = function (_?: any): any {
    return arguments.length ? domain(Array.from(_, number)) : domain().map(date)
  }

  scale.ticks = function (interval?: any): Date[] {
    const d = domain()
    return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval)
  }

  scale.tickFormat = function (count?: any, specifier?: string): any {
    return specifier == null ? tickFormat : format(specifier)
  }

  scale.nice = function (interval?: any): any {
    const d = domain()
    if (!interval || typeof interval.range !== 'function') interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval)
    return interval ? domain(nice(d, interval)) : scale
  }

  scale.copy = function (): any {
    return copy(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format))
  }

  return scale
}

export default function time(): any {
  return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeWeek, timeDay, timeHour, timeMinute, timeSecond, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments as any)
}
