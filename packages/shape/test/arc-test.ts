import { describe, it, expect } from 'bun:test'
import { arc } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

it('arc().innerRadius(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().innerRadius(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().outerRadius(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().outerRadius(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().cornerRadius(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().outerRadius(100).cornerRadius(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().startAngle(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().startAngle(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().endAngle(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().endAngle(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().padAngle(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().outerRadius(100).startAngle(Math.PI / 2).padAngle(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().padRadius(f)(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().outerRadius(100).startAngle(Math.PI / 2).padAngle(0.1).padRadius(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().centroid(...) computes the midpoint of the center line of the arc', () => {
  const a = arc(), round = function (x: number): number { return Math.round(x * 1e6) / 1e6 }
  expect(a.centroid({ innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: Math.PI }).map(round)).toEqual([50, 0])
  expect(a.centroid({ innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: Math.PI / 2 }).map(round)).toEqual([35.355339, -35.355339])
  expect(a.centroid({ innerRadius: 50, outerRadius: 100, startAngle: 0, endAngle: -Math.PI }).map(round)).toEqual([-75, -0])
  expect(a.centroid({ innerRadius: 50, outerRadius: 100, startAngle: 0, endAngle: -Math.PI / 2 }).map(round)).toEqual([-53.033009, -53.033009])
})

it('arc().innerRadius(f).centroid(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().innerRadius(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).centroid.apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().outerRadius(f).centroid(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().outerRadius(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).centroid.apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().startAngle(f).centroid(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().startAngle(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).centroid.apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().endAngle(f).centroid(...) propagates the context and arguments to the specified function f', () => {
  const expected = { that: {}, args: [42] }
  let actual: any
  arc().endAngle(function (this: any) { actual = { that: this, args: [].slice.call(arguments) } }).centroid.apply(expected.that, expected.args)
  expect(actual).toEqual(expected)
})

it('arc().innerRadius(0).outerRadius(0) renders a point', () => {
  const a = arc().innerRadius(0).outerRadius(0)
  assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), 'M0,0Z')
  assertPathEqual(a.startAngle(0).endAngle(0)(), 'M0,0Z')
})

it('a negative angle span proceeds anticlockwise', () => {
  const a = arc().innerRadius(0).outerRadius(100)
  assertPathEqual(a.startAngle(0).endAngle(-Math.PI / 2)(), 'M0,-100A100,100,0,0,0,-100,0L0,0Z')
})

it('arc().innerRadius(0).outerRadius(r).startAngle(t0).endAngle(t1) renders a clockwise circle if r > 0 and t1 - t0 >= tau', () => {
  const a = arc().innerRadius(0).outerRadius(100)
  assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), 'M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z')
  assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI)(), 'M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z')
  assertPathEqual(a.startAngle(-2 * Math.PI).endAngle(0)(), 'M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z')
  assertPathEqual(a.startAngle(-Math.PI).endAngle(Math.PI)(), 'M0,100A100,100,0,1,1,0,-100A100,100,0,1,1,0,100Z')
  assertPathEqual(a.startAngle(-3 * Math.PI).endAngle(0)(), 'M0,100A100,100,0,1,1,0,-100A100,100,0,1,1,0,100Z')
})

it('arc().innerRadius(0).outerRadius(r).startAngle(t0).endAngle(t1) renders an anticlockwise circle if r > 0 and t0 - t1 >= tau', () => {
  const a = arc().innerRadius(0).outerRadius(100)
  assertPathEqual(a.startAngle(0).endAngle(-2 * Math.PI)(), 'M0,-100A100,100,0,1,0,0,100A100,100,0,1,0,0,-100Z')
  assertPathEqual(a.startAngle(0).endAngle(-3 * Math.PI)(), 'M0,-100A100,100,0,1,0,0,100A100,100,0,1,0,0,-100Z')
  assertPathEqual(a.startAngle(2 * Math.PI).endAngle(0)(), 'M0,-100A100,100,0,1,0,0,100A100,100,0,1,0,0,-100Z')
  assertPathEqual(a.startAngle(Math.PI).endAngle(-Math.PI)(), 'M0,100A100,100,0,1,0,0,-100A100,100,0,1,0,0,100Z')
  assertPathEqual(a.startAngle(3 * Math.PI).endAngle(0)(), 'M0,100A100,100,0,1,0,0,-100A100,100,0,1,0,0,100Z')
})

it('arc().innerRadius(0).outerRadius(r).startAngle(t0).endAngle(t1) renders a small clockwise sector if r > 0 and pi > t1 - t0 >= 0', () => {
  const a = arc().innerRadius(0).outerRadius(100)
  assertPathEqual(a.startAngle(0).endAngle(Math.PI / 2)(), 'M0,-100A100,100,0,0,1,100,0L0,0Z')
})

it('arc().innerRadius(0).outerRadius(r).startAngle(t0).endAngle(t1) renders a large clockwise sector if r > 0 and tau > t1 - t0 >= pi', () => {
  const a = arc().innerRadius(0).outerRadius(100)
  assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI / 2)(), 'M0,-100A100,100,0,1,1,-100,0L0,0Z')
})

it('arc().innerRadius(50).outerRadius(100).startAngle(0).endAngle(pi/2) renders an annular sector', () => {
  const a = arc().innerRadius(50).outerRadius(100)
  assertPathEqual(a.startAngle(0).endAngle(Math.PI / 2)(), 'M0,-100A100,100,0,0,1,100,0L50,0A50,50,0,0,0,0,-50Z')
})

it('arc().innerRadius(0).outerRadius(0).cornerRadius(r) renders a point', () => {
  const a = arc().innerRadius(0).outerRadius(0).cornerRadius(5)
  assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), 'M0,0Z')
  assertPathEqual(a.startAngle(0).endAngle(0)(), 'M0,0Z')
})

it('arc().innerRadius(0).outerRadius(r).startAngle(0).endAngle(tau).padAngle(delta) does not pad a circle', () => {
  const a = arc().innerRadius(0).outerRadius(100).startAngle(0).endAngle(2 * Math.PI).padAngle(0.1)
  assertPathEqual(a(), 'M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z')
})

it('arc().innerRadius(0).outerRadius(r).startAngle(t0).endAngle(t1).padAngle(delta) pads the outside of a circular sector', () => {
  const a = arc().innerRadius(0).outerRadius(100).startAngle(0).endAngle(Math.PI / 2).padAngle(0.1)
  assertPathEqual(a(), 'M4.997917,-99.875026A100,100,0,0,1,99.875026,-4.997917L0,0Z')
})

it('arc() handles a very small arc with rounded corners', () => {
  const a = arc().innerRadius(15).outerRadius(24).padAngle(0).startAngle(1.2 - 1e-8).endAngle(1.2).cornerRadius(4)
  assertPathEqual(a(), 'M22.369,-8.697L13.981,-5.435Z')
})
