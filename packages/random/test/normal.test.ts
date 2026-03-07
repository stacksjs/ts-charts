import { describe, expect, it } from 'bun:test'
import { deviation, mean, range } from '@ts-charts/array'
import { randomLcg, randomNormal } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

describe('randomNormal', () => {
  it('randomNormal() returns random numbers with a mean of zero', () => {
    const r = randomNormal.source(randomLcg(0.3193923539476107))
    assertInDelta(mean(range(10000).map(r())) as number, 0, 0.05)
  })

  it('randomNormal() returns random numbers with a standard deviation of one', () => {
    const r = randomNormal.source(randomLcg(0.5618016004747401))
    assertInDelta(deviation(range(10000).map(r())) as number, 1, 0.05)
  })

  it('randomNormal(mu) returns random numbers with the specified mean', () => {
    const r = randomNormal.source(randomLcg(0.22864660166790118))
    assertInDelta(mean(range(10000).map(r(42))) as number, 42, 0.05)
    assertInDelta(mean(range(10000).map(r(-2))) as number, -2, 0.05)
  })

  it('randomNormal(mu) returns random numbers with a standard deviation of 1', () => {
    const r = randomNormal.source(randomLcg(0.1274290504810609))
    assertInDelta(deviation(range(10000).map(r(42))) as number, 1, 0.05)
    assertInDelta(deviation(range(10000).map(r(-2))) as number, 1, 0.05)
  })

  it('randomNormal(mu, sigma) returns random numbers with the specified mean and standard deviation', () => {
    const r = randomNormal.source(randomLcg(0.49113635631389463))
    assertInDelta(mean(range(10000).map(r(42, 2))) as number, 42, 0.05)
    assertInDelta(mean(range(10000).map(r(-2, 2))) as number, -2, 0.05)
    assertInDelta(deviation(range(10000).map(r(42, 2))) as number, 2, 0.05)
    assertInDelta(deviation(range(10000).map(r(-2, 2))) as number, 2, 0.05)
  })
})
