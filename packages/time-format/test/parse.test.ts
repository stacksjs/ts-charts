import { describe, expect, it } from 'bun:test'
import { timeFormatLocale, timeParse } from '../src/index.ts'
import type { TimeLocaleDefinition } from '../src/index.ts'
import { local } from './date.ts'

const fiFi: TimeLocaleDefinition = {
  dateTime: '%A, %-d. %Bta %Y klo %X',
  date: '%-d.%-m.%Y',
  time: '%H:%M:%S',
  periods: ['a.m.', 'p.m.'],
  days: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
  shortDays: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
  months: ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'],
  shortMonths: ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu'],
}

describe('parse', () => {
  it('parse(string) coerces the specified string to a string', () => {
    const p = timeParse('%c')
    expect(p({ toString() { return '1/1/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 1))
    expect(p({ toString() { return '1/2/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 2))
    expect(p({ toString() { return '1/3/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 3))
    expect(p({ toString() { return '1/4/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 4))
    expect(p({ toString() { return '1/5/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 5))
    expect(p({ toString() { return '1/6/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 6))
    expect(p({ toString() { return '1/7/1990, 12:00:00 AM' } } as any)).toEqual(local(1990, 0, 7))
  })

  it('timeParse(specifier) coerces the specified specifier to a string', () => {
    const p = timeParse({ toString() { return '%c' } } as any)
    expect(p('1/1/1990, 12:00:00 AM')).toEqual(local(1990, 0, 1))
  })

  it('timeParse("%a %m/%d/%Y")(date) parses abbreviated weekday and date', () => {
    const p = timeParse('%a %m/%d/%Y')
    expect(p('Sun 01/01/1990')).toEqual(local(1990, 0, 1))
    expect(p('Wed 02/03/1991')).toEqual(local(1991, 1, 3))
    expect(p('XXX 03/10/2010')).toBe(null)
  })

  it('timeParse("%A %m/%d/%Y")(date) parses weekday and date', () => {
    const p = timeParse('%A %m/%d/%Y')
    expect(p('Sunday 01/01/1990')).toEqual(local(1990, 0, 1))
    expect(p('Wednesday 02/03/1991')).toEqual(local(1991, 1, 3))
    expect(p('Caturday 03/10/2010')).toBe(null)
  })

  it('timeParse("%U %Y")(date) parses week number (Sunday) and year', () => {
    const p = timeParse('%U %Y')
    expect(p('00 1990')).toEqual(local(1989, 11, 31))
    expect(p('05 1991')).toEqual(local(1991,  1,  3))
    expect(p('01 1995')).toEqual(local(1995,  0,  1))
  })

  it('timeParse("%a %U %Y")(date) parses abbreviated weekday, week number (Sunday) and year', () => {
    const p = timeParse('%a %U %Y')
    expect(p('Mon 00 1990')).toEqual(local(1990, 0, 1))
    expect(p('Sun 05 1991')).toEqual(local(1991, 1, 3))
    expect(p('Sun 01 1995')).toEqual(local(1995, 0, 1))
    expect(p('XXX 03 2010')).toBe(null)
  })

  it('timeParse("%A %U %Y")(date) parses weekday, week number (Sunday) and year', () => {
    const p = timeParse('%A %U %Y')
    expect(p('Monday 00 1990')).toEqual(local(1990, 0, 1))
    expect(p('Sunday 05 1991')).toEqual(local(1991, 1, 3))
    expect(p('Sunday 01 1995')).toEqual(local(1995, 0, 1))
    expect(p('Caturday 03 2010')).toBe(null)
  })

  it('timeParse("%w %U %Y")(date) parses numeric weekday (Sunday), week number (Sunday) and year', () => {
    const p = timeParse('%w %U %Y')
    expect(p('1 00 1990')).toEqual(local(1990, 0, 1))
    expect(p('0 05 1991')).toEqual(local(1991, 1, 3))
    expect(p('0 01 1995')).toEqual(local(1995, 0, 1))
    expect(p('X 03 2010')).toBe(null)
  })

  it('timeParse("%w %V %G")(date) parses numeric weekday, week number (ISO) and corresponding year', () => {
    const p = timeParse('%w %V %G')
    expect(p('1 01 1990')).toEqual(local(1990,  0,  1))
    expect(p('0 05 1991')).toEqual(local(1991,  1,  3))
    expect(p('4 53 1992')).toEqual(local(1992, 11, 31))
    expect(p('0 52 1994')).toEqual(local(1995,  0,  1))
    expect(p('0 01 1995')).toEqual(local(1995,  0,  8))
    expect(p('1 01 2018')).toEqual(local(2018,  0,  1))
    expect(p('1 01 2019')).toEqual(local(2018,  11,  31))
  })

  it('timeParse("%w %V %g")(date) parses numeric weekday, week number (ISO) and corresponding two-digits year', () => {
    const p = timeParse('%w %V %g')
    expect(p('1 01 90')).toEqual(local(1990,  0,  1))
    expect(p('0 05 91')).toEqual(local(1991,  1,  3))
    expect(p('4 53 92')).toEqual(local(1992, 11, 31))
    expect(p('0 52 94')).toEqual(local(1995,  0,  1))
    expect(p('0 01 95')).toEqual(local(1995,  0,  8))
    expect(p('1 01 18')).toEqual(local(2018,  0,  1))
    expect(p('1 01 19')).toEqual(local(2018, 11, 31))
  })

  it('timeParse("%V %g")(date) parses week number (ISO) and corresponding two-digits year', () => {
    const p = timeParse('%V %g')
    expect(p('01 90')).toEqual(local(1990,  0,  1))
    expect(p('05 91')).toEqual(local(1991,  0, 28))
    expect(p('53 92')).toEqual(local(1992, 11, 28))
    expect(p('52 94')).toEqual(local(1994, 11, 26))
    expect(p('01 95')).toEqual(local(1995,  0,  2))
    expect(p('01 18')).toEqual(local(2018,  0,  1))
    expect(p('01 19')).toEqual(local(2018, 11, 31))
  })

  it('timeParse("%u %U %Y")(date) parses numeric weekday (Monday), week number (Monday) and year', () => {
    const p = timeParse('%u %W %Y')
    expect(p('1 00 1990')).toEqual(local(1989, 11, 25))
    expect(p('1 01 1990')).toEqual(local(1990, 0, 1))
    expect(p('1 05 1991')).toEqual(local(1991, 1, 4))
    expect(p('7 00 1995')).toEqual(local(1995, 0, 1))
    expect(p('1 01 1995')).toEqual(local(1995, 0, 2))
    expect(p('X 03 2010')).toBe(null)
  })

  it('timeParse("%W %Y")(date) parses week number (Monday) and year', () => {
    const p = timeParse('%W %Y')
    expect(p('01 1990')).toEqual(local(1990,  0,  1))
    expect(p('04 1991')).toEqual(local(1991,  0, 28))
    expect(p('00 1995')).toEqual(local(1994, 11, 26))
  })

  it('timeParse("%a %W %Y")(date) parses abbreviated weekday, week number (Monday) and year', () => {
    const p = timeParse('%a %W %Y')
    expect(p('Mon 01 1990')).toEqual(local(1990, 0, 1))
    expect(p('Sun 04 1991')).toEqual(local(1991, 1, 3))
    expect(p('Sun 00 1995')).toEqual(local(1995, 0, 1))
    expect(p('XXX 03 2010')).toBe(null)
  })

  it('timeParse("%A %W %Y")(date) parses weekday, week number (Monday) and year', () => {
    const p = timeParse('%A %W %Y')
    expect(p('Monday 01 1990')).toEqual(local(1990, 0, 1))
    expect(p('Sunday 04 1991')).toEqual(local(1991, 1, 3))
    expect(p('Sunday 00 1995')).toEqual(local(1995, 0, 1))
    expect(p('Caturday 03 2010')).toBe(null)
  })

  it('timeParse("%w %W %Y")(date) parses numeric weekday (Sunday), week number (Monday) and year', () => {
    const p = timeParse('%w %W %Y')
    expect(p('1 01 1990')).toEqual(local(1990, 0, 1))
    expect(p('0 04 1991')).toEqual(local(1991, 1, 3))
    expect(p('0 00 1995')).toEqual(local(1995, 0, 1))
    expect(p('X 03 2010')).toBe(null)
  })

  it('timeParse("%u %W %Y")(date) parses numeric weekday (Monday), week number (Monday) and year', () => {
    const p = timeParse('%u %W %Y')
    expect(p('1 01 1990')).toEqual(local(1990, 0, 1))
    expect(p('7 04 1991')).toEqual(local(1991, 1, 3))
    expect(p('7 00 1995')).toEqual(local(1995, 0, 1))
    expect(p('X 03 2010')).toBe(null)
  })

  it('timeParse("%m/%d/%y")(date) parses month, date and two-digit year', () => {
    const p = timeParse('%m/%d/%y')
    expect(p('02/03/69')).toEqual(local(1969, 1, 3))
    expect(p('01/01/90')).toEqual(local(1990, 0, 1))
    expect(p('02/03/91')).toEqual(local(1991, 1, 3))
    expect(p('02/03/68')).toEqual(local(2068, 1, 3))
    expect(p('03/10/2010')).toBe(null)
  })

  it('timeParse("%x")(date) parses locale date', () => {
    const p = timeParse('%x')
    expect(p('1/1/1990')).toEqual(local(1990, 0, 1))
    expect(p('2/3/1991')).toEqual(local(1991, 1, 3))
    expect(p('3/10/2010')).toEqual(local(2010, 2, 10))
  })

  it('timeParse("%b %d, %Y")(date) parses abbreviated month, date and year', () => {
    const p = timeParse('%b %d, %Y')
    expect(p('jan 01, 1990')).toEqual(local(1990, 0, 1))
    expect(p('feb  2, 2010')).toEqual(local(2010, 1, 2))
    expect(p('jan. 1, 1990')).toBe(null)
  })

  it('timeParse("%B %d, %Y")(date) parses month, date and year', () => {
    const p = timeParse('%B %d, %Y')
    expect(p('january 01, 1990')).toEqual(local(1990, 0, 1))
    expect(p('February  2, 2010')).toEqual(local(2010, 1, 2))
    expect(p('jan 1, 1990')).toBe(null)
  })

  it('timeParse("%j %m/%d/%Y")(date) parses day of year and date', () => {
    const p = timeParse('%j %m/%d/%Y')
    expect(p('001 01/01/1990')).toEqual(local(1990, 0, 1))
    expect(p('034 02/03/1991')).toEqual(local(1991, 1, 3))
    expect(p('2012 03/10/2010')).toBe(null)
  })

  it('timeParse("%c")(date) parses locale date and time', () => {
    const p = timeParse('%c')
    expect(p('1/1/1990, 12:00:00 AM')).toEqual(local(1990, 0, 1))
  })

  it('timeParse("%H:%M:%S")(date) parses twenty-four hour, minute and second', () => {
    const p = timeParse('%H:%M:%S')
    expect(p('00:00:00')).toEqual(local(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59')).toEqual(local(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00')).toEqual(local(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01')).toEqual(local(1900, 0, 1, 12, 0, 1))
    expect(p('23:59:59')).toEqual(local(1900, 0, 1, 23, 59, 59))
  })

  it('timeParse("%X")(date) parses locale time', () => {
    const p = timeParse('%X')
    expect(p('12:00:00 AM')).toEqual(local(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59 AM')).toEqual(local(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00 PM')).toEqual(local(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01 PM')).toEqual(local(1900, 0, 1, 12, 0, 1))
    expect(p('11:59:59 PM')).toEqual(local(1900, 0, 1, 23, 59, 59))
  })

  it('timeParse("%L")(date) parses milliseconds', () => {
    const p = timeParse('%L')
    expect(p('432')).toEqual(local(1900, 0, 1, 0, 0, 0, 432))
  })

  it('timeParse("%f")(date) parses microseconds', () => {
    const p = timeParse('%f')
    expect(p('432000')).toEqual(local(1900, 0, 1, 0, 0, 0, 432))
  })

  it('timeParse("%I:%M:%S %p")(date) parses twelve hour, minute and second', () => {
    const p = timeParse('%I:%M:%S %p')
    expect(p('12:00:00 am')).toEqual(local(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59 AM')).toEqual(local(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00 pm')).toEqual(local(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01 pm')).toEqual(local(1900, 0, 1, 12, 0, 1))
    expect(p('11:59:59 PM')).toEqual(local(1900, 0, 1, 23, 59, 59))
  })

  it('timeParse("%I %p")(date) parses period in non-English locales', () => {
    const p = timeFormatLocale(fiFi).parse('%I:%M:%S %p')
    expect(p('12:00:00 a.m.')).toEqual(local(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59 A.M.')).toEqual(local(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00 p.m.')).toEqual(local(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01 p.m.')).toEqual(local(1900, 0, 1, 12, 0, 1))
    expect(p('11:59:59 P.M.')).toEqual(local(1900, 0, 1, 23, 59, 59))
  })

  it('timeParse("%Y %q")(date) parses quarters', () => {
    const p = timeParse('%Y %q')
    expect(p('1990 1')).toEqual(local(1990, 0, 1))
    expect(p('1990 2')).toEqual(local(1990, 3, 1))
    expect(p('1990 3')).toEqual(local(1990, 6, 1))
    expect(p('1990 4')).toEqual(local(1990, 9, 1))
  })

  it('timeParse("%Y %q %m")(date) gives the month number priority', () => {
    const p = timeParse('%Y %q %m')
    expect(p('1990 1 2')).toEqual(local(1990, 1, 1))
    expect(p('1990 2 5')).toEqual(local(1990, 4, 1))
    expect(p('1990 3 8')).toEqual(local(1990, 7, 1))
    expect(p('1990 4 9')).toEqual(local(1990, 8, 1))
  })

  it('timeParse("%% %m/%d/%Y")(date) parses literal %', () => {
    const p = timeParse('%% %m/%d/%Y')
    expect(p('% 01/01/1990')).toEqual(local(1990, 0, 1))
    expect(p('% 02/03/1991')).toEqual(local(1991, 1, 3))
    expect(p('%% 03/10/2010')).toBe(null)
  })

  it('timeParse("%m/%d/%Y %Z")(date) parses timezone offset', () => {
    const p = timeParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 +0000')).toEqual(local(1990, 0, 1, 16))
    expect(p('01/02/1990 +0100')).toEqual(local(1990, 0, 1, 15))
    expect(p('01/02/1990 +0130')).toEqual(local(1990, 0, 1, 14, 30))
    expect(p('01/02/1990 -0100')).toEqual(local(1990, 0, 1, 17))
    expect(p('01/02/1990 -0130')).toEqual(local(1990, 0, 1, 17, 30))
    expect(p('01/02/1990 -0800')).toEqual(local(1990, 0, 2, 0))
  })

  it('timeParse("%m/%d/%Y %Z")(date) parses timezone offset in the form \'+-hh:mm\'', () => {
    const p = timeParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 +01:30')).toEqual(local(1990, 0, 1, 14, 30))
    expect(p('01/02/1990 -01:30')).toEqual(local(1990, 0, 1, 17, 30))
  })

  it('timeParse("%m/%d/%Y %Z")(date) parses timezone offset in the form \'+-hh\'', () => {
    const p = timeParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 +01')).toEqual(local(1990, 0, 1, 15))
    expect(p('01/02/1990 -01')).toEqual(local(1990, 0, 1, 17))
  })

  it('timeParse("%m/%d/%Y %Z")(date) parses timezone offset in the form \'Z\'', () => {
    const p = timeParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 Z')).toEqual(local(1990, 0, 1, 16))
  })

  it('timeParse("%-m/%0d/%_Y")(date) ignores optional padding modifier, skipping zeroes and spaces', () => {
    const p = timeParse('%-m/%0d/%_Y')
    expect(p('01/ 1/1990')).toEqual(local(1990, 0, 1))
  })

  it('timeParse("%b %d, %Y")(date) doesn\'t crash when given weird strings', () => {
    try {
      (Object.prototype as any).foo = 10
      const p = timeParse('%b %d, %Y')
      expect(p('foo 1, 1990')).toBe(null)
    } finally {
      delete (Object.prototype as any).foo
    }
  })
})
