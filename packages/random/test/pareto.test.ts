import { describe, expect, it } from 'bun:test'
import { deviation, mean, range } from '@ts-charts/array'
import { randomLcg, randomPareto } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function ddeviation(n: number): number {
  return Math.sqrt(n / ((n - 1) * (n - 1) * (n - 2)))
}

describe('randomPareto', () => {
  it('randomPareto() returns randoms with specified mean', () => {
    const r = randomPareto.source(randomLcg(0.6165632948194271))
    expect(mean(range(10000).map(r(0)))).toBe(Infinity)
    expect(mean(range(10000).map(r(1))) as number).toBeGreaterThan(8)
    assertInDelta(mean(range(10000).map(r(3))) as number, 1.5, 0.4)
    assertInDelta(mean(range(10000).map(r(5))) as number, 1.25, 0.1)
    assertInDelta(mean(range(10000).map(r(11))) as number, 1.1, 0.1)
  })

  it('randomPareto() returns randoms with specified deviation', () => {
    const r = randomPareto.source(randomLcg(0.5733127851951378))
    expect(Number.isNaN(deviation(range(10000).map(r(0))))).toBe(true)
    expect(deviation(range(10000).map(r(1))) as number).toBeGreaterThan(70)
    assertInDelta(deviation(range(10000).map(r(3))) as number, ddeviation(3), 0.5)
    assertInDelta(deviation(range(10000).map(r(5))) as number, ddeviation(5), 0.05)
    assertInDelta(deviation(range(10000).map(r(11))) as number, ddeviation(11), 0.05)
  })

  it('randomPareto(3) returns randoms with mean of 1.5 and deviation of 0.9', () => {
    const r = randomPareto.source(randomLcg(0.9341538627900958))
    assertInDelta(deviation(range(10000).map(r(3))) as number, 0.9, 0.2)
    assertInDelta(mean(range(10000).map(r(3))) as number, 1.5, 0.05)
  })
})
