import { describe, expect, it } from 'bun:test'
import { extent, mean, range } from '@ts-charts/array'
import { randomInt, randomLcg } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomInt', () => {
  it('randomInt(max) returns random integers with a mean of (max - 1) / 2', () => {
    const r = randomInt.source(randomLcg(0.7350864698209636))
    assertInDelta(mean(range(10000).map(r(3))) as number, 1.0, 0.05)
    assertInDelta(mean(range(10000).map(r(21))) as number, 10.0, 0.5)
  })

  it('randomInt(max) returns random integers in the range [0, max - 1]', () => {
    const r = randomInt.source(randomLcg(0.17809137433591848))
    expect(extent(range(10000).map(r(3)))).toEqual([0, 2])
    expect(extent(range(10000).map(r(21)))).toEqual([0, 20])
  })

  it('randomInt(min, max) returns random integers with a mean of (min + max - 1) / 2', () => {
    const r = randomInt.source(randomLcg(0.46394764422984647))
    assertInDelta(mean(range(10000).map(r(10, 43))) as number, 26, 0.5)
  })

  it('randomInt(min, max) returns random integers in the range [min, max - 1]', () => {
    const r = randomInt.source(randomLcg(0.9598431138570096))
    expect(extent(range(10000).map(r(10, 42)))).toEqual([10, 41])
  })
})
