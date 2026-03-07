import { describe, expect, it } from 'bun:test'
import { deviation, mean, min, range, rollup, variance } from '@ts-charts/array'
import { randomLcg } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomLcg', () => {
  it('lcg is the expected deterministic PRNG', () => {
    const R1 = 0.6678668977692723
    const lcg1 = randomLcg(0)
    assertInDelta((lcg1(), lcg1(), lcg1(), lcg1()), R1, 1e-16)
    const lcg2 = randomLcg(0)
    assertInDelta((lcg2(), lcg2(), lcg2(), lcg2()), R1, 1e-16)
  })

  it('lcg is seeded', () => {
    const seed = 0.42
    const R42 = 0.6760216606780887
    const lcg = randomLcg(seed)
    assertInDelta((lcg(), lcg(), lcg(), lcg()), R42, 1e-16)
  })

  it('lcg is well-distributed', () => {
    const seed = 0.2
    const lcg = randomLcg(seed)
    const run = Float32Array.from({ length: 10000 }, lcg)
    assertInDelta(mean(run) as number, 1 / 2, 1e-2)
    assertInDelta(deviation(run) as number, Math.sqrt(1 / 12), 1e-2)
    const histogram = rollup(Array.from(run), (v: number[]) => v.length, (d: number) => Math.floor(d * 10))
    for (const h of histogram) assertInDelta(h[1] as number, 1000, 120)
  })

  it('lcg with small fractional seeds is well-distributed', () => {
    const G = range(100).map((i: number) => randomLcg(i / 100))
    const means: number[] = []
    const variances: number[] = []
    for (let i = 0; i < 10; i++) {
      const M = G.map((d: () => number) => d())
      means.push(mean(M) as number)
      variances.push(variance(M) as number)
    }
    assertInDelta(mean(means) as number, 0.5, 0.02)
    expect(min(variances)!).toBeGreaterThan(0.75 / 12)
  })
})
