import { expect, it } from 'bun:test'
import { interpolateHsl } from '@ts-charts/interpolate'
import { utcDay, utcMinute, utcMonth, utcWeek, utcYear } from '@ts-charts/time'
import { scaleUtc } from '../src/index.ts'
import { utc } from './date.ts'

it('scaleUtc.nice() is an alias for scaleUtc.nice(10)', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 17), utc(2009, 0, 1, 23, 42)])
  expect(x.nice().domain()).toEqual([utc(2009, 0, 1), utc(2009, 0, 2)])
})

it('scaleUtc.nice() can nice sub-second domains', () => {
  const x = scaleUtc().domain([utc(2013, 0, 1, 12, 0, 0, 0), utc(2013, 0, 1, 12, 0, 0, 128)])
  expect(x.nice().domain()).toEqual([utc(2013, 0, 1, 12, 0, 0, 0), utc(2013, 0, 1, 12, 0, 0, 130)])
})

it('scaleUtc.nice() can nice multi-year domains', () => {
  const x = scaleUtc().domain([utc(2001, 0, 1), utc(2138, 0, 1)])
  expect(x.nice().domain()).toEqual([utc(2000, 0, 1), utc(2140, 0, 1)])
})

it('scaleUtc.nice() can nice empty domains', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 12), utc(2009, 0, 1, 0, 12)])
  expect(x.nice().domain()).toEqual([utc(2009, 0, 1, 0, 12), utc(2009, 0, 1, 0, 12)])
})

it('scaleUtc.nice(count) nices using the specified tick count', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 17), utc(2009, 0, 1, 23, 42)])
  expect(x.nice(100).domain()).toEqual([utc(2009, 0, 1, 0, 15), utc(2009, 0, 1, 23, 45)])
  expect(x.nice(10).domain()).toEqual([utc(2009, 0, 1), utc(2009, 0, 2)])
})

it('scaleUtc.nice(interval) nices using the specified time interval', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 12), utc(2009, 0, 1, 23, 48)])
  expect(x.nice(utcDay).domain()).toEqual([utc(2009, 0, 1), utc(2009, 0, 2)])
  expect(x.nice(utcWeek).domain()).toEqual([utc(2008, 11, 28), utc(2009, 0, 4)])
  expect(x.nice(utcMonth).domain()).toEqual([utc(2008, 11, 1), utc(2009, 1, 1)])
  expect(x.nice(utcYear).domain()).toEqual([utc(2008, 0, 1), utc(2010, 0, 1)])
})

it('scaleUtc.nice(interval) can nice empty domains', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 12), utc(2009, 0, 1, 0, 12)])
  expect(x.nice(utcDay).domain()).toEqual([utc(2009, 0, 1), utc(2009, 0, 2)])
})

it('scaleUtc.nice(interval) can nice a polylinear domain, only affecting its extent', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 12), utc(2009, 0, 1, 23, 48), utc(2009, 0, 2, 23, 48)]).nice(utcDay)
  expect(x.domain()).toEqual([utc(2009, 0, 1), utc(2009, 0, 1, 23, 48), utc(2009, 0, 3)])
})

it('scaleUtc.nice(interval.every(step)) nices using the specified time interval and step', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1, 0, 12), utc(2009, 0, 1, 23, 48)])
  expect(x.nice(utcDay.every(3)).domain()).toEqual([utc(2009, 0, 1), utc(2009, 0, 4)])
  expect(x.nice(utcWeek.every(2)).domain()).toEqual([utc(2008, 11, 21), utc(2009, 0, 4)])
  expect(x.nice(utcMonth.every(3)).domain()).toEqual([utc(2008, 9, 1), utc(2009, 3, 1)])
  expect(x.nice(utcYear.every(10)).domain()).toEqual([utc(2000, 0, 1), utc(2010, 0, 1)])
})

it('scaleUtc.copy() isolates changes to the domain', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1), utc(2010, 0, 1)]), y = x.copy()
  x.domain([utc(2010, 0, 1), utc(2011, 0, 1)])
  expect(y.domain()).toEqual([utc(2009, 0, 1), utc(2010, 0, 1)])
  expect(x(utc(2010, 0, 1))).toBe(0)
  expect(y(utc(2010, 0, 1))).toBe(1)
  y.domain([utc(2011, 0, 1), utc(2012, 0, 1)])
  expect(x(utc(2011, 0, 1))).toBe(1)
  expect(y(utc(2011, 0, 1))).toBe(0)
  expect(x.domain()).toEqual([utc(2010, 0, 1), utc(2011, 0, 1)])
  expect(y.domain()).toEqual([utc(2011, 0, 1), utc(2012, 0, 1)])
})

it('scaleUtc.copy() isolates changes to the range', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1), utc(2010, 0, 1)]), y = x.copy()
  x.range([1, 2])
  expect(x.invert(1)).toEqual(utc(2009, 0, 1))
  expect(y.invert(1)).toEqual(utc(2010, 0, 1))
  expect(y.range()).toEqual([0, 1])
  y.range([2, 3])
  expect(x.invert(2)).toEqual(utc(2010, 0, 1))
  expect(y.invert(2)).toEqual(utc(2009, 0, 1))
  expect(x.range()).toEqual([1, 2])
  expect(y.range()).toEqual([2, 3])
})

it('scaleUtc.copy() isolates changes to the interpolator', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1), utc(2010, 0, 1)]).range(['red', 'blue'])
  const i = x.interpolate()
  const y = x.copy()
  x.interpolate(interpolateHsl)
  expect(x(utc(2009, 6, 1))).toBe('rgb(255, 0, 253)')
  expect(y(utc(2009, 6, 1))).toBe('rgb(129, 0, 126)')
  expect(y.interpolate()).toBe(i)
})

it('scaleUtc.copy() isolates changes to clamping', () => {
  const x = scaleUtc().domain([utc(2009, 0, 1), utc(2010, 0, 1)]).clamp(true), y = x.copy()
  x.clamp(false)
  expect(x(utc(2011, 0, 1))).toBe(2)
  expect(y(utc(2011, 0, 1))).toBe(1)
  expect(y.clamp()).toBe(true)
  y.clamp(false)
  expect(x(utc(2011, 0, 1))).toBe(2)
  expect(y(utc(2011, 0, 1))).toBe(2)
  expect(x.clamp()).toBe(false)
})

it('scaleUtc.ticks(interval) observes the specified tick interval', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 1, 0), utc(2011, 0, 1, 12, 4, 4)])
  expect(x.ticks(utcMinute)).toEqual([
    utc(2011, 0, 1, 12, 1),
    utc(2011, 0, 1, 12, 2),
    utc(2011, 0, 1, 12, 3),
    utc(2011, 0, 1, 12, 4)
  ])
})

it('scaleUtc.ticks(interval) observes the specified named tick interval', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 1, 0), utc(2011, 0, 1, 12, 4, 4)])
  expect(x.ticks(utcMinute)).toEqual([
    utc(2011, 0, 1, 12, 1),
    utc(2011, 0, 1, 12, 2),
    utc(2011, 0, 1, 12, 3),
    utc(2011, 0, 1, 12, 4)
  ])
})

it('scaleUtc.ticks(interval.every(step)) observes the specified tick interval and step', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 0), utc(2011, 0, 1, 12, 33, 4)])
  expect(x.ticks(utcMinute.every(10))).toEqual([
    utc(2011, 0, 1, 12, 0),
    utc(2011, 0, 1, 12, 10),
    utc(2011, 0, 1, 12, 20),
    utc(2011, 0, 1, 12, 30)
  ])
})

it('scaleUtc.ticks(count) can generate sub-second ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 0), utc(2011, 0, 1, 12, 0, 1)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 0, 0,   0),
    utc(2011, 0, 1, 12, 0, 0, 200),
    utc(2011, 0, 1, 12, 0, 0, 400),
    utc(2011, 0, 1, 12, 0, 0, 600),
    utc(2011, 0, 1, 12, 0, 0, 800),
    utc(2011, 0, 1, 12, 0, 1,   0)
  ])
})

it('scaleUtc.ticks(count) can generate 1-second ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 0), utc(2011, 0, 1, 12, 0, 4)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 0, 0),
    utc(2011, 0, 1, 12, 0, 1),
    utc(2011, 0, 1, 12, 0, 2),
    utc(2011, 0, 1, 12, 0, 3),
    utc(2011, 0, 1, 12, 0, 4)
  ])
})

it('scaleUtc.ticks(count) can generate 5-second ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 0), utc(2011, 0, 1, 12, 0, 20)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 0, 0),
    utc(2011, 0, 1, 12, 0, 5),
    utc(2011, 0, 1, 12, 0, 10),
    utc(2011, 0, 1, 12, 0, 15),
    utc(2011, 0, 1, 12, 0, 20)
  ])
})

it('scaleUtc.ticks(count) can generate 15-second ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 0), utc(2011, 0, 1, 12, 0, 50)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 0, 0),
    utc(2011, 0, 1, 12, 0, 15),
    utc(2011, 0, 1, 12, 0, 30),
    utc(2011, 0, 1, 12, 0, 45)
  ])
})

it('scaleUtc.ticks(count) can generate 30-second ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 0), utc(2011, 0, 1, 12, 1, 50)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 0, 0),
    utc(2011, 0, 1, 12, 0, 30),
    utc(2011, 0, 1, 12, 1, 0),
    utc(2011, 0, 1, 12, 1, 30)
  ])
})

it('scaleUtc.ticks(count) can generate 1-minute ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 0, 27), utc(2011, 0, 1, 12, 4, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 1),
    utc(2011, 0, 1, 12, 2),
    utc(2011, 0, 1, 12, 3),
    utc(2011, 0, 1, 12, 4)
  ])
})

it('scaleUtc.ticks(count) can generate 5-minute ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 3, 27), utc(2011, 0, 1, 12, 21, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 5),
    utc(2011, 0, 1, 12, 10),
    utc(2011, 0, 1, 12, 15),
    utc(2011, 0, 1, 12, 20)
  ])
})

it('scaleUtc.ticks(count) can generate 15-minute ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 8, 27), utc(2011, 0, 1, 13, 4, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 15),
    utc(2011, 0, 1, 12, 30),
    utc(2011, 0, 1, 12, 45),
    utc(2011, 0, 1, 13, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 30-minute ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 28, 27), utc(2011, 0, 1, 14, 4, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 12, 30),
    utc(2011, 0, 1, 13, 0),
    utc(2011, 0, 1, 13, 30),
    utc(2011, 0, 1, 14, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 1-hour ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 12, 28, 27), utc(2011, 0, 1, 16, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 13, 0),
    utc(2011, 0, 1, 14, 0),
    utc(2011, 0, 1, 15, 0),
    utc(2011, 0, 1, 16, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 3-hour ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 14, 28, 27), utc(2011, 0, 2, 1, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 15, 0),
    utc(2011, 0, 1, 18, 0),
    utc(2011, 0, 1, 21, 0),
    utc(2011, 0, 2, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 6-hour ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 16, 28, 27), utc(2011, 0, 2, 14, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 18, 0),
    utc(2011, 0, 2, 0, 0),
    utc(2011, 0, 2, 6, 0),
    utc(2011, 0, 2, 12, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 12-hour ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 16, 28, 27), utc(2011, 0, 3, 21, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 2, 0, 0),
    utc(2011, 0, 2, 12, 0),
    utc(2011, 0, 3, 0, 0),
    utc(2011, 0, 3, 12, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 1-day ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 16, 28, 27), utc(2011, 0, 5, 21, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 2, 0, 0),
    utc(2011, 0, 3, 0, 0),
    utc(2011, 0, 4, 0, 0),
    utc(2011, 0, 5, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 2-day ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 2, 16, 28, 27), utc(2011, 0, 9, 21, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 3, 0, 0),
    utc(2011, 0, 5, 0, 0),
    utc(2011, 0, 7, 0, 0),
    utc(2011, 0, 9, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 1-week ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 1, 16, 28, 27), utc(2011, 0, 23, 21, 34, 12)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 2, 0, 0),
    utc(2011, 0, 9, 0, 0),
    utc(2011, 0, 16, 0, 0),
    utc(2011, 0, 23, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 1-month ticks', () => {
  const x = scaleUtc().domain([utc(2011, 0, 18), utc(2011, 4, 2)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 1, 1, 0, 0),
    utc(2011, 2, 1, 0, 0),
    utc(2011, 3, 1, 0, 0),
    utc(2011, 4, 1, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 3-month ticks', () => {
  const x = scaleUtc().domain([utc(2010, 11, 18), utc(2011, 10, 2)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 0, 0),
    utc(2011, 3, 1, 0, 0),
    utc(2011, 6, 1, 0, 0),
    utc(2011, 9, 1, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate 1-year ticks', () => {
  const x = scaleUtc().domain([utc(2010, 11, 18), utc(2014, 2, 2)])
  expect(x.ticks(4)).toEqual([
    utc(2011, 0, 1, 0, 0),
    utc(2012, 0, 1, 0, 0),
    utc(2013, 0, 1, 0, 0),
    utc(2014, 0, 1, 0, 0)
  ])
})

it('scaleUtc.ticks(count) can generate multi-year ticks', () => {
  const x = scaleUtc().domain([utc(0, 11, 18), utc(2014, 2, 2)])
  expect(x.ticks(6)).toEqual([
    utc( 500, 0, 1, 0, 0),
    utc(1000, 0, 1, 0, 0),
    utc(1500, 0, 1, 0, 0),
    utc(2000, 0, 1, 0, 0)
  ])
})

it('scaleUtc.ticks(count) returns one tick for an empty domain', () => {
  const x = scaleUtc().domain([utc(2014, 2, 2), utc(2014, 2, 2)])
  expect(x.ticks(6)).toEqual([utc(2014, 2, 2)])
})

it('scaleUtc.tickFormat()(date) formats year on New Year\'s', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 0, 1))).toBe('2011')
  expect(f(utc(2012, 0, 1))).toBe('2012')
  expect(f(utc(2013, 0, 1))).toBe('2013')
})

it('scaleUtc.tickFormat()(date) formats month on the 1st of each month', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 1, 1))).toBe('February')
  expect(f(utc(2011, 2, 1))).toBe('March')
  expect(f(utc(2011, 3, 1))).toBe('April')
})

it('scaleUtc.tickFormat()(date) formats week on Sunday midnight', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 1, 6))).toBe('Feb 06')
  expect(f(utc(2011, 1, 13))).toBe('Feb 13')
  expect(f(utc(2011, 1, 20))).toBe('Feb 20')
})

it('scaleUtc.tickFormat()(date) formats date on midnight', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 1, 2))).toBe('Wed 02')
  expect(f(utc(2011, 1, 3))).toBe('Thu 03')
  expect(f(utc(2011, 1, 4))).toBe('Fri 04')
})

it('scaleUtc.tickFormat()(date) formats hour on minute zero', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 1, 2, 11))).toBe('11 AM')
  expect(f(utc(2011, 1, 2, 12))).toBe('12 PM')
  expect(f(utc(2011, 1, 2, 13))).toBe('01 PM')
})

it('scaleUtc.tickFormat()(date) formats minute on second zero', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 1, 2, 11, 59))).toBe('11:59')
  expect(f(utc(2011, 1, 2, 12,  1))).toBe('12:01')
  expect(f(utc(2011, 1, 2, 12,  2))).toBe('12:02')
})

it('scaleUtc.tickFormat()(date) otherwise, formats second', () => {
  const f = scaleUtc().tickFormat()
  expect(f(utc(2011, 1, 2, 12,  1,  9))).toBe(':09')
  expect(f(utc(2011, 1, 2, 12,  1, 10))).toBe(':10')
  expect(f(utc(2011, 1, 2, 12,  1, 11))).toBe(':11')
})

it('scaleUtc.tickFormat(count, specifier) returns a time format for the specified specifier', () => {
  const f = scaleUtc().tickFormat(10, '%c')
  expect(f(utc(2011, 1, 2, 12))).toBe('2/2/2011, 12:00:00 PM')
})
