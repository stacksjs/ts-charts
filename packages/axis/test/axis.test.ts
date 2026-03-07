import { describe, it, expect } from 'bun:test'
import { scaleLinear } from '@ts-charts/scale'
import { axisLeft } from '../src/index.ts'

describe('axis', () => {
  it('axisLeft(scale) has the expected defaults', () => {
    const s = scaleLinear()
    const a = axisLeft(s)
    expect(a.scale()).toBe(s)
    expect(a.tickArguments()).toEqual([])
    expect(a.tickValues()).toBe(null)
    expect(a.tickFormat()).toBe(null)
    expect(a.tickSize()).toBe(6)
    expect(a.tickSizeInner()).toBe(6)
    expect(a.tickSizeOuter()).toBe(6)
    expect(a.tickPadding()).toBe(3)
  })

  it('axis.ticks(arguments...) sets the tick arguments', () => {
    const a = axisLeft(scaleLinear()).ticks(20)
    expect(a.tickArguments()).toEqual([20])
    a.ticks()
    expect(a.tickArguments()).toEqual([])
  })

  it('axis.tickArguments(null) sets the tick arguments to the empty array', () => {
    const a = axisLeft(scaleLinear()).tickArguments(null)
    expect(a.tickArguments()).toEqual([])
  })

  it('axis.tickArguments() makes a defensive copy of the tick arguments', () => {
    const a = axisLeft(scaleLinear()).tickArguments([20])
    const v = a.tickArguments()
    v.push(10)
    expect(a.tickArguments()).toEqual([20])
  })

  it('axis.tickValues(null) clears any explicitly-set tick values', () => {
    const a = axisLeft(scaleLinear()).tickValues([1, 2, 3])
    expect(a.tickValues()).toEqual([1, 2, 3])
    a.tickValues([])
    expect(a.tickValues()).toEqual([])
    a.tickValues(null)
    expect(a.tickValues()).toBe(null)
  })

  it('axis.tickValues(values) sets the tick values explicitly', () => {
    const a = axisLeft(scaleLinear()).tickValues([1, 2, 3])
    expect(a.tickValues()).toEqual([1, 2, 3])
  })

  it('axis.tickValues(values) makes a defensive copy of the specified tick values', () => {
    const v = [1, 2, 3]
    const a = axisLeft(scaleLinear()).tickValues(v)
    v.push(4)
    expect(a.tickValues()).toEqual([1, 2, 3])
  })

  it('axis.tickValues() makes a defensive copy of the tick values', () => {
    const a = axisLeft(scaleLinear()).tickValues([1, 2, 3])
    const v = a.tickValues()!
    v.push(4)
    expect(a.tickValues()).toEqual([1, 2, 3])
  })

  it('axis.tickValues(values) accepts an iterable', () => {
    const a = axisLeft(scaleLinear()).tickValues(new Set([1, 2, 3]))
    expect(a.tickValues()).toEqual([1, 2, 3])
  })
})
