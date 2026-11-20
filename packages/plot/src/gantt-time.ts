import { utcDay, utcFriday, utcHour, utcMillisecond, utcMinute, utcMonday, utcMonth, utcSaturday, utcSecond, utcSunday, utcThursday, utcTicks, utcTuesday, utcWednesday, utcYear } from '../../time/src/index.ts'

export const dayMs: number = 86_400_000

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const weekdays: readonly string[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const inputTokens = /YYYY|MMMM|MMM|DDDD|DDD|Do|SSS|SS|YY|MM|DD|HH|hh|mm|ss|ZZ|[YQMDHhmsSAaXxZ]|\[[^\]]*\]|./g
const dateFields: Readonly<Record<string, string>> = {
  Y: '[+-]?\\d{1,6}', YYYY: '\\d{4}', YY: '\\d{2}', Q: '[1-4]', MMMM: '[A-Za-z]+', MMM: '[A-Za-z]{3}',
  DDD: '\\d{1,3}', DDDD: '\\d{3}', Do: '\\d{1,2}(?:st|nd|rd|th)', S: '\\d', SS: '\\d{2}', SSS: '\\d{3}',
  A: 'AM|PM', a: 'am|pm', X: '-?\\d+(?:\\.\\d+)?', x: '-?\\d+', Z: 'Z|[+-]\\d{2}:?\\d{2}', ZZ: 'Z|[+-]\\d{4}',
}

function regexLiteral(value: string): string {
  return value.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&')
}

/** Build a UTC date parser. Partial dates use the supplied reference date. */
export function ganttDateParser(format: string, referenceTime: number = Date.now()): (value: string) => number | undefined {
  const tokens = format.match(inputTokens) ?? []
  const fields: string[] = []
  const pattern = tokens.map((token) => {
    const standaloneClock = tokens.length === 1 && /^[Hhms]+$/.test(token)
    const field = dateFields[token] ?? (/^[MDHhms]{1,2}$/.test(token)
      ? (token.length === 2 && !standaloneClock ? '\\d{2}' : '\\d{1,2}')
      : '')
    if (!field) return regexLiteral(token.length > 1 && token.startsWith('[') ? token.slice(1, -1) : token)
    fields.push(token)
    return `(${field})`
  }).join('')
  const matcher = new RegExp(`^${pattern}$`, 'i')
  const reference = new Date(referenceTime)
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
      return Number.isFinite(new Date(stamp).valueOf()) ? stamp : undefined
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
    if (dayLabel) {
      const suffix = date >= 11 && date <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][date % 10] ?? 'th'
      if (dayLabel.toLowerCase() !== `${date}${suffix}`) return
    }
    let hour = get(['H', 'HH', 'h', 'hh'], 0)
    const meridiem = parts.get('a') ?? parts.get('A')
    if ((meridiem || parts.has('h') || parts.has('hh')) && (hour < 1 || hour > 12)) return
    if (meridiem) hour = hour % 12 + (meridiem.toLowerCase() === 'pm' ? 12 : 0)
    const minute = get(['m', 'mm'], 0)
    const second = get(['s', 'ss'], 0)
    const fraction = parts.get('SSS') ?? parts.get('SS') ?? parts.get('S') ?? ''
    if (month < 1 || month > 12 || date < 1 || date > 31 || hour > 23 || minute > 59 || second > 59) return
    const time = new Date(0)
    time.setUTCFullYear(year, ordinal === undefined ? month - 1 : 0, ordinal ?? date)
    time.setUTCHours(hour, minute, second, Number(fraction.padEnd(3, '0')))
    if (time.getUTCFullYear() !== year || (ordinal === undefined && (time.getUTCMonth() !== month - 1 || time.getUTCDate() !== date))) return
    const zone = /([+-])(\d{2}):?(\d{2})/.exec(parts.get('Z') ?? parts.get('ZZ') ?? '')
    if (zone && (Number(zone[2]) > 23 || Number(zone[3]) > 59)) return
    const offset = zone ? (zone[1] === '-' ? -1 : 1) * (Number(zone[2]) * 60 + Number(zone[3])) * 60000 : 0
    return time.valueOf() - offset
  }
}

export function defaultGanttAxisFormat(format: string): string {
  const tokens = format.match(inputTokens) ?? []
  const hours = tokens.some(token => /^[Hh]{1,2}$/.test(token) || token === 'X' || token === 'x')
  const minutes = hours || tokens.some(token => /^m{1,2}$/.test(token))
  const seconds = tokens.some(token => /^s{1,2}$/.test(token))
  const fractions = tokens.some(token => /^S{1,3}$/.test(token))
  const leading = [hours && '%H', minutes && '%M', seconds && '%S'].filter(Boolean).join(':')
  return fractions ? (leading ? `${leading}.%L` : '%L') : leading || '%b %d'
}

export function durationEnd(start: number, spec: string, mode: 'elapsed' | 'calendar' = 'elapsed'): number | undefined {
  const [, digits, unit] = /^(\d+(?:\.\d+)?)(ms|[smhdwMy])$/.exec(spec) ?? []
  if (!digits) return
  const amount = Number(digits)
  if (!Number.isFinite(amount)) return
  const units: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: dayMs, w: 7 * dayMs }
  if (mode === 'calendar' && (unit === 'd' || unit === 'w'))
    return start + Math.round(amount * (unit === 'w' ? 7 : 1)) * dayMs
  if (unit !== 'M' && unit !== 'y') return start + amount * units[unit]
  const date = new Date(start)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  const months = unit === 'y' ? amount * 12 : amount
  if (mode === 'calendar' && unit === 'y') date.setUTCFullYear(Math.trunc(date.getUTCFullYear() + amount))
  else date.setUTCMonth(date.getUTCMonth() + Math.floor(months))
  const last = new Date(date)
  last.setUTCMonth(last.getUTCMonth() + 1, 0)
  date.setUTCDate(Math.min(day, last.getUTCDate()))
  return Number(date) + (mode === 'calendar' ? 0 : (months % 1) * 30 * dayMs)
}

const tickIntervals = {
  millisecond: utcMillisecond, second: utcSecond, minute: utcMinute, hour: utcHour,
  day: utcDay, month: utcMonth, year: utcYear,
} as const
const weekIntervals = [utcSunday, utcMonday, utcTuesday, utcWednesday, utcThursday, utcFriday, utcSaturday]

export function ganttTicks(start: number, end: number, spec: string, defaultWeekStart = 'sunday'): number[] {
  const [, amount, unit, weekStart] = /^([1-9]\d{0,2})(millisecond|second|minute|hour|day|week|month|year)(?:s)?(?:\s+([a-z]+))?$/.exec(spec) ?? []
  const interval = unit === 'week' ? weekIntervals[Math.max(0, weekdays.indexOf(weekStart ?? defaultWeekStart))]
    : tickIntervals[unit as keyof typeof tickIntervals]
  const step = interval?.every?.(Number(amount))
  if (step) {
    const ticks: number[] = []
    // Fall back to automatic ticks for crowded axes instead of truncating the grid.
    let tick = +step.ceil(Math.ceil(start))
    while (ticks.length < 60 && tick <= end) {
      ticks.push(tick)
      tick = +step.offset(tick)
    }
    if (!(tick <= end)) return ticks.length ? ticks : [start]
  }
  const ticks = utcTicks(Math.ceil(start), Math.floor(end), 10).map(Number)
  return ticks.length ? ticks : [start]
}
