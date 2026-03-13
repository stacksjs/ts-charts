export interface TimeInterval {
  (date?: Date | number): Date
  floor: (date: Date | number) => Date
  ceil: (date: Date | number) => Date
  round: (date: Date | number) => Date
  offset: (date: Date | number, step?: number) => Date
  range: (start: Date | number, stop: Date | number, step?: number) => Date[]
  // eslint-disable-next-line pickier/no-unused-vars
  filter: (test: (date: Date) => boolean) => TimeInterval
  count?: (start: Date | number, end: Date | number) => number
  every?: (step: number) => TimeInterval | null
}

const t0: Date = new Date()
const t1: Date = new Date()

export function timeInterval(
  floori: (date: Date) => void,
  offseti: (date: Date, step: number) => void,
  count?: (start: Date, end: Date) => number,
  field?: (date: Date) => number,
): TimeInterval {

  function interval(date?: Date | number): Date {
    const d: Date = date == null ? new Date() : new Date(+date)
    floori(d)
    return d
  }

  interval.floor = (date: Date | number): Date => {
    const d: Date = new Date(+date)
    floori(d)
    return d
  }

  interval.ceil = (date: Date | number): Date => {
    const d: Date = new Date(+date - 1)
    floori(d)
    offseti(d, 1)
    floori(d)
    return d
  }

  interval.round = (date: Date | number): Date => {
    const d0: Date = interval(date)
    const d1: Date = interval.ceil(date)
    return +date - +d0 < +d1 - +date ? d0 : d1
  }

  interval.offset = (date: Date | number, step?: number): Date => {
    const d: Date = new Date(+date)
    offseti(d, step == null ? 1 : Math.floor(step))
    return d
  }

  interval.range = (start: Date | number, stop: Date | number, step?: number): Date[] => {
    const range: Date[] = []
    const s: Date = interval.ceil(start)
    const st: number = step == null ? 1 : Math.floor(step)
    if (!(s < new Date(+stop)) || !(st > 0)) return range // also handles Invalid Date
    let previous: Date
    do {
      previous = new Date(+s)
      range.push(previous)
      offseti(s, st)
      floori(s)
    } while (previous < s && s < new Date(+stop))
    return range
  }

  interval.filter = (test: (date: Date) => boolean): TimeInterval => {
    return timeInterval((date: Date): void => {
      if (date >= date) while (floori(date), !test(date)) date.setTime(+date - 1)
    }, (date: Date, step: number): void => {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
        } else while (--step >= 0) {
          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
        }
      }
    })
  }

  if (count) {
    interval.count = (start: Date | number, end: Date | number): number => {
      t0.setTime(+start)
      t1.setTime(+end)
      floori(t0)
      floori(t1)
      return Math.floor(count(t0, t1))
    }

    interval.every = (step: number): TimeInterval | null => {
      step = Math.floor(step)
      return !isFinite(step) || !(step > 0) ? null
          : !(step > 1) ? interval as TimeInterval
          : interval.filter(field
              ? (d: Date): boolean => field(d) % step === 0
              : (d: Date): boolean => (interval.count as (start: Date | number, end: Date | number) => number)(0, d) % step === 0)
    }
  }

  return interval as TimeInterval
}
