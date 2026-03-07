import { describe, expect, it } from 'bun:test'
import { ascending, bisector } from '../src/index.ts'

function box(value: any): any { return { value } }
function unbox(box: any): any { return box.value }
function ascendingBox(a: any, b: any): number { return ascending(a.value, b.value) }
function ascendingBoxValue(a: any, value: any): number { return ascending(a.value, value) }

it('bisector(comparator).left(array, value) returns the index of an exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectLeft = bisector(ascendingBox).left
  expect(bisectLeft(boxes, box(1))).toBe(0)
  expect(bisectLeft(boxes, box(2))).toBe(1)
  expect(bisectLeft(boxes, box(3))).toBe(2)
})

it('bisector(comparator).left(array, value) returns the index of the first match', () => {
  const boxes = [1, 2, 2, 3].map(box)
  const bisectLeft = bisector(ascendingBox).left
  expect(bisectLeft(boxes, box(1))).toBe(0)
  expect(bisectLeft(boxes, box(2))).toBe(1)
  expect(bisectLeft(boxes, box(3))).toBe(3)
})

it('bisector(comparator).left(empty, value) returns zero', () => {
  expect((bisector as any)(() => { throw new Error() }).left([], 1)).toBe(0)
})

it('bisector(comparator).left(array, value) returns the insertion point of a non-exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectLeft = bisector(ascendingBox).left
  expect(bisectLeft(boxes, box(0.5))).toBe(0)
  expect(bisectLeft(boxes, box(1.5))).toBe(1)
  expect(bisectLeft(boxes, box(2.5))).toBe(2)
  expect(bisectLeft(boxes, box(3.5))).toBe(3)
})

it('bisector(comparator).left(array, value, lo) observes the specified lower bound', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectLeft = bisector(ascendingBox).left
  expect(bisectLeft(boxes, box(0), 2)).toBe(2)
  expect(bisectLeft(boxes, box(1), 2)).toBe(2)
  expect(bisectLeft(boxes, box(2), 2)).toBe(2)
  expect(bisectLeft(boxes, box(3), 2)).toBe(2)
  expect(bisectLeft(boxes, box(4), 2)).toBe(3)
  expect(bisectLeft(boxes, box(5), 2)).toBe(4)
  expect(bisectLeft(boxes, box(6), 2)).toBe(5)
})

it('bisector(comparator).left(array, value, lo, hi) observes the specified bounds', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectLeft = bisector(ascendingBox).left
  expect(bisectLeft(boxes, box(0), 2, 3)).toBe(2)
  expect(bisectLeft(boxes, box(1), 2, 3)).toBe(2)
  expect(bisectLeft(boxes, box(2), 2, 3)).toBe(2)
  expect(bisectLeft(boxes, box(3), 2, 3)).toBe(2)
  expect(bisectLeft(boxes, box(4), 2, 3)).toBe(3)
  expect(bisectLeft(boxes, box(5), 2, 3)).toBe(3)
  expect(bisectLeft(boxes, box(6), 2, 3)).toBe(3)
})

it('bisector(comparator).right(array, value) returns the index after an exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectRight = bisector(ascendingBox).right
  expect(bisectRight(boxes, box(1))).toBe(1)
  expect(bisectRight(boxes, box(2))).toBe(2)
  expect(bisectRight(boxes, box(3))).toBe(3)
})

it('bisector(comparator).right(array, value) returns the index after the last match', () => {
  const boxes = [1, 2, 2, 3].map(box)
  const bisectRight = bisector(ascendingBox).right
  expect(bisectRight(boxes, box(1))).toBe(1)
  expect(bisectRight(boxes, box(2))).toBe(3)
  expect(bisectRight(boxes, box(3))).toBe(4)
})

it('bisector(comparator).right(empty, value) returns zero', () => {
  expect((bisector as any)(() => { throw new Error() }).right([], 1)).toBe(0)
})

it('bisector(comparator).right(array, value) returns the insertion point of a non-exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectRight = bisector(ascendingBox).right
  expect(bisectRight(boxes, box(0.5))).toBe(0)
  expect(bisectRight(boxes, box(1.5))).toBe(1)
  expect(bisectRight(boxes, box(2.5))).toBe(2)
  expect(bisectRight(boxes, box(3.5))).toBe(3)
})

it('bisector(comparator).right(array, value, lo) observes the specified lower bound', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectRight = bisector(ascendingBox).right
  expect(bisectRight(boxes, box(0), 2)).toBe(2)
  expect(bisectRight(boxes, box(1), 2)).toBe(2)
  expect(bisectRight(boxes, box(2), 2)).toBe(2)
  expect(bisectRight(boxes, box(3), 2)).toBe(3)
  expect(bisectRight(boxes, box(4), 2)).toBe(4)
  expect(bisectRight(boxes, box(5), 2)).toBe(5)
  expect(bisectRight(boxes, box(6), 2)).toBe(5)
})

it('bisector(comparator).right(array, value, lo, hi) observes the specified bounds', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectRight = bisector(ascendingBox).right
  expect(bisectRight(boxes, box(0), 2, 3)).toBe(2)
  expect(bisectRight(boxes, box(1), 2, 3)).toBe(2)
  expect(bisectRight(boxes, box(2), 2, 3)).toBe(2)
  expect(bisectRight(boxes, box(3), 2, 3)).toBe(3)
  expect(bisectRight(boxes, box(4), 2, 3)).toBe(3)
  expect(bisectRight(boxes, box(5), 2, 3)).toBe(3)
  expect(bisectRight(boxes, box(6), 2, 3)).toBe(3)
})

it('bisector(comparator).left(array, value) supports an asymmetric (object, value) comparator', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectLeft = bisector(ascendingBoxValue).left
  expect(bisectLeft(boxes, 1)).toBe(0)
  expect(bisectLeft(boxes, 2)).toBe(1)
  expect(bisectLeft(boxes, 3)).toBe(2)
})

it('bisector(accessor).left(array, value) keeps non-comparable values to the right', () => {
  const boxes = [1, 2, null, undefined, NaN].map(box)
  const bisectLeft = bisector(unbox).left
  expect(bisectLeft(boxes, 1)).toBe(0)
  expect(bisectLeft(boxes, 2)).toBe(1)
  expect(bisectLeft(boxes, null)).toBe(5)
  expect(bisectLeft(boxes, undefined)).toBe(5)
  expect(bisectLeft(boxes, NaN)).toBe(5)
})

it('bisector(accessor).left(array, value) returns the index of an exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectLeft = bisector(unbox).left
  expect(bisectLeft(boxes, 1)).toBe(0)
  expect(bisectLeft(boxes, 2)).toBe(1)
  expect(bisectLeft(boxes, 3)).toBe(2)
})

it('bisector(accessor).left(array, value) returns the index of the first match', () => {
  const boxes = [1, 2, 2, 3].map(box)
  const bisectLeft = bisector(unbox).left
  expect(bisectLeft(boxes, 1)).toBe(0)
  expect(bisectLeft(boxes, 2)).toBe(1)
  expect(bisectLeft(boxes, 3)).toBe(3)
})

it('bisector(accessor).left(array, value) returns the insertion point of a non-exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectLeft = bisector(unbox).left
  expect(bisectLeft(boxes, 0.5)).toBe(0)
  expect(bisectLeft(boxes, 1.5)).toBe(1)
  expect(bisectLeft(boxes, 2.5)).toBe(2)
  expect(bisectLeft(boxes, 3.5)).toBe(3)
})

it('bisector(accessor).left(array, value, lo) observes the specified lower bound', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectLeft = bisector(unbox).left
  expect(bisectLeft(boxes, 0, 2)).toBe(2)
  expect(bisectLeft(boxes, 1, 2)).toBe(2)
  expect(bisectLeft(boxes, 2, 2)).toBe(2)
  expect(bisectLeft(boxes, 3, 2)).toBe(2)
  expect(bisectLeft(boxes, 4, 2)).toBe(3)
  expect(bisectLeft(boxes, 5, 2)).toBe(4)
  expect(bisectLeft(boxes, 6, 2)).toBe(5)
})

it('bisector(accessor).left(array, value, lo, hi) observes the specified bounds', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectLeft = bisector(unbox).left
  expect(bisectLeft(boxes, 0, 2, 3)).toBe(2)
  expect(bisectLeft(boxes, 1, 2, 3)).toBe(2)
  expect(bisectLeft(boxes, 2, 2, 3)).toBe(2)
  expect(bisectLeft(boxes, 3, 2, 3)).toBe(2)
  expect(bisectLeft(boxes, 4, 2, 3)).toBe(3)
  expect(bisectLeft(boxes, 5, 2, 3)).toBe(3)
  expect(bisectLeft(boxes, 6, 2, 3)).toBe(3)
})

it('bisector(accessor).right(array, value) returns the index after an exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectRight = bisector(unbox).right
  expect(bisectRight(boxes, 1)).toBe(1)
  expect(bisectRight(boxes, 2)).toBe(2)
  expect(bisectRight(boxes, 3)).toBe(3)
})

it('bisector(accessor).right(array, value) returns the index after the last match', () => {
  const boxes = [1, 2, 2, 3].map(box)
  const bisectRight = bisector(unbox).right
  expect(bisectRight(boxes, 1)).toBe(1)
  expect(bisectRight(boxes, 2)).toBe(3)
  expect(bisectRight(boxes, 3)).toBe(4)
})

it('bisector(accessor).right(array, value) returns the insertion point of a non-exact match', () => {
  const boxes = [1, 2, 3].map(box)
  const bisectRight = bisector(unbox).right
  expect(bisectRight(boxes, 0.5)).toBe(0)
  expect(bisectRight(boxes, 1.5)).toBe(1)
  expect(bisectRight(boxes, 2.5)).toBe(2)
  expect(bisectRight(boxes, 3.5)).toBe(3)
})

it('bisector(accessor).right(array, value, lo) observes the specified lower bound', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectRight = bisector(unbox).right
  expect(bisectRight(boxes, 0, 2)).toBe(2)
  expect(bisectRight(boxes, 1, 2)).toBe(2)
  expect(bisectRight(boxes, 2, 2)).toBe(2)
  expect(bisectRight(boxes, 3, 2)).toBe(3)
  expect(bisectRight(boxes, 4, 2)).toBe(4)
  expect(bisectRight(boxes, 5, 2)).toBe(5)
  expect(bisectRight(boxes, 6, 2)).toBe(5)
})

it('bisector(accessor).right(array, value, lo, hi) observes the specified bounds', () => {
  const boxes = [1, 2, 3, 4, 5].map(box)
  const bisectRight = bisector(unbox).right
  expect(bisectRight(boxes, 0, 2, 3)).toBe(2)
  expect(bisectRight(boxes, 1, 2, 3)).toBe(2)
  expect(bisectRight(boxes, 2, 2, 3)).toBe(2)
  expect(bisectRight(boxes, 3, 2, 3)).toBe(3)
  expect(bisectRight(boxes, 4, 2, 3)).toBe(3)
  expect(bisectRight(boxes, 5, 2, 3)).toBe(3)
  expect(bisectRight(boxes, 6, 2, 3)).toBe(3)
})

it('bisector(accessor).center(array, value) returns the closest index', () => {
  const data = [0, 1, 2, 3, 4]
  const bisectCenter = bisector((d: any) => +d).center
  expect(bisectCenter(data, 2)).toBe(2)
  expect(bisectCenter(data, 2.2)).toBe(2)
  expect(bisectCenter(data, 2.6)).toBe(3)
  expect(bisectCenter(data, 3)).toBe(3)
  expect(bisectCenter(data, 4)).toBe(4)
  expect(bisectCenter(data, 4.5)).toBe(4)
})

it('bisector(comparator).center(array, value) returns the closest index', () => {
  const data = [0, 1, 2, 3, 4]
  const bisectCenter = bisector((d: any, x: any) => +d - x).center
  expect(bisectCenter(data, 2)).toBe(2)
  expect(bisectCenter(data, 2.2)).toBe(2)
  expect(bisectCenter(data, 2.6)).toBe(3)
  expect(bisectCenter(data, 3)).toBe(3)
})

it('bisector(comparator).center(empty, value) returns zero', () => {
  expect((bisector as any)(() => { throw new Error() }).center([], 1)).toBe(0)
})

it('bisector(ascending).center(array, value) returns the left value', () => {
  const data = [0, 1, 2, 3, 4]
  const bisectCenter = bisector(ascending).center
  expect(bisectCenter(data, 2.0)).toBe(2)
  expect(bisectCenter(data, 2.2)).toBe(3)
  expect(bisectCenter(data, 2.6)).toBe(3)
  expect(bisectCenter(data, 3.0)).toBe(3)
})

it('bisector(ordinalAccessor).center(array, value) returns the left value', () => {
  const data = ['aa', 'bb', 'cc', 'dd', 'ee']
  const bisectCenter = bisector((d: any) => d).center
  expect(bisectCenter(data, 'cc')).toBe(2)
  expect(bisectCenter(data, 'ce')).toBe(3)
  expect(bisectCenter(data, 'cf')).toBe(3)
  expect(bisectCenter(data, 'dd')).toBe(3)
})
