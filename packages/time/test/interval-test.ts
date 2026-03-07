import { describe, expect, it } from 'bun:test'
import { timeDay, timeHour, timeInterval, timeMinute, timeSecond, timeYear } from '../src/index.ts'
import { local, utc } from './date.ts'

describe('timeInterval', () => {
  it('timeInterval() is equivalent to timeInterval.floor(new Date)', () => {
    const t = new Date()
    expect(timeYear()).toEqual(timeYear.floor(t))
  })

  it('timeInterval(date) is equivalent to timeInterval.floor(date)', () => {
    const t = new Date()
    expect(timeYear(t)).toEqual(timeYear.floor(t))
  })

  it('timeInterval(floor, offset) returns a custom time interval', () => {
    const i = timeInterval(function(date) {
      date.setUTCMinutes(0, 0, 0)
    }, function(date, step) {
      date.setUTCHours(date.getUTCHours() + step)
    })
    expect(i(utc(2015, 0, 1, 12, 34, 56, 789))).toEqual(utc(2015, 0, 1, 12))
  })

  it('timeInterval(floor, offset) does not define a count method', () => {
    const i = timeInterval(function(date) {
      date.setUTCMinutes(0, 0, 0)
    }, function(date, step) {
      date.setUTCHours(date.getUTCHours() + step)
    })
    expect('count' in i).toBe(false)
  })

  it('timeInterval(floor, offset) floors the step before passing it to offset', () => {
    const steps: number[] = []
    const i = timeInterval(function(date) {
      date.setUTCMinutes(0, 0, 0)
    }, function(date, step) {
      steps.push(+step)
      date.setUTCHours(date.getUTCHours() + step)
    })
    expect(i.offset(utc(2015, 0, 1, 12, 34, 56, 789), 1.5)).toEqual(utc(2015, 0, 1, 13, 34, 56, 789))
    expect(i.range(utc(2015, 0, 1, 12), utc(2015, 0, 1, 15), 1.5)).toEqual([utc(2015, 0, 1, 12), utc(2015, 0, 1, 13), utc(2015, 0, 1, 14)])
    expect(steps.every(function(step) { return step === 1 })).toBe(true)
  })

  it('timeInterval(floor, offset, count) defines a count method', () => {
    const i = timeInterval(function(date) {
      date.setUTCMinutes(0, 0, 0)
    }, function(date, step) {
      date.setUTCHours(date.getUTCHours() + step)
    }, function(start, end) {
      return (+end - +start) / 36e5
    })
    expect(i.count!(utc(2015, 0, 1, 12, 34), utc(2015, 0, 1, 15, 56))).toBe(3)
  })

  it('timeInterval(floor, offset, count) floors dates before passing them to count', () => {
    const dates: Date[] = []
    const i = timeInterval(function(date) {
      date.setUTCMinutes(0, 0, 0)
    }, function(date, step) {
      date.setUTCHours(date.getUTCHours() + step)
    }, function(start, end) {
      return dates.push(new Date(+start), new Date(+end)), (+end - +start) / 36e5
    })
    i.count!(utc(2015, 0, 1, 12, 34), utc(2015, 0, 1, 15, 56))
    expect(dates).toEqual([utc(2015, 0, 1, 12), utc(2015, 0, 1, 15)])
  })

  it('timeInterval.every(step) returns null if step is invalid', () => {
    expect(timeDay.every!((undefined as any))).toBeNull()
    expect(timeMinute.every!(null as any)).toBeNull()
    expect(timeSecond.every!(undefined as any)).toBeNull()
    expect(timeDay.every!(NaN)).toBeNull()
    expect(timeMinute.every!(0)).toBeNull()
    expect(timeSecond.every!(0.8)).toBeNull()
    expect(timeHour.every!(-1)).toBeNull()
  })

  it('timeInterval.every(step) returns interval if step is one', () => {
    expect(timeDay.every!('1' as any)).toBe(timeDay)
    expect(timeMinute.every!(1)).toBe(timeMinute)
    expect(timeSecond.every!(1.8)).toBe(timeSecond)
  })

  it('timeInterval.every(step).range(invalid, invalid) returns the empty array', () => {
    expect(timeMinute.every!(15)!.range(NaN, NaN)).toEqual([])
  })

  it('timeInterval.every(...).offset(date, step) returns the expected value when step is positive', () => {
    const i = timeMinute.every!(15)!
    expect(i.offset(local(2015, 0, 1, 12, 34), 0)).toEqual(local(2015, 0, 1, 12, 34))
    expect(i.offset(local(2015, 0, 1, 12, 34), 1)).toEqual(local(2015, 0, 1, 12, 45))
    expect(i.offset(local(2015, 0, 1, 12, 34), 2)).toEqual(local(2015, 0, 1, 13,  0))
    expect(i.offset(local(2015, 0, 1, 12, 34), 3)).toEqual(local(2015, 0, 1, 13, 15))
    expect(i.offset(local(2015, 0, 1, 12, 34), 4)).toEqual(local(2015, 0, 1, 13, 30))
    expect(i.offset(local(2015, 0, 1, 12, 34), 5)).toEqual(local(2015, 0, 1, 13, 45))
  })

  it('timeInterval.every(...).offset(date, step) returns the expected value when step is negative', () => {
    const i = timeMinute.every!(15)!
    expect(i.offset(local(2015, 0, 1, 12, 34), -1)).toEqual(local(2015, 0, 1, 12, 30))
    expect(i.offset(local(2015, 0, 1, 12, 34), -2)).toEqual(local(2015, 0, 1, 12, 15))
    expect(i.offset(local(2015, 0, 1, 12, 34), -3)).toEqual(local(2015, 0, 1, 12,  0))
  })

  it('timeInterval.every(...).offset(date, step) returns the expected value when step is not an integer', () => {
    const i = timeMinute.every!(15)!
    expect(i.offset(local(2015, 0, 1, 12, 34), 1.2)).toEqual(local(2015, 0, 1, 12, 45))
    expect(i.offset(local(2015, 0, 1, 12, 34), -0.8)).toEqual(local(2015, 0, 1, 12, 30))
  })
})
