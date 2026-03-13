import {
  timeDay,
  timeSunday,
  timeMonday,
  timeThursday,
  timeYear,
  // eslint-disable-next-line pickier/no-unused-vars
  utcDay,
  utcSunday,
  utcMonday,
  utcThursday,
  utcYear,
} from '@ts-charts/time'

export interface TimeLocaleDefinition {
  dateTime: string
  date: string
  time: string
  periods: [string, string]
  days: [string, string, string, string, string, string, string]
  shortDays: [string, string, string, string, string, string, string]
  months: [string, string, string, string, string, string, string, string, string, string, string, string]
  shortMonths: [string, string, string, string, string, string, string, string, string, string, string, string]
}

export interface TimeLocaleObject {
  format: (specifier: string) => (date: Date | number) => string
  parse: (specifier: string) => (string: string) => Date | null
  utcFormat: (specifier: string) => (date: Date | number) => string
  utcParse: (specifier: string) => (string: string) => Date | null
}

interface DateFields {
  y: number
  m: number | undefined
  d: number
  H: number
  M: number
  S: number
  L: number
  w?: number
  u?: number
  U?: number
  V?: number
  W?: number
  Z?: number
  p?: number
  q?: number
  Q?: number
  s?: number
}

// eslint-disable-next-line pickier/no-unused-vars
type FormatFn = ((d: Date, p: string) => string | number) | ((d: Date) => string | number) | null
// eslint-disable-next-line pickier/no-unused-vars
type ParseFn = (d: DateFields, string: string, i: number) => number
type FormatMap = Record<string, FormatFn>
type ParseMap = Record<string, ParseFn>

function localDate(d: DateFields): Date {
  if (0 <= d.y && d.y < 100) {
    const date = new Date(-1, d.m as number, d.d, d.H, d.M, d.S, d.L)
    date.setFullYear(d.y)
    return date
  }
  return new Date(d.y, d.m as number, d.d, d.H, d.M, d.S, d.L)
}

function utcDate(d: DateFields): Date {
  if (0 <= d.y && d.y < 100) {
    const date = new Date(Date.UTC(-1, d.m as number, d.d, d.H, d.M, d.S, d.L))
    date.setUTCFullYear(d.y)
    return date
  }
  return new Date(Date.UTC(d.y, d.m as number, d.d, d.H, d.M, d.S, d.L))
}

function newDate(y: number, m: number | undefined, d: number): DateFields {
  return { y, m, d, H: 0, M: 0, S: 0, L: 0 }
}

export default function formatLocale(locale: TimeLocaleDefinition): TimeLocaleObject {
  const locale_dateTime = locale.dateTime
  const locale_date = locale.date
  const locale_time = locale.time
  const locale_periods = locale.periods
  const locale_weekdays = locale.days
  const locale_shortWeekdays = locale.shortDays
  const locale_months = locale.months
  const locale_shortMonths = locale.shortMonths

  const periodRe = formatRe(locale_periods)
  const periodLookup = formatLookup(locale_periods)
  const weekdayRe = formatRe(locale_weekdays)
  const weekdayLookup = formatLookup(locale_weekdays)
  const shortWeekdayRe = formatRe(locale_shortWeekdays)
  const shortWeekdayLookup = formatLookup(locale_shortWeekdays)
  const monthRe = formatRe(locale_months)
  const monthLookup = formatLookup(locale_months)
  const shortMonthRe = formatRe(locale_shortMonths)
  const shortMonthLookup = formatLookup(locale_shortMonths)

  const formats: FormatMap = {
    'a': formatShortWeekday,
    'A': formatWeekday,
    'b': formatShortMonth,
    'B': formatMonth,
    'c': null,
    'd': formatDayOfMonth,
    'e': formatDayOfMonth,
    'f': formatMicroseconds,
    'g': formatYearISO,
    'G': formatFullYearISO,
    'H': formatHour24,
    'I': formatHour12,
    'j': formatDayOfYear,
    'L': formatMilliseconds,
    'm': formatMonthNumber,
    'M': formatMinutes,
    'p': formatPeriod,
    'q': formatQuarter,
    'Q': formatUnixTimestamp,
    's': formatUnixTimestampSeconds,
    'S': formatSeconds,
    'u': formatWeekdayNumberMonday,
    'U': formatWeekNumberSunday,
    'V': formatWeekNumberISO,
    'w': formatWeekdayNumberSunday,
    'W': formatWeekNumberMonday,
    'x': null,
    'X': null,
    'y': formatYear,
    'Y': formatFullYear,
    'Z': formatZone,
    '%': formatLiteralPercent,
  }

  const utcFormats: FormatMap = {
    'a': formatUTCShortWeekday,
    'A': formatUTCWeekday,
    'b': formatUTCShortMonth,
    'B': formatUTCMonth,
    'c': null,
    'd': formatUTCDayOfMonth,
    'e': formatUTCDayOfMonth,
    'f': formatUTCMicroseconds,
    'g': formatUTCYearISO,
    'G': formatUTCFullYearISO,
    'H': formatUTCHour24,
    'I': formatUTCHour12,
    'j': formatUTCDayOfYear,
    'L': formatUTCMilliseconds,
    'm': formatUTCMonthNumber,
    'M': formatUTCMinutes,
    'p': formatUTCPeriod,
    'q': formatUTCQuarter,
    'Q': formatUnixTimestamp,
    's': formatUnixTimestampSeconds,
    'S': formatUTCSeconds,
    'u': formatUTCWeekdayNumberMonday,
    'U': formatUTCWeekNumberSunday,
    'V': formatUTCWeekNumberISO,
    'w': formatUTCWeekdayNumberSunday,
    'W': formatUTCWeekNumberMonday,
    'x': null,
    'X': null,
    'y': formatUTCYear,
    'Y': formatUTCFullYear,
    'Z': formatUTCZone,
    '%': formatLiteralPercent,
  }

  const parses: ParseMap = {
    'a': parseShortWeekday,
    'A': parseWeekday,
    'b': parseShortMonth,
    'B': parseMonth,
    'c': parseLocaleDateTime,
    'd': parseDayOfMonth,
    'e': parseDayOfMonth,
    'f': parseMicroseconds,
    'g': parseYear,
    'G': parseFullYear,
    'H': parseHour24,
    'I': parseHour24,
    'j': parseDayOfYear,
    'L': parseMilliseconds,
    'm': parseMonthNumber,
    'M': parseMinutes,
    'p': parsePeriod,
    'q': parseQuarter,
    'Q': parseUnixTimestamp,
    's': parseUnixTimestampSeconds,
    'S': parseSeconds,
    'u': parseWeekdayNumberMonday,
    'U': parseWeekNumberSunday,
    'V': parseWeekNumberISO,
    'w': parseWeekdayNumberSunday,
    'W': parseWeekNumberMonday,
    'x': parseLocaleDate,
    'X': parseLocaleTime,
    'y': parseYear,
    'Y': parseFullYear,
    'Z': parseZone,
    '%': parseLiteralPercent,
  }

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats)
  formats.X = newFormat(locale_time, formats)
  formats.c = newFormat(locale_dateTime, formats)
  utcFormats.x = newFormat(locale_date, utcFormats)
  utcFormats.X = newFormat(locale_time, utcFormats)
  utcFormats.c = newFormat(locale_dateTime, utcFormats)

  function newFormat(specifier: string, formats: FormatMap): (date: Date | number) => string {
    return function (date: Date | number): string {
      const string: (string | number)[] = []
      let i = -1
      let j = 0
      const n = specifier.length
      let c: string
      let pad: string
      let format: FormatFn

      if (!(date instanceof Date)) date = new Date(+date)

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i))
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i)
          else pad = c === 'e' ? ' ' : '0'
          if ((format = formats[c])) c = format(date, pad) as string
          string.push(c)
          j = i + 1
        }
      }

      string.push(specifier.slice(j, i))
      return string.join('')
    }
  }

  function newParse(specifier: string, Z: boolean): (string: string) => Date | null {
    return function (string: string): Date | null {
      const d = newDate(1900, undefined, 1)
      const i = parseSpecifier(d, specifier, string += '', 0)
      let week: Date, day: number
      if (i != string.length) return null

      // If a UNIX timestamp is specified, return it.
      if ('Q' in d) return new Date(d.Q!)
      if ('s' in d) return new Date(d.s! * 1000 + ('L' in d ? d.L : 0))

      // If this is utcParse, never use the local timezone.
      if (Z && !('Z' in d)) d.Z = 0

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ('p' in d) d.H = d.H % 12 + d.p! * 12

      // If the month was not specified, inherit from the quarter.
      if (d.m === undefined) d.m = 'q' in d ? d.q : 0

      // Convert day-of-week and week-of-year to day-of-year.
      if ('V' in d) {
        if (d.V! < 1 || d.V! > 53) return null
        if (!('w' in d)) d.w = 1
        if ('Z' in d) {
          week = utcDate(newDate(d.y, 0, 1))
          day = week.getUTCDay()
          week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week)
          week = utcDay.offset(week, (d.V! - 1) * 7)
          d.y = week.getUTCFullYear()
          d.m = week.getUTCMonth()
          d.d = week.getUTCDate() + (d.w! + 6) % 7
        }
        else {
          week = localDate(newDate(d.y, 0, 1))
          day = week.getDay()
          week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week)
          week = timeDay.offset(week, (d.V! - 1) * 7)
          d.y = week.getFullYear()
          d.m = week.getMonth()
          d.d = week.getDate() + (d.w! + 6) % 7
        }
      }
      else if ('W' in d || 'U' in d) {
        if (!('w' in d)) d.w = 'u' in d ? d.u! % 7 : 'W' in d ? 1 : 0
        day = 'Z' in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay()
        d.m = 0
        d.d = 'W' in d ? (d.w! + 6) % 7 + d.W! * 7 - (day + 5) % 7 : d.w! + d.U! * 7 - (day + 6) % 7
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ('Z' in d) {
        d.H += d.Z! / 100 | 0
        d.M += d.Z! % 100
        return utcDate(d)
      }

      // Otherwise, all fields are in local time.
      return localDate(d)
    }
  }

  function parseSpecifier(d: DateFields, specifier: string, string: string, j: number): number {
    let i = 0
    const n = specifier.length
    const m = string.length
    let c: number | string
    let parse: ParseFn

    while (i < n) {
      if (j >= m) return -1
      c = specifier.charCodeAt(i++)
      if (c === 37) {
        c = specifier.charAt(i++)
        parse = parses[(c as string) in pads ? specifier.charAt(i++) : (c as string)]
        if (!parse || ((j = parse(d, string, j)) < 0)) return -1
      }
      else if (c != string.charCodeAt(j++)) {
        return -1
      }
    }

    return j
  }

  function parsePeriod(d: DateFields, string: string, i: number): number {
    const n = periodRe.exec(string.slice(i))
    return n ? (d.p = periodLookup.get(n[0].toLowerCase())!, i + n[0].length) : -1
  }

  function parseShortWeekday(d: DateFields, string: string, i: number): number {
    const n = shortWeekdayRe.exec(string.slice(i))
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase())!, i + n[0].length) : -1
  }

  function parseWeekday(d: DateFields, string: string, i: number): number {
    const n = weekdayRe.exec(string.slice(i))
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase())!, i + n[0].length) : -1
  }

  function parseShortMonth(d: DateFields, string: string, i: number): number {
    const n = shortMonthRe.exec(string.slice(i))
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase())!, i + n[0].length) : -1
  }

  function parseMonth(d: DateFields, string: string, i: number): number {
    const n = monthRe.exec(string.slice(i))
    return n ? (d.m = monthLookup.get(n[0].toLowerCase())!, i + n[0].length) : -1
  }

  function parseLocaleDateTime(d: DateFields, string: string, i: number): number {
    return parseSpecifier(d, locale_dateTime, string, i)
  }

  function parseLocaleDate(d: DateFields, string: string, i: number): number {
    return parseSpecifier(d, locale_date, string, i)
  }

  function parseLocaleTime(d: DateFields, string: string, i: number): number {
    return parseSpecifier(d, locale_time, string, i)
  }

  function formatShortWeekday(d: Date): string {
    return locale_shortWeekdays[d.getDay()]
  }

  function formatWeekday(d: Date): string {
    return locale_weekdays[d.getDay()]
  }

  function formatShortMonth(d: Date): string {
    return locale_shortMonths[d.getMonth()]
  }

  function formatMonth(d: Date): string {
    return locale_months[d.getMonth()]
  }

  function formatPeriod(d: Date): string {
    return locale_periods[+(d.getHours() >= 12)]
  }

  function formatQuarter(d: Date): number {
    return 1 + ~~(d.getMonth() / 3)
  }

  function formatUTCShortWeekday(d: Date): string {
    return locale_shortWeekdays[d.getUTCDay()]
  }

  function formatUTCWeekday(d: Date): string {
    return locale_weekdays[d.getUTCDay()]
  }

  function formatUTCShortMonth(d: Date): string {
    return locale_shortMonths[d.getUTCMonth()]
  }

  function formatUTCMonth(d: Date): string {
    return locale_months[d.getUTCMonth()]
  }

  function formatUTCPeriod(d: Date): string {
    return locale_periods[+(d.getUTCHours() >= 12)]
  }

  function formatUTCQuarter(d: Date): number {
    return 1 + ~~(d.getUTCMonth() / 3)
  }

  return {
    format(specifier: string): (date: Date | number) => string {
      const f = newFormat(specifier += '', formats)
      return Object.assign(f, { toString(): string { return specifier } })
    },
    parse(specifier: string): (string: string) => Date | null {
      const p = newParse(specifier += '', false)
      return Object.assign(p, { toString(): string { return specifier } })
    },
    utcFormat(specifier: string): (date: Date | number) => string {
      const f = newFormat(specifier += '', utcFormats)
      return Object.assign(f, { toString(): string { return specifier } })
    },
    utcParse(specifier: string): (string: string) => Date | null {
      const p = newParse(specifier += '', true)
      return Object.assign(p, { toString(): string { return specifier } })
    },
  }
}

// eslint-disable-next-line pickier/no-unused-vars
const pads: Record<string, string> = { '-': '', '_': ' ', '0': '0' }
const numberRe = /^\s*\d+/ // note: ignores next directive
const percentRe = /^%/
const requoteRe = /[\\^$*+?|[\]().{}]/g

function pad(value: number, fill: string, width: number): string {
  const sign = value < 0 ? '-' : ''
  const string = `${sign ? -value : value}`
  const length = string.length
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string)
}

function requote(s: string): string {
  return s.replace(requoteRe, '\\$&')
}

function formatRe(names: readonly string[]): RegExp {
  // eslint-disable-next-line pickier/no-unused-vars
  return new RegExp(`^(?:${names.map(requote).join('|')})`, 'i')
}

function formatLookup(names: readonly string[]): Map<string, number> {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]))
}

function parseWeekdayNumberSunday(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 1))
  return n ? (d.w = +n[0], i + n[0].length) : -1
}

function parseWeekdayNumberMonday(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 1))
  return n ? (d.u = +n[0], i + n[0].length) : -1
}

function parseWeekNumberSunday(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.U = +n[0], i + n[0].length) : -1
}

function parseWeekNumberISO(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.V = +n[0], i + n[0].length) : -1
}

function parseWeekNumberMonday(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.W = +n[0], i + n[0].length) : -1
}

function parseFullYear(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 4))
  return n ? (d.y = +n[0], i + n[0].length) : -1
}

function parseYear(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1
}

function parseZone(d: DateFields, string: string, i: number): number {
  const n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6))
  return n ? (d.Z = n[1] ? 0 : -(+(n[2] + (n[3] || '00'))), i + n[0].length) : -1
}

function parseQuarter(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 1))
  return n ? (d.q = +n[0] * 3 - 3, i + n[0].length) : -1
}

function parseMonthNumber(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.m = +n[0] - 1, i + n[0].length) : -1
}

function parseDayOfMonth(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.d = +n[0], i + n[0].length) : -1
}

function parseDayOfYear(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 3))
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1
}

function parseHour24(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.H = +n[0], i + n[0].length) : -1
}

function parseMinutes(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.M = +n[0], i + n[0].length) : -1
}

function parseSeconds(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 2))
  return n ? (d.S = +n[0], i + n[0].length) : -1
}

function parseMilliseconds(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 3))
  return n ? (d.L = +n[0], i + n[0].length) : -1
}

function parseMicroseconds(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i, i + 6))
  return n ? (d.L = Math.floor(+n[0] / 1000), i + n[0].length) : -1
}

function parseLiteralPercent(_d: DateFields, string: string, i: number): number {
  const n = percentRe.exec(string.slice(i, i + 1))
  return n ? i + n[0].length : -1
}

function parseUnixTimestamp(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i))
  return n ? (d.Q = +n[0], i + n[0].length) : -1
}

function parseUnixTimestampSeconds(d: DateFields, string: string, i: number): number {
  const n = numberRe.exec(string.slice(i))
  return n ? (d.s = +n[0], i + n[0].length) : -1
}

function formatDayOfMonth(d: Date, p: string): string {
  return pad(d.getDate(), p, 2)
}

function formatHour24(d: Date, p: string): string {
  return pad(d.getHours(), p, 2)
}

function formatHour12(d: Date, p: string): string {
  return pad(d.getHours() % 12 || 12, p, 2)
}

function formatDayOfYear(d: Date, p: string): string {
  return pad(1 + timeDay.count!(timeYear(d), d), p, 3)
}

function formatMilliseconds(d: Date, p: string): string {
  return pad(d.getMilliseconds(), p, 3)
}

function formatMicroseconds(d: Date, p: string): string {
  return `${formatMilliseconds(d, p)}000`
}

function formatMonthNumber(d: Date, p: string): string {
  return pad(d.getMonth() + 1, p, 2)
}

function formatMinutes(d: Date, p: string): string {
  return pad(d.getMinutes(), p, 2)
}

function formatSeconds(d: Date, p: string): string {
  return pad(d.getSeconds(), p, 2)
}

function formatWeekdayNumberMonday(d: Date): number {
  const day = d.getDay()
  return day === 0 ? 7 : day
}

function formatWeekNumberSunday(d: Date, p: string): string {
  return pad(timeSunday.count!(timeYear(d).getTime() - 1, d), p, 2)
}

function dISO(d: Date): Date {
  const day = d.getDay()
  return (day >= 4 || day === 0) ? timeThursday(d) : timeThursday.ceil(d)
}

function formatWeekNumberISO(d: Date, p: string): string {
  d = dISO(d)
  return pad(timeThursday.count!(timeYear(d), d) + (timeYear(d).getDay() === 4 ? 1 : 0), p, 2)
}

function formatWeekdayNumberSunday(d: Date): number {
  return d.getDay()
}

function formatWeekNumberMonday(d: Date, p: string): string {
  return pad(timeMonday.count!(timeYear(d).getTime() - 1, d), p, 2)
}

function formatYear(d: Date, p: string): string {
  return pad(d.getFullYear() % 100, p, 2)
}

function formatYearISO(d: Date, p: string): string {
  d = dISO(d)
  return pad(d.getFullYear() % 100, p, 2)
}

function formatFullYear(d: Date, p: string): string {
  return pad(d.getFullYear() % 10000, p, 4)
}

function formatFullYearISO(d: Date, p: string): string {
  const day = d.getDay()
  d = (day >= 4 || day === 0) ? timeThursday(d) : timeThursday.ceil(d)
  return pad(d.getFullYear() % 10000, p, 4)
}

function formatZone(d: Date): string {
  let z = d.getTimezoneOffset()
  return (z > 0 ? '-' : (z *= -1, '+'))
      + pad(z / 60 | 0, '0', 2)
      + pad(z % 60, '0', 2)
}

function formatUTCDayOfMonth(d: Date, p: string): string {
  return pad(d.getUTCDate(), p, 2)
}

function formatUTCHour24(d: Date, p: string): string {
  return pad(d.getUTCHours(), p, 2)
}

function formatUTCHour12(d: Date, p: string): string {
  return pad(d.getUTCHours() % 12 || 12, p, 2)
}

function formatUTCDayOfYear(d: Date, p: string): string {
  return pad(1 + utcDay.count!(utcYear(d), d), p, 3)
}

function formatUTCMilliseconds(d: Date, p: string): string {
  return pad(d.getUTCMilliseconds(), p, 3)
}

function formatUTCMicroseconds(d: Date, p: string): string {
  return `${formatUTCMilliseconds(d, p)}000`
}

function formatUTCMonthNumber(d: Date, p: string): string {
  return pad(d.getUTCMonth() + 1, p, 2)
}

function formatUTCMinutes(d: Date, p: string): string {
  return pad(d.getUTCMinutes(), p, 2)
}

function formatUTCSeconds(d: Date, p: string): string {
  return pad(d.getUTCSeconds(), p, 2)
}

function formatUTCWeekdayNumberMonday(d: Date): number {
  const dow = d.getUTCDay()
  return dow === 0 ? 7 : dow
}

function formatUTCWeekNumberSunday(d: Date, p: string): string {
  return pad(utcSunday.count!(utcYear(d).getTime() - 1, d), p, 2)
}

function UTCdISO(d: Date): Date {
  const day = d.getUTCDay()
  return (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d)
}

function formatUTCWeekNumberISO(d: Date, p: string): string {
  d = UTCdISO(d)
  return pad(utcThursday.count!(utcYear(d), d) + (utcYear(d).getUTCDay() === 4 ? 1 : 0), p, 2)
}

function formatUTCWeekdayNumberSunday(d: Date): number {
  return d.getUTCDay()
}

function formatUTCWeekNumberMonday(d: Date, p: string): string {
  return pad(utcMonday.count!(utcYear(d).getTime() - 1, d), p, 2)
}

function formatUTCYear(d: Date, p: string): string {
  return pad(d.getUTCFullYear() % 100, p, 2)
}

function formatUTCYearISO(d: Date, p: string): string {
  d = UTCdISO(d)
  return pad(d.getUTCFullYear() % 100, p, 2)
}

function formatUTCFullYear(d: Date, p: string): string {
  return pad(d.getUTCFullYear() % 10000, p, 4)
}

function formatUTCFullYearISO(d: Date, p: string): string {
  const day = d.getUTCDay()
  d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d)
  return pad(d.getUTCFullYear() % 10000, p, 4)
}

function formatUTCZone(): string {
  return '+0000'
}

function formatLiteralPercent(): string {
  return '%'
}

function formatUnixTimestamp(d: Date): number {
  return +d
}

function formatUnixTimestampSeconds(d: Date): number {
  return Math.floor(+d / 1000)
}
