import { describe, expect, it } from 'bun:test'
import { timeSecond, timeMinute, timeHour, timeDay, timeMonth, timeWeek, timeYear } from '@ts-charts/time'
import { timeFormat } from '../src/index.ts'
import { local } from './date.ts'

const formatMillisecond = timeFormat('.%L')
const formatSecond = timeFormat(':%S')
const formatMinute = timeFormat('%I:%M')
const formatHour = timeFormat('%I %p')
const formatDay = timeFormat('%a %d')
const formatWeek = timeFormat('%b %d')
const formatMonth = timeFormat('%B')
const formatYear = timeFormat('%Y')

function multi(d: Date): string {
  return (timeSecond(d) < d ? formatMillisecond
      : timeMinute(d) < d ? formatSecond
      : timeHour(d) < d ? formatMinute
      : timeDay(d) < d ? formatHour
      : timeMonth(d) < d ? (timeWeek(d) < d ? formatDay : formatWeek)
      : timeYear(d) < d ? formatMonth
      : formatYear)(d)
}

describe('timeFormat', () => {
  it('timeFormat(date) coerces the specified date to a Date', () => {
    const f = timeFormat('%c')
    expect(f(+local(1990, 0, 1))).toBe('1/1/1990, 12:00:00 AM')
    expect(f(+local(1990, 0, 2))).toBe('1/2/1990, 12:00:00 AM')
    expect(f(+local(1990, 0, 3))).toBe('1/3/1990, 12:00:00 AM')
    expect(f(+local(1990, 0, 4))).toBe('1/4/1990, 12:00:00 AM')
    expect(f(+local(1990, 0, 5))).toBe('1/5/1990, 12:00:00 AM')
    expect(f(+local(1990, 0, 6))).toBe('1/6/1990, 12:00:00 AM')
    expect(f(+local(1990, 0, 7))).toBe('1/7/1990, 12:00:00 AM')
  })

  it('timeFormat("%a")(date) formats abbreviated weekdays', () => {
    const f = timeFormat('%a')
    expect(f(local(1990, 0, 1))).toBe('Mon')
    expect(f(local(1990, 0, 2))).toBe('Tue')
    expect(f(local(1990, 0, 3))).toBe('Wed')
    expect(f(local(1990, 0, 4))).toBe('Thu')
    expect(f(local(1990, 0, 5))).toBe('Fri')
    expect(f(local(1990, 0, 6))).toBe('Sat')
    expect(f(local(1990, 0, 7))).toBe('Sun')
  })

  it('timeFormat("%A")(date) formats weekdays', () => {
    const f = timeFormat('%A')
    expect(f(local(1990, 0, 1))).toBe('Monday')
    expect(f(local(1990, 0, 2))).toBe('Tuesday')
    expect(f(local(1990, 0, 3))).toBe('Wednesday')
    expect(f(local(1990, 0, 4))).toBe('Thursday')
    expect(f(local(1990, 0, 5))).toBe('Friday')
    expect(f(local(1990, 0, 6))).toBe('Saturday')
    expect(f(local(1990, 0, 7))).toBe('Sunday')
  })

  it('timeFormat("%b")(date) formats abbreviated months', () => {
    const f = timeFormat('%b')
    expect(f(local(1990,  0, 1))).toBe('Jan')
    expect(f(local(1990,  1, 1))).toBe('Feb')
    expect(f(local(1990,  2, 1))).toBe('Mar')
    expect(f(local(1990,  3, 1))).toBe('Apr')
    expect(f(local(1990,  4, 1))).toBe('May')
    expect(f(local(1990,  5, 1))).toBe('Jun')
    expect(f(local(1990,  6, 1))).toBe('Jul')
    expect(f(local(1990,  7, 1))).toBe('Aug')
    expect(f(local(1990,  8, 1))).toBe('Sep')
    expect(f(local(1990,  9, 1))).toBe('Oct')
    expect(f(local(1990, 10, 1))).toBe('Nov')
    expect(f(local(1990, 11, 1))).toBe('Dec')
  })

  it('timeFormat("%B")(date) formats months', () => {
    const f = timeFormat('%B')
    expect(f(local(1990,  0, 1))).toBe('January')
    expect(f(local(1990,  1, 1))).toBe('February')
    expect(f(local(1990,  2, 1))).toBe('March')
    expect(f(local(1990,  3, 1))).toBe('April')
    expect(f(local(1990,  4, 1))).toBe('May')
    expect(f(local(1990,  5, 1))).toBe('June')
    expect(f(local(1990,  6, 1))).toBe('July')
    expect(f(local(1990,  7, 1))).toBe('August')
    expect(f(local(1990,  8, 1))).toBe('September')
    expect(f(local(1990,  9, 1))).toBe('October')
    expect(f(local(1990, 10, 1))).toBe('November')
    expect(f(local(1990, 11, 1))).toBe('December')
  })

  it('timeFormat("%c")(date) formats localized dates and times', () => {
    const f = timeFormat('%c')
    expect(f(local(1990, 0, 1))).toBe('1/1/1990, 12:00:00 AM')
  })

  it('timeFormat("%d")(date) formats zero-padded dates', () => {
    const f = timeFormat('%d')
    expect(f(local(1990, 0, 1))).toBe('01')
  })

  it('timeFormat("%e")(date) formats space-padded dates', () => {
    const f = timeFormat('%e')
    expect(f(local(1990, 0, 1))).toBe(' 1')
  })

  it('timeFormat("%g")(date) formats zero-padded two-digit ISO 8601 years', () => {
    const f = timeFormat('%g')
    expect(f(local(2018, 11, 30, 0))).toBe('18') // Sunday
    expect(f(local(2018, 11, 31, 0))).toBe('19') // Monday
    expect(f(local(2019, 0, 1, 0))).toBe('19')
  })

  it('timeFormat("%G")(date) formats zero-padded four-digit ISO 8601 years', () => {
    const f = timeFormat('%G')
    expect(f(local(2018, 11, 30, 0))).toBe('2018') // Sunday
    expect(f(local(2018, 11, 31, 0))).toBe('2019') // Monday
    expect(f(local(2019, 0, 1, 0))).toBe('2019')
  })

  it('timeFormat("%H")(date) formats zero-padded hours (24)', () => {
    const f = timeFormat('%H')
    expect(f(local(1990, 0, 1,  0))).toBe('00')
    expect(f(local(1990, 0, 1, 13))).toBe('13')
  })

  it('timeFormat("%I")(date) formats zero-padded hours (12)', () => {
    const f = timeFormat('%I')
    expect(f(local(1990, 0, 1,  0))).toBe('12')
    expect(f(local(1990, 0, 1, 13))).toBe('01')
  })

  it('timeFormat("%j")(date) formats zero-padded day of year numbers', () => {
    const f = timeFormat('%j')
    expect(f(local(1990,  0,  1))).toBe('001')
    expect(f(local(1990,  5,  1))).toBe('152')
    expect(f(local(2010,  2, 13))).toBe('072')
    expect(f(local(2010,  2, 14))).toBe('073') // DST begins
    expect(f(local(2010,  2, 15))).toBe('074')
    expect(f(local(2010, 10,  6))).toBe('310')
    expect(f(local(2010, 10,  7))).toBe('311') // DST ends
    expect(f(local(2010, 10,  8))).toBe('312')
  })

  it('timeFormat("%m")(date) formats zero-padded months', () => {
    const f = timeFormat('%m')
    expect(f(local(1990, 0, 1))).toBe('01')
    expect(f(local(1990, 9, 1))).toBe('10')
  })

  it('timeFormat("%M")(date) formats zero-padded minutes', () => {
    const f = timeFormat('%M')
    expect(f(local(1990, 0, 1, 0,  0))).toBe('00')
    expect(f(local(1990, 0, 1, 0, 32))).toBe('32')
  })

  it('timeFormat("%p")(date) formats AM or PM', () => {
    const f = timeFormat('%p')
    expect(f(local(1990, 0, 1,  0))).toBe('AM')
    expect(f(local(1990, 0, 1, 13))).toBe('PM')
  })

  it('timeFormat("%q")(date) formats quarters', () => {
    const f = timeFormat('%q')
    expect(f(local(1990, 0, 1))).toBe('1')
    expect(f(local(1990, 3, 1))).toBe('2')
    expect(f(local(1990, 6, 1))).toBe('3')
    expect(f(local(1990, 9, 1))).toBe('4')
  })

  it('timeFormat("%S")(date) formats zero-padded seconds', () => {
    const f = timeFormat('%S')
    expect(f(local(1990, 0, 1, 0, 0,  0))).toBe('00')
    expect(f(local(1990, 0, 1, 0, 0, 32))).toBe('32')
    const f2 = timeFormat('%0S')
    expect(f2(local(1990, 0, 1, 0, 0,  0))).toBe('00')
    expect(f2(local(1990, 0, 1, 0, 0, 32))).toBe('32')
  })

  it('timeFormat("%_S")(date) formats space-padded seconds', () => {
    const f = timeFormat('%_S')
    expect(f(local(1990, 0, 1, 0, 0,  0))).toBe(' 0')
    expect(f(local(1990, 0, 1, 0, 0,  3))).toBe(' 3')
    expect(f(local(1990, 0, 1, 0, 0, 32))).toBe('32')
  })

  it('timeFormat("-S")(date) formats no-padded seconds', () => {
    const f = timeFormat('%-S')
    expect(f(local(1990, 0, 1, 0, 0,  0))).toBe('0')
    expect(f(local(1990, 0, 1, 0, 0,  3))).toBe('3')
    expect(f(local(1990, 0, 1, 0, 0, 32))).toBe('32')
  })

  it('timeFormat("%L")(date) formats zero-padded milliseconds', () => {
    const f = timeFormat('%L')
    expect(f(local(1990, 0, 1, 0, 0, 0,   0))).toBe('000')
    expect(f(local(1990, 0, 1, 0, 0, 0, 432))).toBe('432')
  })

  it('timeFormat("%u")(date) formats week day numbers', () => {
    const f = timeFormat('%u')
    expect(f(local(1990,  0,  1,  0))).toBe('1')
    expect(f(local(1990,  0,  7,  0))).toBe('7')
    expect(f(local(2010,  2, 13, 23))).toBe('6')
  })

  it('timeFormat("%f")(date) formats zero-padded microseconds', () => {
    const f = timeFormat('%f')
    expect(f(local(1990, 0, 1, 0, 0, 0,   0))).toBe('000000')
    expect(f(local(1990, 0, 1, 0, 0, 0, 432))).toBe('432000')
  })

  it('timeFormat("%U")(date) formats zero-padded week numbers', () => {
    const f = timeFormat('%U')
    expect(f(local(1990,  0,  1,  0))).toBe('00')
    expect(f(local(1990,  5,  1,  0))).toBe('21')
    expect(f(local(2010,  2, 13, 23))).toBe('10')
    expect(f(local(2010,  2, 14,  0))).toBe('11') // DST begins
    expect(f(local(2010,  2, 15,  0))).toBe('11')
    expect(f(local(2010, 10,  6, 23))).toBe('44')
    expect(f(local(2010, 10,  7,  0))).toBe('45') // DST ends
    expect(f(local(2010, 10,  8,  0))).toBe('45')
    expect(f(local(2012,  0,  1,  0))).toBe('01') // Sunday!
  })

  it('timeFormat("%W")(date) formats zero-padded week numbers', () => {
    const f = timeFormat('%W')
    expect(f(local(1990,  0,  1,  0))).toBe('01') // Monday!
    expect(f(local(1990,  5,  1,  0))).toBe('22')
    expect(f(local(2010,  2, 15,  0))).toBe('11')
    expect(f(local(2010, 10,  8,  0))).toBe('45')
  })

  it('timeFormat("%V")(date) formats zero-padded ISO 8601 week numbers', () => {
    const f = timeFormat('%V')
    expect(f(local(1990,  0,  1,  0))).toBe('01')
    expect(f(local(1990,  5,  1,  0))).toBe('22')
    expect(f(local(2010,  2, 13, 23))).toBe('10')
    expect(f(local(2010,  2, 14,  0))).toBe('10') // DST begins
    expect(f(local(2010,  2, 15,  0))).toBe('11')
    expect(f(local(2010, 10,  6, 23))).toBe('44')
    expect(f(local(2010, 10,  7,  0))).toBe('44') // DST ends
    expect(f(local(2010, 10,  8,  0))).toBe('45')
    expect(f(local(2015, 11,  31, 0))).toBe('53')
    expect(f(local(2016,  0,  1,  0))).toBe('53')
  })

  it('timeFormat("%x")(date) formats localized dates', () => {
    const f = timeFormat('%x')
    expect(f(local(1990, 0, 1))).toBe('1/1/1990')
    expect(f(local(2010, 5, 1))).toBe('6/1/2010')
  })

  it('timeFormat("%X")(date) formats localized times', () => {
    const f = timeFormat('%X')
    expect(f(local(1990, 0, 1,  0,  0,  0))).toBe('12:00:00 AM')
    expect(f(local(1990, 0, 1, 13, 34, 59))).toBe('1:34:59 PM')
  })

  it('timeFormat("%y")(date) formats zero-padded two-digit years', () => {
    const f = timeFormat('%y')
    expect(f(local(+1990, 0, 1))).toBe('90')
    expect(f(local(+2002, 0, 1))).toBe('02')
    expect(f(local(-2, 0, 1))).toBe('-02')
  })

  it('timeFormat("%Y")(date) formats zero-padded four-digit years', () => {
    const f = timeFormat('%Y')
    expect(f(local(  123, 0, 1))).toBe('0123')
    expect(f(local( 1990, 0, 1))).toBe('1990')
    expect(f(local( 2002, 0, 1))).toBe('2002')
    expect(f(local(10002, 0, 1))).toBe('0002')
    expect(f(local(   -2, 0, 1))).toBe('-0002')
  })

  it('timeFormat("%Z")(date) formats time zones', () => {
    const f = timeFormat('%Z')
    expect(f(local(1990, 0, 1))).toBe('-0800')
  })

  it('timeFormat("%%")(date) formats literal percent signs', () => {
    const f = timeFormat('%%')
    expect(f(local(1990, 0, 1))).toBe('%')
  })

  it('timeFormat(...) can be used to create a conditional multi-format', () => {
    expect(multi(local(1990, 0, 1, 0, 0, 0, 12))).toBe('.012')
    expect(multi(local(1990, 0, 1, 0, 0, 1,  0))).toBe(':01')
    expect(multi(local(1990, 0, 1, 0, 1, 0,  0))).toBe('12:01')
    expect(multi(local(1990, 0, 1, 1, 0, 0,  0))).toBe('01 AM')
    expect(multi(local(1990, 0, 2, 0, 0, 0,  0))).toBe('Tue 02')
    expect(multi(local(1990, 1, 1, 0, 0, 0,  0))).toBe('February')
    expect(multi(local(1990, 0, 1, 0, 0, 0,  0))).toBe('1990')
  })
})
