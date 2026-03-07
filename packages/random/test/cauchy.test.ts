import { describe, expect, it } from 'bun:test'
import { median, range } from '@ts-charts/array'
import { randomCauchy, randomLcg } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomCauchy', () => {
  it('randomCauchy(a, b) returns random numbers with a median of a', () => {
    const r = randomCauchy.source(randomLcg(0.42))
    assertInDelta(median(range(10000).map(r())) as number, 0, 0.05)
    assertInDelta(median(range(10000).map(r(5))) as number, 5, 0.05)
    assertInDelta(median(range(10000).map(r(0, 4))) as number, 0, 0.1)
    assertInDelta(median(range(10000).map(r(1, 3))) as number, 1, 0.1)
    assertInDelta(median(range(10000).map(r(3, 1))) as number, 3, 0.05)
  })
})
