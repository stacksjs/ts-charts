import { describe, expect, it } from 'bun:test'
import { bin, extent, histogram, thresholdSturges, ticks } from '../src/index.ts'

function box(binArr: any[], x0: number, x1: number): any {
  (binArr as any).x0 = x0;
  (binArr as any).x1 = x1
  return binArr
}

function* iterable(array: any[]) {
  yield* array
}

it('histogram is a deprecated alias for bin', () => {
  expect(histogram).toBe(bin)
})

it('bin() returns a default bin generator', () => {
  const h = bin()
  expect((h.value() as any)(42)).toBe(42)
  expect(h.domain()).toBe(extent as any)
  expect(h.thresholds()).toBe(thresholdSturges as any)
})

it('bin(data) computes bins of the specified array of data', () => {
  const h = bin()
  expect(h([0, 0, 0, 10, 20, 20])).toEqual([
    box([0, 0, 0], 0, 5),
    box([], 5, 10),
    box([10], 10, 15),
    box([], 15, 20),
    box([20, 20], 20, 25)
  ])
})

it('bin(iterable) is equivalent to bin(array)', () => {
  const h = bin()
  expect(h(iterable([0, 0, 0, 10, 20, 20]))).toEqual([
    box([0, 0, 0], 0, 5),
    box([], 5, 10),
    box([10], 10, 15),
    box([], 15, 20),
    box([20, 20], 20, 25)
  ])
})

it('bin.value(number) sets the constant value', () => {
  const h = bin().value(12)
  expect(h([0, 0, 0, 1, 2, 2])).toEqual([
    box([0, 0, 0, 1, 2, 2], 12, 12),
  ])
})

it('bin(data) does not bin null, undefined, or NaN', () => {
  const h = bin()
  expect(h([0, null, undefined, NaN, 10, 20, 20])).toEqual([
    box([0], 0, 5),
    box([], 5, 10),
    box([10], 10, 15),
    box([], 15, 20),
    box([20, 20], 20, 25)
  ])
})

it('bin.value(function) sets the value accessor', () => {
  const h = bin().value((d: any) => d.value)
  const a = {value: 0}
  const b = {value: 10}
  const c = {value: 20}
  expect(h([a, a, a, b, c, c])).toEqual([
    box([a, a, a], 0, 5),
    box([], 5, 10),
    box([b], 10, 15),
    box([], 15, 20),
    box([c, c], 20, 25)
  ])
})

it('bin.domain(array) sets the domain', () => {
  const h = bin().domain([0, 20])
  expect((h.domain() as any)()).toEqual([0, 20])
  expect(h([1, 2, 2, 10, 18, 18])).toEqual([
    box([1, 2, 2], 0, 5),
    box([], 5, 10),
    box([10], 10, 15),
    box([18, 18], 15, 20)
  ])
})

it('bin.thresholds(number) sets the approximate number of bin thresholds', () => {
  const h = bin().thresholds(3)
  expect(h([0, 0, 0, 10, 30, 30])).toEqual([
    box([0, 0, 0], 0, 10),
    box([10], 10, 20),
    box([], 20, 30),
    box([30, 30], 30, 40)
  ])
})

it('bin.thresholds(array) sets the bin thresholds', () => {
  const h = bin().thresholds([10, 20])
  expect(h([0, 0, 0, 10, 30, 30])).toEqual([
    box([0, 0, 0], 0, 10),
    box([10], 10, 20),
    box([30, 30], 20, 30)
  ])
})

it('bin.thresholds(array) ignores thresholds outside the domain', () => {
  const h = bin().thresholds([0, 1, 2, 3, 4])
  expect(h([0, 1, 2, 3])).toEqual([
    box([0], 0, 1),
    box([1], 1, 2),
    box([2], 2, 3),
    box([3], 3, 3)
  ])
})

it('bin(data) uses nice thresholds', () => {
  const h = bin().domain([0, 1]).thresholds(5)
  expect(h([]).map((b: any) => [b.x0, b.x1])).toEqual([
    [0.0, 0.2],
    [0.2, 0.4],
    [0.4, 0.6],
    [0.6, 0.8],
    [0.8, 1.0]
  ])
})

it('bin()() returns bins whose rightmost bin is not too wide', () => {
  const h = bin()
  expect(h([9.8, 10, 11, 12, 13, 13.2])).toEqual([
    box([9.8], 9, 10),
    box([10], 10, 11),
    box([11], 11, 12),
    box([12], 12, 13),
    box([13, 13.2], 13, 14)
  ])
})

it('bin(data) handles fractional step correctly', () => {
  const h = bin().thresholds(10)
  expect(h([9.8, 10, 11, 12, 13, 13.2])).toEqual([
    box([9.8], 9.5, 10),
    box([10], 10, 10.5),
    box([], 10.5, 11),
    box([11], 11, 11.5),
    box([], 11.5, 12),
    box([12], 12, 12.5),
    box([], 12.5, 13),
    box([13, 13.2], 13, 13.5)
  ])
})

it('bin(data) assigns floating point values to the correct bins', () => {
  for (const n of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]) {
    expect(bin().thresholds(n)(ticks(1, 2, n)).every((d: any) => d.length === 1)).toBe(true)
  }
})

it('bin(data) assigns integer values to the correct bins', () => {
  expect(bin().domain([4, 5])([5])).toEqual([box([5], 4, 5)])
  const eights = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]
  expect(bin().domain([3, 8])(eights)).toEqual([box([], 3, 4), box([], 4, 5), box([], 5, 6), box([], 6, 7), box(eights, 7, 8)])
})

it('bin(data) does not mutate user-supplied thresholds as an array', () => {
  const thresholds = [3, 4, 5, 6]
  const b = bin().domain([4, 5]).thresholds(thresholds)
  expect(b([5])).toEqual([box([], 4, 5), box([5], 5, 5)])
  expect(thresholds).toEqual([3, 4, 5, 6])
  expect((b.thresholds() as any)()).toEqual([3, 4, 5, 6])
})

it('bin(data) does not mutate user-supplied thresholds as a function', () => {
  const thresholds = [3, 4, 5, 6]
  const b = bin().domain([4, 5]).thresholds(() => thresholds)
  expect(b([5])).toEqual([box([], 4, 5), box([5], 5, 5)])
  expect(thresholds).toEqual([3, 4, 5, 6])
  expect((b.thresholds() as any)()).toEqual([3, 4, 5, 6])
})
