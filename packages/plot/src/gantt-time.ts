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
    const field = dateFields[token] ?? (/^[MDHhms]{1,2}$/.test(token) ? (token.length === 2 ? '\\d{2}' : '\\d{1,2}') : '')
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

export function durationEnd(start: number, spec: string): number | undefined {
  const [, digits, unit] = /^(\d+(?:\.\d+)?)(ms|[smhdwMy])$/.exec(spec) ?? []
  if (!digits) return
  const amount = Number(digits)
  if (!Number.isFinite(amount)) return
  const units: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: dayMs, w: 7 * dayMs }
  if (unit !== 'M' && unit !== 'y') return start + amount * units[unit]
  const months = unit === 'y' ? amount * 12 : amount
  const date = new Date(start)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + Math.floor(months))
  const last = new Date(date)
  last.setUTCMonth(last.getUTCMonth() + 1, 0)
  date.setUTCDate(Math.min(day, last.getUTCDate()))
  return Number(date) + (months % 1) * 30 * dayMs
}

export function ganttTicks(start: number, end: number, spec: string, defaultWeekStart = 'sunday'): number[] {
  const [, amount, unit, weekStart] = /^(\d{1,3})(millisecond|second|minute|hour|day|week|month|year)(?:s)?(?:\s+([a-z]+))?$/.exec(spec) ?? []
  const values: Record<string, number> = { millisecond: 1, second: 1000, minute: 60000, hour: 3600000, day: dayMs, week: 7 * dayMs }
  const requestedStep = Math.max(1, Number(amount))
  const span = end - start
  const milestones = [1, 1000, 60000, 300000, 900000, 3600000, 10800000, 21600000, 43200000, dayMs, 2 * dayMs, 7 * dayMs, 14 * dayMs, 30 * dayMs, 90 * dayMs, 365 * dayMs]
  const fallback = milestones.find(value => span / value <= 9) ?? Math.ceil(span / (3650 * dayMs)) * 365 * dayMs
  if (unit === 'month' || unit === 'year') {
    const date = new Date(start)
    date.setUTCHours(0, 0, 0, 0)
    date.setUTCDate(1)
    if (unit === 'year') date.setUTCMonth(0)
    const months = requestedStep * (unit === 'year' ? 12 : 1)
    const ticks: number[] = []
    for (let count = 0; date.valueOf() <= end && count < 50; count++) {
      if (date.valueOf() >= start) ticks.push(date.valueOf())
      date.setUTCMonth(date.getUTCMonth() + months)
    }
    return ticks.length ? ticks : [start]
  }
  const step = unit ? requestedStep * values[unit] : fallback
  const weekday = weekdays.indexOf(weekStart ?? defaultWeekStart)
  // The first Sunday on or after the Unix epoch is January 4, 1970.
  const origin = unit === 'week' ? (3 + (weekday < 0 ? 0 : weekday)) * dayMs : 0
  const safeStep = span / step > 60 ? fallback : step
  const first = origin + Math.ceil((start - origin) / safeStep) * safeStep
  const ticks = Array.from({ length: Math.max(0, Math.floor((end - first) / safeStep) + 1) }, (_, index) => first + index * safeStep)
  return ticks.length ? ticks : [start]
}
