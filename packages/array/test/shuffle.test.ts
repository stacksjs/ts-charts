import { describe, expect, it } from 'bun:test'
import { pairs, shuffler } from '../src/index.ts'

function lcg(seed: number): () => number {
  return function() {
    seed = (seed * 1664525 + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }
}

it('shuffle(array) shuffles the array in-place', () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const shuffle = shuffler(lcg(42))
  expect(shuffle(numbers)).toBe(numbers)
  expect(pairs(numbers).some(([a, b]: any) => a > b)).toBe(true)
})

it('shuffler(random)(array) shuffles the array in-place', () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const shuffle = shuffler(lcg(42))
  expect(shuffle(numbers)).toBe(numbers)
})
