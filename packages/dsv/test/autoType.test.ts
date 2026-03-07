import { describe, expect, it } from 'bun:test'
import { autoType } from '../src/index.ts'

describe('autoType', () => {
  it('autoType(object) mutates in-place', () => {
    const object: any = { foo: '4.2' }
    expect(autoType(object)).toBe(object)
    expect(object).toEqual({ foo: 4.2 })
  })

  it('autoType(object) detects numbers', () => {
    expect(autoType({ foo: '4.2' } as any)).toEqual({ foo: 4.2 })
    expect(autoType({ foo: '04.2' } as any)).toEqual({ foo: 4.2 })
    expect(autoType({ foo: '-4.2' } as any)).toEqual({ foo: -4.2 })
    expect(autoType({ foo: '1e4' } as any)).toEqual({ foo: 10000 })
  })

  it('autoType(object) detects NaN', () => {
    expect(Number.isNaN(autoType({ foo: 'NaN' } as any).foo)).toBe(true)
  })

  // https://www.ecma-international.org/ecma-262/9.0/index.html#sec-date-time-string-format
  // When the time zone offset is absent, date-only forms are interpreted as a UTC time and date-time forms are interpreted as a local time.
  // YYYY is ambiguous with number, so the number takes priority.
  it('autoType(object) detects dates', () => {
    expect(autoType({ foo: '2018-01' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
    expect(autoType({ foo: '2018-01-01' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
  })

  it('autoType(object) detects extended years', () => {
    expect(autoType({ foo: '-010001-01-01T00:00:00Z' } as any)).toEqual({ foo: new Date('-010001-01-01T00:00:00Z') })
    expect(autoType({ foo: '+010001-01-01T00:00:00Z' } as any)).toEqual({ foo: new Date('+010001-01-01T00:00:00Z') })
  })

  it('autoType(object) detects date-times', () => {
    expect(autoType({ foo: '2018T00:00Z' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
    expect(autoType({ foo: '2018T00:00+08:00' } as any)).toEqual({ foo: new Date('2017-12-31T16:00:00.000Z') })
    expect(autoType({ foo: '2018-01T12:23' } as any)).toEqual({ foo: new Date('2018-01-01T12:23:00.000') })
    expect(autoType({ foo: '2018-01T12:23Z' } as any)).toEqual({ foo: new Date('2018-01-01T12:23:00.000Z') })
    expect(autoType({ foo: '2018-01T12:23+00:00' } as any)).toEqual({ foo: new Date('2018-01-01T12:23:00.000Z') })
    expect(autoType({ foo: '2018-01-01T00:00' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000') })
    expect(autoType({ foo: '2018-01-01T00:00+00:00' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
    expect(autoType({ foo: '2018-01-01T00:00-00:00' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
  })

  it('autoType(object) detects booleans', () => {
    expect(autoType({ foo: 'true' } as any)).toEqual({ foo: true })
    expect(autoType({ foo: 'false' } as any)).toEqual({ foo: false })
  })

  it('autoType(object) detects null', () => {
    expect(autoType({ foo: '' } as any)).toEqual({ foo: null })
  })

  it('autoType(object) detects strings', () => {
    expect(autoType({ foo: 'yes' })).toEqual({ foo: 'yes' })
    expect(autoType({ foo: 'no' })).toEqual({ foo: 'no' })
    expect(autoType({ foo: '01/01/2018' })).toEqual({ foo: '01/01/2018' })
    expect(autoType({ foo: 'January 1, 2018' })).toEqual({ foo: 'January 1, 2018' })
    expect(autoType({ foo: '1,431' })).toEqual({ foo: '1,431' })
    expect(autoType({ foo: '$1.00' })).toEqual({ foo: '$1.00' })
    expect(autoType({ foo: '(1.00)' })).toEqual({ foo: '(1.00)' })
    expect(autoType({ foo: 'Nan' })).toEqual({ foo: 'Nan' })
    expect(autoType({ foo: 'True' })).toEqual({ foo: 'True' })
    expect(autoType({ foo: 'False' })).toEqual({ foo: 'False' })
    expect(autoType({ foo: 'TRUE' })).toEqual({ foo: 'TRUE' })
    expect(autoType({ foo: 'FALSE' })).toEqual({ foo: 'FALSE' })
    expect(autoType({ foo: 'NAN' })).toEqual({ foo: 'NAN' })
    expect(autoType({ foo: 'nan' })).toEqual({ foo: 'nan' })
    expect(autoType({ foo: 'NA' })).toEqual({ foo: 'NA' })
    expect(autoType({ foo: 'na' })).toEqual({ foo: 'na' })
  })

  it('autoType(object) ignores leading and trailing whitespace', () => {
    expect(autoType({ foo: ' 4.2 ' } as any)).toEqual({ foo: 4.2 })
    expect(autoType({ foo: ' -4.2 ' } as any)).toEqual({ foo: -4.2 })
    expect(autoType({ foo: ' 1e4 ' } as any)).toEqual({ foo: 10000 })
    expect(autoType({ foo: ' 2018-01 ' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
    expect(autoType({ foo: ' 2018T00:00Z ' } as any)).toEqual({ foo: new Date('2018-01-01T00:00:00.000Z') })
    expect(Number.isNaN(autoType({ foo: ' NaN ' } as any).foo)).toBe(true)
    expect(autoType({ foo: ' true ' } as any)).toEqual({ foo: true })
    expect(autoType({ foo: ' ' } as any)).toEqual({ foo: null })
  })

  it('autoType(array) mutates in-place', () => {
    const array: any = ['4.2']
    expect(autoType(array)).toBe(array)
    expect(array).toEqual([4.2])
  })

  it('autoType(array) can take an array', () => {
    expect(autoType(['4.2', ' 2018-01 '] as any)).toEqual([4.2, new Date('2018-01-01T00:00:00.000Z')])
  })
})
