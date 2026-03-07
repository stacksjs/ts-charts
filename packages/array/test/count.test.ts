import { describe, expect, it } from 'bun:test'
import { count } from '../src/index.ts'

function* generate(...values: any[]) { yield* values }

it('count() accepts an iterable', () => {
  expect(count([1, 2])).toBe(2)
  expect(count(new Set([1, 2]))).toBe(2)
  expect(count(generate(1, 2))).toBe(2)
})

it('count() ignores NaN, null', () => {
  expect(count([NaN, null, 0, 1])).toBe(2)
})

it('count() coerces to a number', () => {
  expect(count(['1', ' 2', 'Fred'])).toBe(2)
})

it('count() accepts an accessor', () => {
  expect(count([{v:NaN}, {}, {v:0}, {v:1}], (d: any) => d.v)).toBe(2)
  expect(count([{n: 'Alice', age: NaN}, {n: 'Bob', age: 18}, {n: 'Other'}], (d: any) => d.age)).toBe(1)
})
