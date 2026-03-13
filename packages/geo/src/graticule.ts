import { range } from '@ts-charts/array'
import { abs, ceil, epsilon } from './math.ts'
import type { GeoObject } from './types.ts'

function graticuleX(y0: number, y1: number, dy: number): (x: number) => number[][] {
  const y = (range(y0, y1 - epsilon, dy) as number[]).concat(y1)
  return function (x: number): number[][] { return y.map(function (y: number): number[] { return [x, y] }) }
}

function graticuleY(x0: number, x1: number, dx: number): (y: number) => number[][] {
  const x = (range(x0, x1 - epsilon, dx) as number[]).concat(x1)
  return function (y: number): number[][] { return x.map(function (x: number): number[] { return [x, y] }) }
}

interface GeoGraticule {
  (): GeoObject
  lines(): GeoObject[]
  outline(): GeoObject
  extent(_?: number[][]): any
  extentMajor(_?: number[][]): any
  extentMinor(_?: number[][]): any
  step(_?: number[]): any
  stepMajor(_?: number[]): any
  stepMinor(_?: number[]): any
  precision(_?: number): any
}

export default function geoGraticule(): GeoGraticule {
  let x1: number, x0: number, X1: number, X0: number,
      y1: number, y0: number, Y1: number, Y0: number,
      dx = 10, dy = dx, DX = 90, DY = 360,
      x: (y: number) => number[][], y: (x: number) => number[][],
      X: (y: number) => number[][], Y: (x: number) => number[][],
      precision = 2.5

  function graticule(): GeoObject {
    return { type: 'MultiLineString', coordinates: lines() }
  }

  function lines(): number[][][] {
    return (range(ceil(X0 / DX) * DX, X1, DX) as number[]).map(X)
        .concat((range(ceil(Y0 / DY) * DY, Y1, DY) as number[]).map(Y))
        .concat((range(ceil(x0 / dx) * dx, x1, dx) as number[]).filter(function (x: number): boolean { return abs(x % DX) > epsilon }).map(x))
        .concat((range(ceil(y0 / dy) * dy, y1, dy) as number[]).filter(function (y: number): boolean { return abs(y % DY) > epsilon }).map(y))
  }

  graticule.lines = function (): GeoObject[] {
    return lines().map(function (coordinates: number[][]): GeoObject { return { type: 'LineString', coordinates: coordinates } })
  }

  graticule.outline = function (): GeoObject {
    return {
      type: 'Polygon',
      coordinates: [
        X(X0).concat(
        Y(Y1).slice(1),
        X(X1).reverse().slice(1),
        Y(Y0).reverse().slice(1))
      ]
    }
  }

  graticule.extent = function (_?: number[][]): any {
    if (!arguments.length) return graticule.extentMinor()
    return graticule.extentMajor(_!).extentMinor(_!)
  }

  graticule.extentMajor = function (_?: number[][]): any {
    if (!arguments.length) return [[X0, Y0], [X1, Y1]]
    X0 = +_![0][0], X1 = +_![1][0]
    Y0 = +_![0][1], Y1 = +_![1][1]
    // eslint-disable-next-line pickier/no-unused-vars
    if (X0 > X1) { const t = X0; X0 = X1; X1 = t }
    // eslint-disable-next-line pickier/no-unused-vars
    if (Y0 > Y1) { const t = Y0; Y0 = Y1; Y1 = t }
    return graticule.precision(precision)
  }

  graticule.extentMinor = function (_?: number[][]): any {
    if (!arguments.length) return [[x0, y0], [x1, y1]]
    x0 = +_![0][0], x1 = +_![1][0]
    y0 = +_![0][1], y1 = +_![1][1]
    // eslint-disable-next-line pickier/no-unused-vars
    if (x0 > x1) { const t = x0; x0 = x1; x1 = t }
    // eslint-disable-next-line pickier/no-unused-vars
    if (y0 > y1) { const t = y0; y0 = y1; y1 = t }
    return graticule.precision(precision)
  }

  graticule.step = function (_?: number[]): any {
    if (!arguments.length) return graticule.stepMinor()
    return graticule.stepMajor(_!).stepMinor(_!)
  }

  graticule.stepMajor = function (_?: number[]): any {
    if (!arguments.length) return [DX, DY]
    DX = +_![0], DY = +_![1]
    return graticule
  }

  graticule.stepMinor = function (_?: number[]): any {
    if (!arguments.length) return [dx, dy]
    dx = +_![0], dy = +_![1]
    return graticule
  }

  graticule.precision = function (_?: number): any {
    if (!arguments.length) return precision
    precision = +_!
    x = graticuleX(y0, y1, 90)
    y = graticuleY(x0, x1, precision)
    X = graticuleX(Y0, Y1, 90)
    Y = graticuleY(X0, X1, precision)
    return graticule
  }

  return graticule
      .extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]])
      .extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]])
}

export function graticule10(): GeoObject {
  return geoGraticule()()
}
