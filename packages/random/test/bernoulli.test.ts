import { describe, expect, it } from 'bun:test'
import { mean, range, variance } from '@ts-charts/array'
import { randomBernoulli, randomLcg } from '../src/index.ts'
import { skewness, kurtosis } from './statistics.ts'

function assertInDelta(actual: number, expected: number, delta: number): void {
  expect(Math.abs(actual - expected)).toBeLessThan(delta)
}

function dmean(p: number): number {
  return p
}

function dvariance(p: number): number {
  return p * (1 - p)
}

function skew(p: number): number {
  return (1 - 2 * p) / Math.sqrt(dvariance(p))
}

function kurt(p: number): number {
  return (6 * Math.pow(p, 2) - 6 * p + 1) / (dvariance(p))
}

describe('randomBernoulli', () => {
  it('randomBernoulli(p) returns random bernoulli distributed numbers with a mean of p', () => {
    const r = randomBernoulli.source(randomLcg(0.48444190806583465))
    assertInDelta(mean(range(10000).map(r(1))) as number, dmean(1), dvariance(1))
    assertInDelta(mean(range(10000).map(r(0.5))) as number, dmean(0.5), dvariance(0.5))
    assertInDelta(mean(range(10000).map(r(0.25))) as number, dmean(0.25), dvariance(0.25))
    assertInDelta(mean(range(10000).map(r(0))) as number, dmean(0), dvariance(0))
  })

  it('randomBernoulli(p) returns random bernoulli distributed numbers with a variance of p * (1 - p)', () => {
    const r = randomBernoulli.source(randomLcg(0.9781605192898934))
    assertInDelta(variance(range(10000).map(r(1))) as number, dvariance(1), 0)
    assertInDelta(variance(range(10000).map(r(0.5))) as number, dvariance(0.5), 0.05)
    assertInDelta(variance(range(10000).map(r(0.25))) as number, dvariance(0.25), 0.05)
    assertInDelta(variance(range(10000).map(r(0))) as number, dvariance(0), 0)
  })

  it('randomBernoulli(p) returns random bernoulli distributed numbers with a skewness of (1 - 2 * p) / sqrt(p * (1 - p)).', () => {
    const r = randomBernoulli.source(randomLcg(0.9776249148208429))
    assertInDelta(skewness(range(10000).map(r(0.5))), skew(0.5), 0.08)
    assertInDelta(skewness(range(10000).map(r(0.25))), skew(0.25), 0.05)
  })

  it('randomBernoulli(p) returns random bernoulli distributed numbers with a kurtosis excess of (6 * p^2 - 6 * p - 1) / (p * (1 - p)).', () => {
    const r = randomBernoulli.source(randomLcg(0.8260973119979638))
    assertInDelta(kurtosis(range(10000).map(r(0.05))), kurt(0.05), kurt(0.05) * 0.2)
    assertInDelta(kurtosis(range(10000).map(r(0.10))), kurt(0.10), kurt(0.10) * 0.2)
    assertInDelta(kurtosis(range(10000).map(r(0.15))), kurt(0.15), kurt(0.15) * 0.2)
    assertInDelta(kurtosis(range(50000).map(r(0.20))), kurt(0.20), kurt(0.20) * 0.4)
  })
})
