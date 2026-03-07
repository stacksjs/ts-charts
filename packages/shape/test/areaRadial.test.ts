import { describe, it, expect } from 'bun:test'
import { areaRadial, curveCardinal, curveLinear } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

it('areaRadial() returns a default radial area shape', () => {
  const a = areaRadial()
  expect(a.startAngle()([42, 34])).toBe(42)
  expect(a.endAngle()).toBeNull()
  expect(a.innerRadius()([42, 34])).toBe(0)
  expect(a.outerRadius()([42, 34])).toBe(34)
  expect(a.defined()([42, 34])).toBe(true)
  expect(a.curve()).toBe(curveLinear)
  expect(a.context()).toBeNull()
  assertPathEqual(a([[0, 1], [2, 3], [4, 5]]), 'M0,-1L2.727892,1.248441L-3.784012,3.268218L0,0L0,0L0,0Z')
})

it('areaRadial.lineStartAngle() returns a line derived from the area', () => {
  const defined = function () { return true }
  const curve = curveCardinal
  const context = {}
  const startAngle = function () {}
  const endAngle = function () {}
  const radius = function () {}
  const a = areaRadial().defined(defined).curve(curve).context(context).radius(radius).startAngle(startAngle).endAngle(endAngle)
  const l = a.lineStartAngle()
  expect(l.defined()).toBe(defined)
  expect(l.curve()).toBe(curve)
  expect(l.context()).toBe(context)
  expect(l.angle()).toBe(startAngle)
  expect(l.radius()).toBe(radius)
})

it('areaRadial.lineEndAngle() returns a line derived from the area', () => {
  const defined = function () { return true }
  const curve = curveCardinal
  const context = {}
  const startAngle = function () {}
  const endAngle = function () {}
  const radius = function () {}
  const a = areaRadial().defined(defined).curve(curve).context(context).radius(radius).startAngle(startAngle).endAngle(endAngle)
  const l = a.lineEndAngle()
  expect(l.defined()).toBe(defined)
  expect(l.curve()).toBe(curve)
  expect(l.context()).toBe(context)
  expect(l.angle()).toBe(endAngle)
  expect(l.radius()).toBe(radius)
})

it('areaRadial.lineInnerRadius() returns a line derived from the area', () => {
  const defined = function () { return true }
  const curve = curveCardinal
  const context = {}
  const angle = function () {}
  const innerRadius = function () {}
  const outerRadius = function () {}
  const a = areaRadial().defined(defined).curve(curve).context(context).angle(angle).innerRadius(innerRadius).outerRadius(outerRadius)
  const l = a.lineInnerRadius()
  expect(l.defined()).toBe(defined)
  expect(l.curve()).toBe(curve)
  expect(l.context()).toBe(context)
  expect(l.angle()).toBe(angle)
  expect(l.radius()).toBe(innerRadius)
})

it('areaRadial.lineOuterRadius() returns a line derived from the area', () => {
  const defined = function () { return true }
  const curve = curveCardinal
  const context = {}
  const angle = function () {}
  const innerRadius = function () {}
  const outerRadius = function () {}
  const a = areaRadial().defined(defined).curve(curve).context(context).angle(angle).innerRadius(innerRadius).outerRadius(outerRadius)
  const l = a.lineOuterRadius()
  expect(l.defined()).toBe(defined)
  expect(l.curve()).toBe(curve)
  expect(l.context()).toBe(context)
  expect(l.angle()).toBe(angle)
  expect(l.radius()).toBe(outerRadius)
})
