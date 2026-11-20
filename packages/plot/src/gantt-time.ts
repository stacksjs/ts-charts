import { timeDay, timeFriday, timeHour, timeMinute, timeMonday, timeMonth, timeSaturday, timeSunday, timeThursday, timeTicks, timeTuesday, timeWednesday, timeYear, utcDay, utcFriday, utcHour, utcMillisecond, utcMinute, utcMonday, utcMonth, utcSaturday, utcSecond, utcSunday, utcThursday, utcTicks, utcTuesday, utcWednesday, utcYear } from '../../time/src/index.ts'

export type GanttTimeZone = 'UTC' | 'local'

export const dayMs: number = 86_400_000

export function ganttDayStart(time: number, zone: GanttTimeZone): number {
  return zone === 'local' ? +timeDay.floor(time) : Math.floor(time / dayMs) * dayMs
}

export function ganttDayOffset(time: number, days: number, zone: GanttTimeZone): number {
  return zone === 'local' ? +timeDay.offset(time, days) : time + days * dayMs
}

export function ganttNextDayStart(time: number, zone: GanttTimeZone): number {
  // Advance past the current date and floor again. A skipped midnight can put
  // this date's first instant at 01:00 without changing tomorrow's midnight.
  return zone === 'local' ? +timeDay.ceil(Math.floor(time) + 1) : ganttDayStart(time, zone) + dayMs
}

type GanttDaySample = (day: number) => number

export function ganttDaySampler(reference: number, zone: GanttTimeZone): GanttDaySample {
  const first = ganttDayStart(reference, zone)
  if (zone === 'UTC') {
    const offset = reference - first
    return day => day + offset
  }
  const clock = new Date(reference)
  const hour = clock.getHours()
  const minute = clock.getMinutes()
  const second = clock.getSeconds()
  const millisecond = clock.getMilliseconds()
  // Reapply the same wall time on each date so a clock gap affects one sample.
  return day => day === first ? reference : new Date(day).setHours(hour, minute, second, millisecond)
}

// Represent local wall-clock fields in UTC so the same field calculations can
// be used for both calendars without changing the actual task timestamps.
function wallTime(date: Date): Date {
  return new Date(+date - date.getTimezoneOffset() * 60000)
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const weekdays: readonly string[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const inputTokens = /YYYY|MMMM|MMM|DDDD|DDD|Do|SSS|SS|YY|MM|DD|HH|hh|mm|ss|ZZ|[YQMDHhmsSAaXxZ]|\[[^\]]*\]|./g
const dateFields: Readonly<Record<string, string>> = {
  Y: '[+-]?\\d{1,6}', YYYY: '\\d{4}', YY: '\\d{2}', Q: '[1-4]', MMMM: '[A-Za-z]+', MMM: '[A-Za-z]{3}',
  DDD: '\\d{1,3}', DDDD: '\\d{3}', Do: '\\d{1,2}(?:st|nd|rd|th)', S: '\\d', SS: '\\d{2}', SSS: '\\d{3}',
  A: 'AM|PM', a: 'am|pm', X: '-?\\d+(?:\\.\\d+)?', x: '-?\\d+', Z: 'Z|[+-]\\d{2}:?\\d{2}', ZZ: 'Z|[+-]\\d{4}',
}

export function ganttDateFormatIncludesTime(format: string): boolean {
  return (format.match(inputTokens) ?? []).some(token => /^[HhmsSAaXxZ]+$/.test(token))
}

function regexLiteral(value: string): string {
  return value.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&')
}

function tokenLiteral(token: string): string {
  return token.length > 1 && token.startsWith('[') ? token.slice(1, -1) : token
}

function ordinalDay(day: number): string {
  const suffix = day >= 11 && day <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'
  return `${day}${suffix}`
}

function compileDateFormat(format: string) {
  const tokens = format.match(inputTokens) ?? []
  const fields: string[] = []
  const pattern = tokens.map((token) => {
    const standaloneClock = tokens.length === 1 && /^[Hhms]+$/.test(token)
    const field = dateFields[token] ?? (/^[MDHhms]{1,2}$/.test(token)
      ? (token.length === 2 && !standaloneClock ? '\\d{2}' : '\\d{1,2}')
      : '')
    if (!field) return regexLiteral(tokenLiteral(token))
    fields.push(token)
    return `(${field})`
  }).join('')
  return { tokens, fields, matcher: new RegExp(`^${pattern}$`, 'i') }
}

/** Partial dates use the supplied reference date in the selected calendar. */
export function ganttDateParser(format: string, referenceTime: number = Date.now(), timeZone: GanttTimeZone = 'UTC'): (value: string) => number | undefined {
  const { fields, matcher } = compileDateFormat(format)
  const referenceDate = new Date(referenceTime)
  const reference = timeZone === 'local' ? wallTime(referenceDate) : referenceDate
  return (value) => {
    const captures = matcher.exec(value.trim())
    if (!captures || !fields.length) return
    const parts = new Map(fields.map((field, index) => [field, captures[index + 1]]))
    const get = (names: string[], fallback: number) => {
      const name = names.find(name => parts.has(name))
      return name ? Number.parseInt(parts.get(name)!, 10) : fallback
    }
    if (parts.has('X') || parts.has('x')) {
      const stamp = parts.has('X') ? Number(parts.get('X')) * 1000 : Number(parts.get('x'))
      const time = new Date(stamp).getTime()
      return Number.isFinite(time) ? time : undefined
    }
    const hasYear = parts.has('Y') || parts.has('YYYY') || parts.has('YY')
    const shortYear = get(['YY'], NaN)
    const defaultYear = Number.isNaN(shortYear) ? reference.getUTCFullYear() : shortYear + (shortYear > 68 ? 1900 : 2000)
    const year = get(['YYYY', 'Y'], defaultYear)
    const monthName = parts.get('MMMM') ?? parts.get('MMM')
    const ordinalToken = parts.get('DDD') ?? parts.get('DDDD')
    const ordinal = ordinalToken === undefined ? undefined : Number(ordinalToken)
    if (ordinal === 0) return
    const hasMonth = monthName !== undefined || parts.has('M') || parts.has('MM') || parts.has('Q')
    const firstMonth = hasYear ? 1 : reference.getUTCMonth() + 1
    const defaultMonth = parts.has('Q') ? (get(['Q'], 1) - 1) * 3 + 1 : firstMonth
    const month = monthName
      ? months.findIndex(name => (parts.has('MMM') ? name.slice(0, 3) : name).toLowerCase() === monthName.toLowerCase()) + 1
      : get(['M', 'MM'], defaultMonth)
    const date = get(['D', 'DD', 'Do'], hasYear || hasMonth || ordinal !== undefined ? 1 : reference.getUTCDate())
    const dayLabel = parts.get('Do')
    if (dayLabel && dayLabel.toLowerCase() !== ordinalDay(date)) return
    let hour = get(['H', 'HH', 'h', 'hh'], 0)
    const meridiem = parts.get('a') ?? parts.get('A')
    if ((meridiem || parts.has('h') || parts.has('hh')) && (hour < 1 || hour > 12)) return
    if (meridiem) hour = hour % 12 + (meridiem.toLowerCase() === 'pm' ? 12 : 0)
    const minute = get(['m', 'mm'], 0)
    const second = get(['s', 'ss'], 0)
    const fraction = parts.get('SSS') ?? parts.get('SS') ?? parts.get('S') ?? ''
    if (month < 1 || month > 12 || date < 1 || date > 31 || hour > 23 || minute > 59 || second > 59) return
    const useLocal = timeZone === 'local' && !parts.has('Z') && !parts.has('ZZ')
    const time = new Date(0)
    const monthIndex = ordinal === undefined ? month - 1 : 0
    const day = ordinal ?? date
    if (useLocal) {
      time.setHours(0, 0, 0, 0)
      time.setFullYear(year, monthIndex, day)
      time.setHours(hour, minute, second, Number(fraction.padEnd(3, '0')))
      const hasHour = parts.has('H') || parts.has('HH') || parts.has('h') || parts.has('hh')
      if (time.getFullYear() !== year || (ordinal === undefined && (time.getMonth() !== monthIndex || time.getDate() !== day))
        || (ordinal !== undefined && dayOfYear(wallTime(time)) !== ordinal)
        || (hasHour && time.getHours() !== hour) || ((parts.has('m') || parts.has('mm')) && time.getMinutes() !== minute)) return
      return +time
    }
    time.setUTCFullYear(year, monthIndex, day)
    time.setUTCHours(hour, minute, second, Number(fraction.padEnd(3, '0')))
    if (time.getUTCFullYear() !== year || (ordinal === undefined && (time.getUTCMonth() !== month - 1 || time.getUTCDate() !== date))) return
    const zone = /([+-])(\d{2}):?(\d{2})/.exec(parts.get('Z') ?? parts.get('ZZ') ?? '')
    if (zone && (Number(zone[2]) > 23 || Number(zone[3]) > 59)) return
    const offset = zone ? (zone[1] === '-' ? -1 : 1) * (Number(zone[2]) * 60 + Number(zone[3])) * 60000 : 0
    return time.valueOf() - offset
  }
}

function dayOfYear(date: Date): number {
  const start = new Date(0)
  start.setUTCFullYear(date.getUTCFullYear())
  return Math.floor((+date - +start) / dayMs) + 1
}

const padDate = (value: number, length = 2) => String(value).padStart(length, '0')
const hour12 = (date: Date) => date.getUTCHours() % 12 || 12
const yearDigits = (year: number, length: number) => year < 0 ? `-${padDate(-year, length)}` : padDate(year, length)
const dateValues: Record<string, string | ((date: Date) => string | number)> = {
  Y: date => date.getUTCFullYear(),
  YYYY: date => yearDigits(date.getUTCFullYear(), 4),
  YY: date => padDate((date.getUTCFullYear() % 100 + 100) % 100),
  Q: date => Math.floor(date.getUTCMonth() / 3) + 1,
  M: date => date.getUTCMonth() + 1, MM: date => padDate(date.getUTCMonth() + 1),
  MMMM: date => months[date.getUTCMonth()], MMM: date => months[date.getUTCMonth()].slice(0, 3),
  D: date => date.getUTCDate(), DD: date => padDate(date.getUTCDate()), Do: date => ordinalDay(date.getUTCDate()),
  DDD: dayOfYear, DDDD: date => padDate(dayOfYear(date), 3),
  H: date => date.getUTCHours(), HH: date => padDate(date.getUTCHours()),
  h: hour12, hh: date => padDate(hour12(date)),
  m: date => date.getUTCMinutes(), mm: date => padDate(date.getUTCMinutes()),
  s: date => date.getUTCSeconds(), ss: date => padDate(date.getUTCSeconds()),
  a: date => date.getUTCHours() < 12 ? 'am' : 'pm',
  A: date => date.getUTCHours() < 12 ? 'AM' : 'PM',
  S: date => Math.floor(date.getUTCMilliseconds() / 100),
  SS: date => padDate(Math.floor(date.getUTCMilliseconds() / 10)),
  SSS: date => padDate(date.getUTCMilliseconds(), 3),
  X: date => Math.floor(+date / 1000), x: date => +date, Z: '+00:00', ZZ: '+0000',
}

export function ganttDateFormatter(format: string, timeZone: GanttTimeZone = 'UTC'): { matches: (value: string) => boolean, format: (time: number) => string } {
  const { tokens, fields, matcher } = compileDateFormat(format)
  const parts = tokens.map(token => Object.hasOwn(dateValues, token) ? dateValues[token] : tokenLiteral(token))
  return {
    matches: (value: string) => fields.length > 0 && matcher.test(value),
    format(time: number): string {
      const instant = new Date(time)
      const date = timeZone === 'local' ? wallTime(instant) : instant
      let output = ''
      for (const [index, part] of parts.entries()) {
        const token = tokens[index]
        if (token === 'X' || token === 'x') output += token === 'X' ? Math.floor(+instant / 1000) : +instant
        else if (timeZone === 'local' && (token === 'Z' || token === 'ZZ')) {
          const offset = -instant.getTimezoneOffset()
          const absolute = Math.abs(offset)
          output += (offset < 0 ? '-' : '+') + padDate(Math.floor(absolute / 60)) + (token === 'Z' ? ':' : '') + padDate(absolute % 60)
        }
        else output += typeof part === 'string' ? part : part(date)
      }
      return output
    },
  }
}

const parseIsoTime = ganttDateParser('YYYY-MM-DD[T]HH:mm:ss.SSSZ', 0)
const parseLocalIsoTime = ganttDateParser('YYYY-MM-DD[T]HH:mm:ss.SSS', 0, 'local')

export function ganttIsoStart(value: string, timeZone: GanttTimeZone = 'UTC'): number | undefined {
  const match = /^(\d{3,4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?)?$/i.exec(value)
  if (!match) return
  const [, year, month, day, hour = '00', minute = '00', second = '00', fraction = '', zone] = match
  const stamp = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour}:${minute}:${second}.${fraction.padEnd(3, '0')}`
  return timeZone === 'local' && !zone ? parseLocalIsoTime(stamp) : parseIsoTime(stamp + (zone ?? 'Z'))
}

export function defaultGanttAxisFormat(format: string, crossesDay: boolean): string {
  const tokens = format.match(inputTokens) ?? []
  const hours = tokens.some(token => /^[Hh]{1,2}$/.test(token) || token === 'X' || token === 'x')
  const minutes = hours || tokens.some(token => /^m{1,2}$/.test(token))
  const seconds = tokens.some(token => /^s{1,2}$/.test(token))
  const fractions = tokens.some(token => /^S{1,3}$/.test(token))
  const leading = [hours && '%H', minutes && '%M', seconds && '%S'].filter(Boolean).join(':')
  const clock = fractions ? (leading ? `${leading}.%L` : '%L') : leading
  if (!clock) return '%Y-%m-%d'
  return crossesDay ? `%Y-%m-%d ${clock}` : clock
}

export function durationEnd(start: number, spec: string, mode: 'elapsed' | 'calendar' = 'elapsed', timeZone: GanttTimeZone = 'UTC'): number | undefined {
  const [, digits, unit] = /^(\d+(?:\.\d+)?)(ms|[smhdwMy])$/.exec(spec) ?? []
  if (!digits) return
  const amount = Number(digits)
  if (!Number.isFinite(amount)) return
  const units: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: dayMs, w: 7 * dayMs }
  if (mode === 'calendar' && (unit === 'd' || unit === 'w'))
    return ganttDayOffset(start, Math.round(amount * (unit === 'w' ? 7 : 1)), timeZone)
  if (unit !== 'M' && unit !== 'y') {
    const end = start + amount * units[unit]
    return mode === 'calendar' ? new Date(end).getTime() : end
  }
  const instant = new Date(start)
  const date = timeZone === 'local' ? wallTime(instant) : instant
  const day = date.getUTCDate()
  date.setUTCDate(1)
  const months = unit === 'y' ? amount * 12 : amount
  if (mode === 'calendar' && unit === 'y') date.setUTCFullYear(Math.trunc(date.getUTCFullYear() + amount))
  else date.setUTCMonth(date.getUTCMonth() + Math.floor(months))
  const last = new Date(date)
  last.setUTCMonth(last.getUTCMonth() + 1, 0)
  date.setUTCDate(Math.min(day, last.getUTCDate()))
  if (timeZone === 'local')
    instant.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return +instant + (mode === 'calendar' ? 0 : (months % 1) * 30 * dayMs)
}

const utcIntervals = {
  millisecond: utcMillisecond, second: utcSecond, minute: utcMinute, hour: utcHour,
  day: utcDay, month: utcMonth, year: utcYear,
} as const
const localIntervals = {
  millisecond: utcMillisecond, second: utcSecond, minute: timeMinute, hour: timeHour,
  day: timeDay, month: timeMonth, year: timeYear,
} as const
const utcWeeks = [utcSunday, utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday]
const localWeeks = [timeSunday, timeMonday, timeTuesday, timeWednesday, timeThursday, timeFriday, timeSaturday]

function collectGanttTicks(first: number, end: number, limit: number, next: (tick: number) => number): number[] | undefined {
  const ticks: number[] = []
  let tick = first
  while (tick <= end && ticks.length < limit) {
    ticks.push(tick)
    const following = next(tick)
    if (!(following > tick)) return ticks
    tick = following
  }
  // A dense interval uses automatic ticks instead of truncating the axis.
  if (!(tick <= end)) return ticks
}

export function ganttTicks(start: number, end: number, spec: string, defaultWeekStart = 'sunday', timeZone: GanttTimeZone = 'UTC', maxExplicitTicks = 60): number[] {
  const tickLimit = Number.isFinite(maxExplicitTicks) ? Math.max(1, Math.min(10_000, Math.floor(maxExplicitTicks))) : 60
  const [, amount, unit, weekStart] = /^([1-9]\d*)(millisecond|second|minute|hour|day|week|month|year)(?:s)?(?:\s+([a-z]+))?$/.exec(spec) ?? []
  const stride = Number(amount)
  const local = timeZone === 'local'
  if (Number.isSafeInteger(stride) && stride > 0) {
    let authored: number[] | undefined
    if (unit === 'week') {
      const weeks = local ? localWeeks : utcWeeks
      const week = weeks[Math.max(0, weekdays.indexOf(weekStart ?? defaultWeekStart))]
      const boundary = week.ceil(Math.ceil(start))
      // Match the epoch-based phase of every() without scanning intervening weeks.
      const remainder = week.count!(0, boundary) % stride
      const skip = remainder < 0 ? -remainder : (stride - remainder) % stride
      const first = +week.floor(week.offset(boundary, skip))
      authored = collectGanttTicks(first, end, tickLimit, tick => +week.floor(week.offset(tick, stride)))
    }
    else {
      const intervals = local ? localIntervals : utcIntervals
      const step = intervals[unit as keyof typeof intervals]?.every?.(stride)
      if (step) authored = collectGanttTicks(+step.ceil(Math.ceil(start)), end, tickLimit, tick => +step.floor(step.offset(tick)))
    }
    if (authored) return authored.length ? authored : [start]
  }
  const ticks = (local ? timeTicks : utcTicks)(Math.ceil(start), Math.floor(end), 10).map(Number)
  return ticks.length ? ticks : [start]
}
