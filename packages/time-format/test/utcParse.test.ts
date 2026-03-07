import { describe, expect, it } from 'bun:test'
import { utcParse } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('utcParse', () => {
  it('utcParse(specifier) coerces the specified specifier to a string', () => {
    const p = utcParse({ toString() { return '%c' } } as any)
    expect(p('1/1/1990, 12:00:00 AM')).toEqual(utc(1990, 0, 1))
  })

  it('utcParse("")(date) parses abbreviated weekday and numeric date', () => {
    const p = utcParse('%a %m/%d/%Y')
    expect(p('Sun 01/01/1990')).toEqual(utc(1990, 0, 1))
    expect(p('Wed 02/03/1991')).toEqual(utc(1991, 1, 3))
    expect(p('XXX 03/10/2010')).toBe(null)
  })

  it('utcParse("")(date) parses weekday and numeric date', () => {
    const p = utcParse('%A %m/%d/%Y')
    expect(p('Sunday 01/01/1990')).toEqual(utc(1990, 0, 1))
    expect(p('Wednesday 02/03/1991')).toEqual(utc(1991, 1, 3))
    expect(p('Caturday 03/10/2010')).toBe(null)
  })

  it('utcParse("")(date) parses numeric date', () => {
    const p = utcParse('%m/%d/%y')
    expect(p('01/01/90')).toEqual(utc(1990, 0, 1))
    expect(p('02/03/91')).toEqual(utc(1991, 1, 3))
    expect(p('03/10/2010')).toBe(null)
  })

  it('utcParse("")(date) parses locale date', () => {
    const p = utcParse('%x')
    expect(p('01/01/1990')).toEqual(utc(1990, 0, 1))
    expect(p('02/03/1991')).toEqual(utc(1991, 1, 3))
    expect(p('03/10/2010')).toEqual(utc(2010, 2, 10))
  })

  it('utcParse("")(date) parses abbreviated month, date and year', () => {
    const p = utcParse('%b %d, %Y')
    expect(p('jan 01, 1990')).toEqual(utc(1990, 0, 1))
    expect(p('feb  2, 2010')).toEqual(utc(2010, 1, 2))
    expect(p('jan. 1, 1990')).toBe(null)
  })

  it('utcParse("")(date) parses month, date and year', () => {
    const p = utcParse('%B %d, %Y')
    expect(p('january 01, 1990')).toEqual(utc(1990, 0, 1))
    expect(p('February  2, 2010')).toEqual(utc(2010, 1, 2))
    expect(p('jan 1, 1990')).toBe(null)
  })

  it('utcParse("")(date) parses locale date and time', () => {
    const p = utcParse('%c')
    expect(p('1/1/1990, 12:00:00 AM')).toEqual(utc(1990, 0, 1))
  })

  it('utcParse("")(date) parses twenty-four hour, minute and second', () => {
    const p = utcParse('%H:%M:%S')
    expect(p('00:00:00')).toEqual(utc(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59')).toEqual(utc(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00')).toEqual(utc(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01')).toEqual(utc(1900, 0, 1, 12, 0, 1))
    expect(p('23:59:59')).toEqual(utc(1900, 0, 1, 23, 59, 59))
  })

  it('utcParse("")(date) parses locale time', () => {
    const p = utcParse('%X')
    expect(p('12:00:00 AM')).toEqual(utc(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59 AM')).toEqual(utc(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00 PM')).toEqual(utc(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01 PM')).toEqual(utc(1900, 0, 1, 12, 0, 1))
    expect(p('11:59:59 PM')).toEqual(utc(1900, 0, 1, 23, 59, 59))
  })

  it('utcParse("%L")(date) parses milliseconds', () => {
    const p = utcParse('%L')
    expect(p('432')).toEqual(utc(1900, 0, 1, 0, 0, 0, 432))
  })

  it('utcParse("%f")(date) parses microseconds', () => {
    const p = utcParse('%f')
    expect(p('432000')).toEqual(utc(1900, 0, 1, 0, 0, 0, 432))
  })

  it('utcParse("")(date) parses twelve hour, minute and second', () => {
    const p = utcParse('%I:%M:%S %p')
    expect(p('12:00:00 am')).toEqual(utc(1900, 0, 1, 0, 0, 0))
    expect(p('11:59:59 AM')).toEqual(utc(1900, 0, 1, 11, 59, 59))
    expect(p('12:00:00 pm')).toEqual(utc(1900, 0, 1, 12, 0, 0))
    expect(p('12:00:01 pm')).toEqual(utc(1900, 0, 1, 12, 0, 1))
    expect(p('11:59:59 PM')).toEqual(utc(1900, 0, 1, 23, 59, 59))
  })

  it('utcParse("")(date) parses timezone offset', () => {
    const p = utcParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 +0000')).toEqual(utc(1990, 0, 2))
    expect(p('01/02/1990 +0100')).toEqual(utc(1990, 0, 1, 23))
    expect(p('01/02/1990 -0100')).toEqual(utc(1990, 0, 2, 1))
    expect(p('01/02/1990 -0800')).toEqual(local(1990, 0, 2))
  })

  it('utcParse("")(date) parses timezone offset (in the form \'+-hh:mm\')', () => {
    const p = utcParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 +01:30')).toEqual(utc(1990, 0, 1, 22, 30))
    expect(p('01/02/1990 -01:30')).toEqual(utc(1990, 0, 2, 1, 30))
  })

  it('utcParse("")(date) parses timezone offset (in the form \'+-hh\')', () => {
    const p = utcParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 +01')).toEqual(utc(1990, 0, 1, 23))
    expect(p('01/02/1990 -01')).toEqual(utc(1990, 0, 2, 1))
  })

  it('utcParse("")(date) parses timezone offset (in the form \'Z\')', () => {
    const p = utcParse('%m/%d/%Y %Z')
    expect(p('01/02/1990 Z')).toEqual(utc(1990, 0, 2))
  })

  it('utcParse("%Y %U %w")(date) handles a year that starts on Sunday', () => {
    const p = utcParse('%Y %U %w')
    expect(p('2012 01 0')).toEqual(utc(2012,  0,  1))
  })

  it('utcParse("%w %V %Y")(date) parses numeric weekday, week number (ISO) and year', () => {
    const p = utcParse('%w %V %Y')
    expect(p('1 01 1990')).toEqual(utc(1990,  0,  1))
    expect(p('0 05 1991')).toEqual(utc(1991,  1,  3))
    expect(p('4 53 1992')).toEqual(utc(1992, 11, 31))
    expect(p('0 52 1994')).toEqual(utc(1995,  0,  1))
    expect(p('0 01 1995')).toEqual(utc(1995,  0,  8))
    expect(p('X 03 2010')).toBe(null)
  })

  it('utcParse("%w %V %G")(date) parses numeric weekday, week number (ISO) and corresponding year', () => {
    const p = utcParse('%w %V %G')
    expect(p('1 01 1990')).toEqual(utc(1990,  0,  1))
    expect(p('0 05 1991')).toEqual(utc(1991,  1,  3))
    expect(p('4 53 1992')).toEqual(utc(1992, 11, 31))
    expect(p('0 52 1994')).toEqual(utc(1995,  0,  1))
    expect(p('0 01 1995')).toEqual(utc(1995,  0,  8))
    expect(p('1 01 2018')).toEqual(utc(2018, 0, 1))
    expect(p('1 01 2019')).toEqual(utc(2018, 11, 31))
    expect(p('X 03 2010')).toBe(null)
  })

  it('utcParse("%V %Y")(date) week number (ISO) and year', () => {
    const p = utcParse('%V %Y')
    expect(p('01 1990')).toEqual(utc(1990,  0,  1))
    expect(p('05 1991')).toEqual(utc(1991,  0, 28))
    expect(p('53 1992')).toEqual(utc(1992, 11, 28))
    expect(p('01 1993')).toEqual(utc(1993,  0,  4))
    expect(p('01 1995')).toEqual(utc(1995,  0,  2))
    expect(p('00 1995')).toEqual(null)
    expect(p('54 1995')).toEqual(null)
    expect(p('X 1995')).toEqual(null)
  })

  it('utcParse("%V %g")(date) week number (ISO) and corresponding two-digits year', () => {
    const p = utcParse('%V %g')
    expect(p('01 90')).toEqual(utc(1990,  0,  1))
    expect(p('05 91')).toEqual(utc(1991,  0, 28))
    expect(p('53 92')).toEqual(utc(1992, 11, 28))
    expect(p('01 93')).toEqual(utc(1993,  0,  4))
    expect(p('01 95')).toEqual(utc(1995, 0, 2))
    expect(p('01 18')).toEqual(utc(2018, 0, 1))
    expect(p('01 19')).toEqual(utc(2018, 11, 31))
    expect(p('00 95')).toEqual(null)
    expect(p('54 95')).toEqual(null)
    expect(p('X 95')).toEqual(null)
  })

  it('utcParse("%V %G")(date) week number (ISO) and corresponding year', () => {
    const p = utcParse('%V %G')
    expect(p('01 1990')).toEqual(utc(1990,  0,  1))
    expect(p('05 1991')).toEqual(utc(1991,  0, 28))
    expect(p('53 1992')).toEqual(utc(1992, 11, 28))
    expect(p('01 1993')).toEqual(utc(1993,  0,  4))
    expect(p('01 1995')).toEqual(utc(1995, 0, 2))
    expect(p('01 2018')).toEqual(utc(2018, 0, 1))
    expect(p('01 2019')).toEqual(utc(2018, 11, 31))
    expect(p('00 1995')).toEqual(null)
    expect(p('54 1995')).toEqual(null)
    expect(p('X 1995')).toEqual(null)
  })

  it('utcParse("%Q")(date) parses UNIX timestamps', () => {
    const p = utcParse('%Q')
    expect(p('0')).toEqual(utc(1970, 0, 1))
    expect(p('631152000000')).toEqual(utc(1990, 0, 1))
  })

  it('utcParse("%s")(date) parses UNIX timestamps in seconds', () => {
    const p = utcParse('%s')
    expect(p('0')).toEqual(utc(1970, 0, 1))
    expect(p('631152000')).toEqual(utc(1990, 0, 1))
  })

  it('utcParse("%s.%L")(date) parses UNIX timetamps in seconds and milliseconds', () => {
    const p = utcParse('%s.%L')
    expect(p('631152000.123')).toEqual(utc(1990, 0, 1,  0,  0,  0, 123))
    expect(p('631197296.789')).toEqual(utc(1990, 0, 1, 12, 34, 56, 789))
  })

  it('utcParse("%s.%f")(date) parses UNIX timetamps in seconds and microseconds', () => {
    const p = utcParse('%s.%f')
    expect(p('631152000.123000')).toEqual(utc(1990, 0, 1,  0,  0,  0, 123))
    expect(p('631197296.789000')).toEqual(utc(1990, 0, 1, 12, 34, 56, 789))
  })
})
