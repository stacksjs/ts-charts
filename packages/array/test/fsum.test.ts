import { describe, expect, it } from 'bun:test'
import { Adder, fsum } from '../src/index.ts'

it('new Adder() returns an Adder', () => {
  expect(new Adder().valueOf()).toBe(0)
})

it('adder.add(number) adds a number', () => {
  const adder = new Adder()
  adder.add(1)
  adder.add(2)
  expect(adder.valueOf()).toBe(3)
})

it('fsum(array) is an exact sum', () => {
  expect(fsum([.1, .1, .1, .1, .1, .1, .1, .1, .1, .1])).toBe(1)
  expect(fsum([.3, .3, .3, .3, .3, .3, .3, .3, .3, .3, -.3, -.3, -.3, -.3, -.3, -.3, -.3, -.3, -.3, -.3])).toBe(0)
  expect(fsum([1, 1e100, 1, -1e100])).toBe(2)
})

it('fsum(array) returns the fsum of the specified numbers', () => {
  expect(fsum([1])).toBe(1)
  expect(fsum([5, 1, 2, 3, 4])).toBe(15)
  expect(fsum([20, 3])).toBe(23)
  expect(fsum([3, 20])).toBe(23)
})

it('fsum(array) ignores non-numeric values', () => {
  expect(fsum(['a', 'b', 'c'])).toBe(0)
  expect(fsum(['a', 1, '2'])).toBe(3)
})
