import { describe, expect, it } from 'bun:test'
import { utcSecond, utcMinute, utcHour, utcDay, utcMonth, utcWeek, utcYear } from '@ts-charts/time'
import { utcFormat } from '../src/index.ts'
import { utc } from './date.ts'

const formatMillisecond = utcFormat('.%L')
const formatSecond = utcFormat(':%S')
const formatMinute = utcFormat('%I:%M')
const formatHour = utcFormat('%I %p')
const formatDay = utcFormat('%a %d')
const formatWeek = utcFormat('%b %d')
const formatMonth = utcFormat('%B')
const formatYear = utcFormat('%Y')

function multi(d: Date): string {
  return (utcSecond(d) < d ? formatMillisecond
      : utcMinute(d) < d ? formatSecond
      : utcHour(d) < d ? formatMinute
      : utcDay(d) < d ? formatHour
      : utcMonth(d) < d ? (utcWeek(d) < d ? formatDay : formatWeek)
      : utcYear(d) < d ? formatMonth
      : formatYear)(d)
}

describe('utcFormat', () => {
  it('utcFormat("%a")(date) formats abbreviated weekdays', () => {
    const f = utcFormat('%a')
    expect(f(utc(1990, 0, 1))).toBe('Mon')
    expect(f(utc(1990, 0, 2))).toBe('Tue')
    expect(f(utc(1990, 0, 3))).toBe('Wed')
    expect(f(utc(1990, 0, 4))).toBe('Thu')
    expect(f(utc(1990, 0, 5))).toBe('Fri')
    expect(f(utc(1990, 0, 6))).toBe('Sat')
    expect(f(utc(1990, 0, 7))).toBe('Sun')
  })

  it('utcFormat("%A")(date) formats weekdays', () => {
    const f = utcFormat('%A')
    expect(f(utc(1990, 0, 1))).toBe('Monday')
    expect(f(utc(1990, 0, 2))).toBe('Tuesday')
    expect(f(utc(1990, 0, 3))).toBe('Wednesday')
    expect(f(utc(1990, 0, 4))).toBe('Thursday')
    expect(f(utc(1990, 0, 5))).toBe('Friday')
    expect(f(utc(1990, 0, 6))).toBe('Saturday')
    expect(f(utc(1990, 0, 7))).toBe('Sunday')
  })

  it('utcFormat("%b")(date) formats abbreviated months', () => {
    const f = utcFormat('%b')
    expect(f(utc(1990,  0, 1))).toBe('Jan')
    expect(f(utc(1990,  1, 1))).toBe('Feb')
    expect(f(utc(1990,  2, 1))).toBe('Mar')
    expect(f(utc(1990,  3, 1))).toBe('Apr')
    expect(f(utc(1990,  4, 1))).toBe('May')
    expect(f(utc(1990,  5, 1))).toBe('Jun')
    expect(f(utc(1990,  6, 1))).toBe('Jul')
    expect(f(utc(1990,  7, 1))).toBe('Aug')
    expect(f(utc(1990,  8, 1))).toBe('Sep')
    expect(f(utc(1990,  9, 1))).toBe('Oct')
    expect(f(utc(1990, 10, 1))).toBe('Nov')
    expect(f(utc(1990, 11, 1))).toBe('Dec')
  })

  it('utcFormat("%B")(date) formats months', () => {
    const f = utcFormat('%B')
    expect(f(utc(1990,  0, 1))).toBe('January')
    expect(f(utc(1990,  1, 1))).toBe('February')
    expect(f(utc(1990,  2, 1))).toBe('March')
    expect(f(utc(1990,  3, 1))).toBe('April')
    expect(f(utc(1990,  4, 1))).toBe('May')
    expect(f(utc(1990,  5, 1))).toBe('June')
    expect(f(utc(1990,  6, 1))).toBe('July')
    expect(f(utc(1990,  7, 1))).toBe('August')
    expect(f(utc(1990,  8, 1))).toBe('September')
    expect(f(utc(1990,  9, 1))).toBe('October')
    expect(f(utc(1990, 10, 1))).toBe('November')
    expect(f(utc(1990, 11, 1))).toBe('December')
  })

  it('utcFormat("%c")(date) formats localized dates and times', () => {
    const f = utcFormat('%c')
    expect(f(utc(1990, 0, 1))).toBe('1/1/1990, 12:00:00 AM')
  })

  it('utcFormat("%d")(date) formats zero-padded dates', () => {
    const f = utcFormat('%d')
    expect(f(utc(1990, 0, 1))).toBe('01')
  })

  it('utcFormat("%e")(date) formats space-padded dates', () => {
    const f = utcFormat('%e')
    expect(f(utc(1990, 0, 1))).toBe(' 1')
  })

  it('timeFormat("%g")(date) formats zero-padded two-digit ISO 8601 years', () => {
    const f = utcFormat('%g')
    expect(f(utc(2018, 11, 30, 0))).toBe('18') // Sunday
    expect(f(utc(2018, 11, 31, 0))).toBe('19') // Monday
    expect(f(utc(2019, 0, 1, 0))).toBe('19')
  })

  it('utcFormat("%G")(date) formats zero-padded four-digit ISO 8601 years', () => {
    const f = utcFormat('%G')
    expect(f(utc(2018, 11, 30, 0))).toBe('2018') // Sunday
    expect(f(utc(2018, 11, 31, 0))).toBe('2019') // Monday
    expect(f(utc(2019, 0, 1, 0))).toBe('2019')
  })

  it('utcFormat("%H")(date) formats zero-padded hours (24)', () => {
    const f = utcFormat('%H')
    expect(f(utc(1990, 0, 1,  0))).toBe('00')
    expect(f(utc(1990, 0, 1, 13))).toBe('13')
  })

  it('utcFormat("%I")(date) formats zero-padded hours (12)', () => {
    const f = utcFormat('%I')
    expect(f(utc(1990, 0, 1,  0))).toBe('12')
    expect(f(utc(1990, 0, 1, 13))).toBe('01')
  })

  it('utcFormat("%j")(date) formats zero-padded day of year numbers', () => {
    const f = utcFormat('%j')
    expect(f(utc(1990,  0,  1))).toBe('001')
    expect(f(utc(1990,  5,  1))).toBe('152')
    expect(f(utc(2010,  2, 13))).toBe('072')
    expect(f(utc(2010,  2, 14))).toBe('073') // DST begins
    expect(f(utc(2010,  2, 15))).toBe('074')
    expect(f(utc(2010, 10,  6))).toBe('310')
    expect(f(utc(2010, 10,  7))).toBe('311') // DST ends
    expect(f(utc(2010, 10,  8))).toBe('312')
  })

  it('utcFormat("%m")(date) formats zero-padded months', () => {
    const f = utcFormat('%m')
    expect(f(utc(1990, 0, 1))).toBe('01')
    expect(f(utc(1990, 9, 1))).toBe('10')
  })

  it('utcFormat("%M")(date) formats zero-padded minutes', () => {
    const f = utcFormat('%M')
    expect(f(utc(1990, 0, 1, 0,  0))).toBe('00')
    expect(f(utc(1990, 0, 1, 0, 32))).toBe('32')
  })

  it('utcFormat("%p")(date) formats AM or PM', () => {
    const f = utcFormat('%p')
    expect(f(utc(1990, 0, 1,  0))).toBe('AM')
    expect(f(utc(1990, 0, 1, 13))).toBe('PM')
  })

  it('utcFormat("%q")(date) formats quarters', () => {
    const f = utcFormat('%q')
    expect(f(utc(1990, 0, 1))).toBe('1')
    expect(f(utc(1990, 3, 1))).toBe('2')
    expect(f(utc(1990, 6, 1))).toBe('3')
    expect(f(utc(1990, 9, 1))).toBe('4')
  })

  it('utcFormat("%Q")(date) formats UNIX timestamps', () => {
    const f = utcFormat('%Q')
    expect(f(utc(1970, 0, 1,  0,  0,  0))).toBe('0')
    expect(f(utc(1990, 0, 1,  0,  0,  0))).toBe('631152000000')
    expect(f(utc(1990, 0, 1, 12, 34, 56))).toBe('631197296000')
  })

  it('utcFormat("%s")(date) formats UNIX timetamps in seconds', () => {
    const f = utcFormat('%s')
    expect(f(utc(1970, 0, 1,  0,  0,  0))).toBe('0')
    expect(f(utc(1990, 0, 1,  0,  0,  0))).toBe('631152000')
    expect(f(utc(1990, 0, 1, 12, 34, 56))).toBe('631197296')
  })

  it('utcFormat("%s.%L")(date) formats UNIX timetamps in seconds and milliseconds', () => {
    const f = utcFormat('%s.%L')
    expect(f(utc(1990, 0, 1,  0,  0,  0, 123))).toBe('631152000.123')
    expect(f(utc(1990, 0, 1, 12, 34, 56, 789))).toBe('631197296.789')
  })

  it('utcFormat("%s.%f")(date) formats UNIX timetamps in seconds and microseconds', () => {
    const f = utcFormat('%s.%f')
    expect(f(utc(1990, 0, 1,  0,  0,  0, 123))).toBe('631152000.123000')
    expect(f(utc(1990, 0, 1, 12, 34, 56, 789))).toBe('631197296.789000')
  })

  it('utcFormat("%S")(date) formats zero-padded seconds', () => {
    const f = utcFormat('%S')
    expect(f(utc(1990, 0, 1, 0, 0,  0))).toBe('00')
    expect(f(utc(1990, 0, 1, 0, 0, 32))).toBe('32')
    const f2 = utcFormat('%0S')
    expect(f2(utc(1990, 0, 1, 0, 0,  0))).toBe('00')
    expect(f2(utc(1990, 0, 1, 0, 0, 32))).toBe('32')
  })

  it('utcFormat("%_S")(date) formats space-padded seconds', () => {
    const f = utcFormat('%_S')
    expect(f(utc(1990, 0, 1, 0, 0,  0))).toBe(' 0')
    expect(f(utc(1990, 0, 1, 0, 0,  3))).toBe(' 3')
    expect(f(utc(1990, 0, 1, 0, 0, 32))).toBe('32')
  })

  it('utcFormat("-S")(date) formats no-padded seconds', () => {
    const f = utcFormat('%-S')
    expect(f(utc(1990, 0, 1, 0, 0,  0))).toBe('0')
    expect(f(utc(1990, 0, 1, 0, 0,  3))).toBe('3')
    expect(f(utc(1990, 0, 1, 0, 0, 32))).toBe('32')
  })

  it('utcFormat("%L")(date) formats zero-padded milliseconds', () => {
    const f = utcFormat('%L')
    expect(f(utc(1990, 0, 1, 0, 0, 0,   0))).toBe('000')
    expect(f(utc(1990, 0, 1, 0, 0, 0, 432))).toBe('432')
  })

  it('utcFormat("%u")(date) formats week day numbers', () => {
    const f = utcFormat('%u')
    expect(f(utc(1990,  0,  1,  0))).toBe('1')
    expect(f(utc(1990,  0,  7,  0))).toBe('7')
    expect(f(utc(2010,  2, 13, 23))).toBe('6')
  })

  it('utcFormat("%f")(date) formats zero-padded microseconds', () => {
    const f = utcFormat('%f')
    expect(f(utc(1990, 0, 1, 0, 0, 0,   0))).toBe('000000')
    expect(f(utc(1990, 0, 1, 0, 0, 0, 432))).toBe('432000')
  })

  it('utcFormat("%U")(date) formats zero-padded week numbers', () => {
    const f = utcFormat('%U')
    expect(f(utc(1990,  0,  1,  0))).toBe('00')
    expect(f(utc(1990,  5,  1,  0))).toBe('21')
    expect(f(utc(2010,  2, 13, 23))).toBe('10')
    expect(f(utc(2010,  2, 14,  0))).toBe('11') // DST begins
    expect(f(utc(2010,  2, 15,  0))).toBe('11')
    expect(f(utc(2010, 10,  6, 23))).toBe('44')
    expect(f(utc(2010, 10,  7,  0))).toBe('45') // DST ends
    expect(f(utc(2010, 10,  8,  0))).toBe('45')
    expect(f(utc(2012,  0,  1,  0))).toBe('01') // Sunday!
  })

  it('utcFormat("%W")(date) formats zero-padded week numbers', () => {
    const f = utcFormat('%W')
    expect(f(utc(1990,  0,  1,  0))).toBe('01') // Monday!
    expect(f(utc(1990,  5,  1,  0))).toBe('22')
    expect(f(utc(2010,  2, 15,  0))).toBe('11')
    expect(f(utc(2010, 10,  8,  0))).toBe('45')
  })

  it('utcFormat("%V")(date) formats zero-padded ISO 8601 week numbers', () => {
    const f = utcFormat('%V')
    expect(f(utc(1990,  0,  1,  0))).toBe('01')
    expect(f(utc(1990,  5,  1,  0))).toBe('22')
    expect(f(utc(2010,  2, 13, 23))).toBe('10')
    expect(f(utc(2010,  2, 14,  0))).toBe('10') // DST begins
    expect(f(utc(2010,  2, 15,  0))).toBe('11')
    expect(f(utc(2010, 10,  6, 23))).toBe('44')
    expect(f(utc(2010, 10,  7,  0))).toBe('44') // DST ends
    expect(f(utc(2010, 10,  8,  0))).toBe('45')
    expect(f(utc(2015, 11,  31, 0))).toBe('53')
    expect(f(utc(2016,  0,  1,  0))).toBe('53')
  })

  it('utcFormat("%x")(date) formats localized dates', () => {
    const f = utcFormat('%x')
    expect(f(utc(1990, 0, 1))).toBe('1/1/1990')
    expect(f(utc(2010, 5, 1))).toBe('6/1/2010')
  })

  it('utcFormat("%X")(date) formats localized times', () => {
    const f = utcFormat('%X')
    expect(f(utc(1990, 0, 1,  0,  0,  0))).toBe('12:00:00 AM')
    expect(f(utc(1990, 0, 1, 13, 34, 59))).toBe('1:34:59 PM')
  })

  it('utcFormat("%y")(date) formats zero-padded two-digit years', () => {
    const f = utcFormat('%y')
    expect(f(utc(+1990, 0, 1))).toBe('90')
    expect(f(utc(+2002, 0, 1))).toBe('02')
    expect(f(utc(-2, 0, 1))).toBe('-02')
  })

  it('utcFormat("%Y")(date) formats zero-padded four-digit years', () => {
    const f = utcFormat('%Y')
    expect(f(utc(  123, 0, 1))).toBe('0123')
    expect(f(utc( 1990, 0, 1))).toBe('1990')
    expect(f(utc( 2002, 0, 1))).toBe('2002')
    expect(f(utc(10002, 0, 1))).toBe('0002')
    expect(f(utc(   -2, 0, 1))).toBe('-0002')
  })

  it('utcFormat("%Z")(date) formats time zones', () => {
    const f = utcFormat('%Z')
    expect(f(utc(1990, 0, 1))).toBe('+0000')
  })

  it('utcFormat("%%")(date) formats literal percent signs', () => {
    const f = utcFormat('%%')
    expect(f(utc(1990, 0, 1))).toBe('%')
  })

  it('utcFormat(...) can be used to create a conditional multi-format', () => {
    expect(multi(utc(1990, 0, 1, 0, 0, 0, 12))).toBe('.012')
    expect(multi(utc(1990, 0, 1, 0, 0, 1,  0))).toBe(':01')
    expect(multi(utc(1990, 0, 1, 0, 1, 0,  0))).toBe('12:01')
    expect(multi(utc(1990, 0, 1, 1, 0, 0,  0))).toBe('01 AM')
    expect(multi(utc(1990, 0, 2, 0, 0, 0,  0))).toBe('Tue 02')
    expect(multi(utc(1990, 1, 1, 0, 0, 0,  0))).toBe('February')
    expect(multi(utc(1990, 0, 1, 0, 0, 0,  0))).toBe('1990')
  })
})
