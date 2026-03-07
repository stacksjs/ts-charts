import { expect, it } from 'bun:test'
import { scaleSequentialQuantile } from '../src/index.ts'

it('sequentialQuantile() clamps', () => {
  const s = scaleSequentialQuantile().domain([0, 1, 2, 3, 10])
  expect(s(-1)).toBe(0)
  expect(s(0)).toBe(0)
  expect(s(1)).toBe(0.25)
  expect(s(10)).toBe(1)
  expect(s(20)).toBe(1)
})

it('sequentialQuantile().domain() sorts the domain', () => {
  const s = scaleSequentialQuantile().domain([0, 2, 9, 0.1, 10])
  expect(s.domain()).toEqual([0, 0.1, 2, 9, 10])
})

it('sequentialQuantile().range() returns the computed range', () => {
  const s = scaleSequentialQuantile().domain([0, 2, 9, 0.1, 10])
  expect(s.range()).toEqual([0 / 4, 1 / 4, 2 / 4, 3 / 4, 4 / 4])
})

it('sequentialQuantile().quantiles(n) computes n + 1 quantiles', () => {
  const s = scaleSequentialQuantile().domain(Array.from({length: 2000}, (_, i) => 2 * i / 1999))
  expect(s.quantiles(4)).toEqual([0, 0.5, 1, 1.5, 2])
})
