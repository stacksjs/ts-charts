import { describe, it, expect } from 'bun:test'
import { arc } from '../src/index.ts'
import { assertPathEqual } from './asserts.ts'

describe('arc', () => {
  // eslint-disable-next-line pickier/no-unused-vars
  it("arc().innerRadius(f)(…) propagates the context and arguments to the specified function f", () => {
    // eslint-disable-next-line pickier/no-unused-vars
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().innerRadius(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().outerRadius(f)(…) propagates the context and arguments to the specified function f", () => {
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().outerRadius(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().cornerRadius(f)(…) propagates the context and arguments to the specified function f", () => {
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().outerRadius(100).cornerRadius(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().startAngle(f)(…) propagates the context and arguments to the specified function f", () => {
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().startAngle(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().endAngle(f)(…) propagates the context and arguments to the specified function f", () => {
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().endAngle(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().padAngle(f)(…) propagates the context and arguments to the specified function f", () => {
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().outerRadius(100).startAngle(Math.PI / 2).padAngle(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().padRadius(f)(…) propagates the context and arguments to the specified function f", () => {
    const expected = {that: {}, args: [42]}
    let actual: any
    arc().outerRadius(100).startAngle(Math.PI / 2).padAngle(0.1).padRadius(function(this: any) { actual = {that: this, args: [].slice.call(arguments)} }).apply(expected.that, expected.args as any)
    expect(actual).toEqual(expected)
  })

  it("arc().centroid(…) computes the midpoint of the center line of the arc", () => {
    const a = arc(), round = function(x: number) { return Math.round(x * 1e6) / 1e6 }
    expect(a.centroid({innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: Math.PI}).map(round)).toEqual([50, 0])
    expect(a.centroid({innerRadius: 0, outerRadius: 100, startAngle: 0, endAngle: Math.PI / 2}).map(round)).toEqual([35.355339, -35.355339])
    expect(a.centroid({innerRadius: 50, outerRadius: 100, startAngle: 0, endAngle: -Math.PI}).map(round)).toEqual([-75, -0])
    expect(a.centroid({innerRadius: 50, outerRadius: 100, startAngle: 0, endAngle: -Math.PI / 2}).map(round)).toEqual([-53.033009, -53.033009])
  })

  it("arc().innerRadius(0).outerRadius(0) renders a point", () => {
    const a = arc().innerRadius(0).outerRadius(0)
    assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), "M0,0Z")
    assertPathEqual(a.startAngle(0).endAngle(0)(), "M0,0Z")
  })

  it("a negative angle span proceeds anticlockwise", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(-Math.PI/2)(), "M0,-100A100,100,0,0,0,-100,0L0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r).startAngle(θ₀).endAngle(θ₁) renders a clockwise circle if r > 0 and θ₁ - θ₀ >= τ", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z")
    assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI)(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z")
    assertPathEqual(a.startAngle(-2 * Math.PI).endAngle(0)(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z")
    assertPathEqual(a.startAngle(-Math.PI).endAngle(Math.PI)(), "M0,100A100,100,0,1,1,0,-100A100,100,0,1,1,0,100Z")
    assertPathEqual(a.startAngle(-3 * Math.PI).endAngle(0)(), "M0,100A100,100,0,1,1,0,-100A100,100,0,1,1,0,100Z")
  })

  it("arc().innerRadius(0).outerRadius(r).startAngle(θ₀).endAngle(θ₁) renders an anticlockwise circle if r > 0 and θ₀ - θ₁ >= τ", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(-2 * Math.PI)(), "M0,-100A100,100,0,1,0,0,100A100,100,0,1,0,0,-100Z")
    assertPathEqual(a.startAngle(0).endAngle(-3 * Math.PI)(), "M0,-100A100,100,0,1,0,0,100A100,100,0,1,0,0,-100Z")
    assertPathEqual(a.startAngle(2 * Math.PI).endAngle(0)(), "M0,-100A100,100,0,1,0,0,100A100,100,0,1,0,0,-100Z")
    assertPathEqual(a.startAngle(Math.PI).endAngle(-Math.PI)(), "M0,100A100,100,0,1,0,0,-100A100,100,0,1,0,0,100Z")
    assertPathEqual(a.startAngle(3 * Math.PI).endAngle(0)(), "M0,100A100,100,0,1,0,0,-100A100,100,0,1,0,0,100Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁) renders a clockwise annulus if θ₀ - θ₁ >= τ", () => {
    const a = arc().innerRadius(50).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100M0,-50A50,50,0,1,0,0,50A50,50,0,1,0,0,-50Z")
    assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI)(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100M0,50A50,50,0,1,0,0,-50A50,50,0,1,0,0,50Z")
  })

  it("arc().innerRadius(0).outerRadius(r) renders a small clockwise sector if π > θ₁ - θ₀ >= 0", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(Math.PI / 2)(), "M0,-100A100,100,0,0,1,100,0L0,0Z")
    assertPathEqual(a.startAngle(2 * Math.PI).endAngle(5 * Math.PI / 2)(), "M0,-100A100,100,0,0,1,100,0L0,0Z")
    assertPathEqual(a.startAngle(-Math.PI).endAngle(-Math.PI / 2)(), "M0,100A100,100,0,0,1,-100,0L0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r) renders a small anticlockwise sector", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(-Math.PI / 2)(), "M0,-100A100,100,0,0,0,-100,0L0,0Z")
    assertPathEqual(a.startAngle(-2 * Math.PI).endAngle(-5 * Math.PI / 2)(), "M0,-100A100,100,0,0,0,-100,0L0,0Z")
    assertPathEqual(a.startAngle(Math.PI).endAngle(Math.PI / 2)(), "M0,100A100,100,0,0,0,100,0L0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r) renders a large clockwise sector if τ > θ₁ - θ₀ >= π", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI / 2)(), "M0,-100A100,100,0,1,1,-100,0L0,0Z")
    assertPathEqual(a.startAngle(2 * Math.PI).endAngle(7 * Math.PI / 2)(), "M0,-100A100,100,0,1,1,-100,0L0,0Z")
    assertPathEqual(a.startAngle(-Math.PI).endAngle(Math.PI / 2)(), "M0,100A100,100,0,1,1,100,0L0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r) renders a large anticlockwise sector", () => {
    const a = arc().innerRadius(0).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(-3 * Math.PI / 2)(), "M0,-100A100,100,0,1,0,100,0L0,0Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁) renders a small clockwise annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(Math.PI / 2)(), "M0,-100A100,100,0,0,1,100,0L50,0A50,50,0,0,0,0,-50Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁) renders a small anticlockwise annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(-Math.PI / 2)(), "M0,-100A100,100,0,0,0,-100,0L-50,0A50,50,0,0,1,0,-50Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁) renders a large clockwise annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI / 2)(), "M0,-100A100,100,0,1,1,-100,0L-50,0A50,50,0,1,0,0,-50Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁) renders a large anticlockwise annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100)
    assertPathEqual(a.startAngle(0).endAngle(-3 * Math.PI / 2)(), "M0,-100A100,100,0,1,0,100,0L50,0A50,50,0,1,1,0,-50Z")
  })

  it("arc().innerRadius(0).outerRadius(0).cornerRadius(r) renders a point", () => {
    const a = arc().innerRadius(0).outerRadius(0).cornerRadius(5)
    assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), "M0,0Z")
    assertPathEqual(a.startAngle(0).endAngle(0)(), "M0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r).cornerRadius(rᵧ) renders a clockwise circle if θ₁ - θ₀ >= τ", () => {
    const a = arc().innerRadius(0).outerRadius(100).cornerRadius(5)
    assertPathEqual(a.startAngle(0).endAngle(2 * Math.PI)(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z")
  })

  it("arc().innerRadius(0).outerRadius(r).cornerRadius(rᵧ) renders a small clockwise sector", () => {
    const a = arc().innerRadius(0).outerRadius(100).cornerRadius(5)
    assertPathEqual(a.startAngle(0).endAngle(Math.PI / 2)(), "M0,-94.868330A5,5,0,0,1,5.263158,-99.861400A100,100,0,0,1,99.861400,-5.263158A5,5,0,0,1,94.868330,0L0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r).cornerRadius(rᵧ) renders a large clockwise sector", () => {
    const a = arc().innerRadius(0).outerRadius(100).cornerRadius(5)
    assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI / 2)(), "M0,-94.868330A5,5,0,0,1,5.263158,-99.861400A100,100,0,1,1,-99.861400,5.263158A5,5,0,0,1,-94.868330,0L0,0Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).cornerRadius(rᵧ) renders a small clockwise annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100).cornerRadius(5)
    assertPathEqual(a.startAngle(0).endAngle(Math.PI / 2)(), "M0,-94.868330A5,5,0,0,1,5.263158,-99.861400A100,100,0,0,1,99.861400,-5.263158A5,5,0,0,1,94.868330,0L54.772256,0A5,5,0,0,1,49.792960,-4.545455A50,50,0,0,0,4.545455,-49.792960A5,5,0,0,1,0,-54.772256Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).cornerRadius(rᵧ) renders a large clockwise annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100).cornerRadius(5)
    assertPathEqual(a.startAngle(0).endAngle(3 * Math.PI / 2)(), "M0,-94.868330A5,5,0,0,1,5.263158,-99.861400A100,100,0,1,1,-99.861400,5.263158A5,5,0,0,1,-94.868330,0L-54.772256,0A5,5,0,0,1,-49.792960,4.545455A50,50,0,1,0,4.545455,-49.792960A5,5,0,0,1,0,-54.772256Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).cornerRadius(rᵧ) restricts rᵧ to |r₁ - r₀| / 2", () => {
    const a = arc().cornerRadius(Infinity).startAngle(0).endAngle(Math.PI / 2)
    assertPathEqual(a.innerRadius(90).outerRadius(100)(), "M0,-94.868330A5,5,0,0,1,5.263158,-99.861400A100,100,0,0,1,99.861400,-5.263158A5,5,0,0,1,94.868330,0L94.868330,0A5,5,0,0,1,89.875260,-4.736842A90,90,0,0,0,4.736842,-89.875260A5,5,0,0,1,0,-94.868330Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).cornerRadius(rᵧ) merges adjacent corners when rᵧ is relatively large", () => {
    const a = arc().cornerRadius(Infinity).startAngle(0).endAngle(Math.PI / 2)
    assertPathEqual(a.innerRadius(10).outerRadius(100)(), "M0,-41.421356A41.421356,41.421356,0,1,1,41.421356,0L24.142136,0A24.142136,24.142136,0,0,1,0,-24.142136Z")
  })

  it("arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(τ).padAngle(δ) does not pad a point", () => {
    const a = arc().innerRadius(0).outerRadius(0).startAngle(0).endAngle(2 * Math.PI).padAngle(0.1)
    assertPathEqual(a(), "M0,0Z")
  })

  it("arc().innerRadius(0).outerRadius(r).startAngle(0).endAngle(τ).padAngle(δ) does not pad a circle", () => {
    const a = arc().innerRadius(0).outerRadius(100).startAngle(0).endAngle(2 * Math.PI).padAngle(0.1)
    assertPathEqual(a(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).startAngle(0).endAngle(τ).padAngle(δ) does not pad an annulus", () => {
    const a = arc().innerRadius(50).outerRadius(100).startAngle(0).endAngle(2 * Math.PI).padAngle(0.1)
    assertPathEqual(a(), "M0,-100A100,100,0,1,1,0,100A100,100,0,1,1,0,-100M0,-50A50,50,0,1,0,0,50A50,50,0,1,0,0,-50Z")
  })

  it("arc().innerRadius(0).outerRadius(r).padAngle(δ) pads the outside of a circular sector", () => {
    const a = arc().innerRadius(0).outerRadius(100).startAngle(0).endAngle(Math.PI / 2).padAngle(0.1)
    assertPathEqual(a(), "M4.997917,-99.875026A100,100,0,0,1,99.875026,-4.997917L0,0Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).padAngle(δ) pads an annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100).startAngle(0).endAngle(Math.PI / 2).padAngle(0.1)
    assertPathEqual(a(), "M5.587841,-99.843758A100,100,0,0,1,99.843758,-5.587841L49.686779,-5.587841A50,50,0,0,0,5.587841,-49.686779Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).padAngle(δ) may collapse the inside of an annular sector", () => {
    const a = arc().innerRadius(10).outerRadius(100).startAngle(0).endAngle(Math.PI / 2).padAngle(0.2)
    assertPathEqual(a(), "M10.033134,-99.495408A100,100,0,0,1,99.495408,-10.033134L7.071068,-7.071068Z")
  })

  it("arc().innerRadius(0).outerRadius(r).padAngle(δ).cornerRadius(rᵧ) rounds and pads a circular sector", () => {
    const a = arc().innerRadius(0).outerRadius(100).startAngle(0).endAngle(Math.PI / 2).padAngle(0.1).cornerRadius(10)
    assertPathEqual(a(), "M4.470273,-89.330939A10,10,0,0,1,16.064195,-98.701275A100,100,0,0,1,98.701275,-16.064195A10,10,0,0,1,89.330939,-4.470273L0,0Z")
  })

  it("arc().innerRadius(r₀).outerRadius(r₁).padAngle(δ).cornerRadius(rᵧ) rounds and pads an annular sector", () => {
    const a = arc().innerRadius(50).outerRadius(100).startAngle(0).endAngle(Math.PI / 2).padAngle(0.1).cornerRadius(10)
    assertPathEqual(a(), "M5.587841,-88.639829A10,10,0,0,1,17.319823,-98.488698A100,100,0,0,1,98.488698,-17.319823A10,10,0,0,1,88.639829,-5.587841L57.939790,-5.587841A10,10,0,0,1,48.283158,-12.989867A50,50,0,0,0,12.989867,-48.283158A10,10,0,0,1,5.587841,-57.939790Z")
  })

  it("arc() handles a very small arc with rounded corners", () => {
    const a = arc().innerRadius(15).outerRadius(24).padAngle(0).startAngle(1.2 - 1e-8).endAngle(1.2).cornerRadius(4)
    assertPathEqual(a(), "M22.369,-8.697L13.981,-5.435Z")
  })
})
