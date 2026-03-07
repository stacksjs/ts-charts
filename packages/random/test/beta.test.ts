import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomBeta, randomLcg } from '../src/index.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function dmean(alpha: number, beta: number): number {
  return alpha / (alpha + beta)
}

function dvariance(alpha: number, beta: number): number {
  return (alpha * beta) / Math.pow(alpha + beta, 2) / (alpha + beta + 1)
}

describe('randomBeta', () => {
  it('randomBeta(alpha, beta) returns random numbers with a mean of alpha / (alpha + beta)', () => {
    const r = randomBeta.source(randomLcg(0.8275880644751501))
    assertInDelta(mean(range(10000).map(r(1, 1))) as number, dmean(1, 1), 0.05)
    assertInDelta(mean(range(10000).map(r(1, 2))) as number, dmean(1, 2), 0.05)
    assertInDelta(mean(range(10000).map(r(2, 1))) as number, dmean(2, 1), 0.05)
    assertInDelta(mean(range(10000).map(r(3, 4))) as number, dmean(3, 4), 0.05)
    assertInDelta(mean(range(10000).map(r(0.5, 0.5))) as number, dmean(0.5, 0.5), 0.05)
    assertInDelta(mean(range(10000).map(r(2.7, 0.3))) as number, dmean(2.7, 0.3), 0.05)
  })

  it('randomBeta(alpha, beta) returns random numbers with a variance of (alpha * beta) / (alpha + beta)^2 / (alpha + beta + 1)', () => {
    const r = randomBeta.source(randomLcg(0.8272345925494458))
    assertInDelta(variance(range(10000).map(r(1, 1))) as number, dvariance(1, 1), 0.05)
    assertInDelta(variance(range(10000).map(r(1, 2))) as number, dvariance(1, 2), 0.05)
    assertInDelta(variance(range(10000).map(r(2, 1))) as number, dvariance(2, 1), 0.05)
    assertInDelta(variance(range(10000).map(r(3, 4))) as number, dvariance(3, 4), 0.05)
    assertInDelta(variance(range(10000).map(r(0.5, 0.5))) as number, dvariance(0.5, 0.5), 0.05)
    assertInDelta(variance(range(10000).map(r(2.7, 0.3))) as number, dvariance(2.7, 0.3), 0.05)
  })
})
