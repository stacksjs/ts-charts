import { describe, expect, it } from 'bun:test'
import { mean, range } from '@ts-charts/array'
import { randomExponential, randomLcg } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomExponential', () => {
  it('randomExponential(lambda) returns random exponentially distributed numbers with a mean of 1/lambda.', () => {
    const r = randomExponential.source(randomLcg(0.42))
    const period = 20
    const lambda = 1 / period
    const times = range(10000).map(r(lambda))

    assertInDelta(mean(times) as number, period, period * 0.05)

    // Test cumulative distribution in intervals of 10.
    range(10, 100, 10).forEach((elapsed: number) => {
      const within = times.filter((t: number) => t <= elapsed)
      const expected = 1 - Math.exp(-elapsed * lambda)
      assertInDelta(within.length / times.length, expected, expected * 0.02)
    })
  })
})
