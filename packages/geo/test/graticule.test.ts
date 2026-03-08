import { describe, it, expect } from 'bun:test'
import { geoGraticule } from '../src/index.ts'

describe('geoGraticule', () => {
  it('graticule.extent() gets precision', () => {
    const g = geoGraticule()
    expect(g.precision()).toBe(2.5)
    g.precision(999)
    expect(g.precision()).toBe(999)
  })

  it('graticule.extent(...) sets extentMinor and extentMajor', () => {
    const g = geoGraticule().extent([[-90, -45], [90, 45]])
    expect(g.extentMinor()).toEqual([[-90, -45], [90, 45]])
    expect(g.extentMajor()).toEqual([[-90, -45], [90, 45]])

    const gReversed = geoGraticule().extent([[90, 45], [-90, -45]])
    expect(gReversed.extentMinor()).toEqual([[-90, -45], [90, 45]])
    expect(gReversed.extentMajor()).toEqual([[-90, -45], [90, 45]])
  })

  it('graticule.extent() gets extentMinor', () => {
    const g = geoGraticule().extentMinor([[-90, -45], [90, 45]])
    expect(g.extent()).toEqual([[-90, -45], [90, 45]])
  })

  it('graticule.extentMajor() default longitude ranges from 180W (inclusive) to 180E (exclusive)', () => {
    const e = geoGraticule().extentMajor()
    expect(e[0][0]).toBe(-180)
    expect(e[1][0]).toBe(+180)
  })

  it('graticule.extentMajor() default latitude ranges from 90S (exclusive) to 90N (exclusive)', () => {
    const e = geoGraticule().extentMajor()
    expect(e[0][1]).toBe(-90 + 1e-6)
    expect(e[1][1]).toBe(+90 - 1e-6)
  })

  it('graticule.extentMinor() default longitude ranges from 180W (inclusive) to 180E (exclusive)', () => {
    const e = geoGraticule().extentMinor()
    expect(e[0][0]).toBe(-180)
    expect(e[1][0]).toBe(+180)
  })

  it('graticule.extentMinor() default latitude ranges from 80S (inclusive) to 80N (inclusive)', () => {
    const e = geoGraticule().extentMinor()
    expect(e[0][1]).toBe(-80 - 1e-6)
    expect(e[1][1]).toBe(+80 + 1e-6)
  })

  it('graticule.step(...) sets the minor and major step', () => {
    const g = geoGraticule().step([22.5, 22.5])
    expect(g.stepMinor()).toEqual([22.5, 22.5])
    expect(g.stepMajor()).toEqual([22.5, 22.5])
  })

  it('graticule.step() gets the minor step', () => {
    const g = geoGraticule().stepMinor([22.5, 22.5])
    expect(g.step()).toEqual([22.5, 22.5])
  })

  it('graticule.stepMinor() defaults to 10, 10', () => {
    expect(geoGraticule().stepMinor()).toEqual([10, 10])
  })

  it('graticule.stepMajor() defaults to 90, 360', () => {
    expect(geoGraticule().stepMajor()).toEqual([90, 360])
  })

  it('graticule.lines() default longitude ranges from 180W (inclusive) to 180E (exclusive)', () => {
    const lines = geoGraticule().lines()
      .filter((line: any) => line.coordinates[0][0] === line.coordinates[1][0])
      .sort((a: any, b: any) => a.coordinates[0][0] - b.coordinates[0][0])
    expect((lines[0].coordinates as number[][])[0][0]).toBe(-180)
    expect((lines[lines.length - 1].coordinates as number[][])[0][0]).toBe(+170)
  })

  it('graticule.lines() default latitude ranges from 90S (exclusive) to 90N (exclusive)', () => {
    const lines = geoGraticule().lines()
      .filter((line: any) => line.coordinates[0][1] === line.coordinates[1][1])
      .sort((a: any, b: any) => a.coordinates[0][1] - b.coordinates[0][1])
    expect((lines[0].coordinates as number[][])[0][1]).toBe(-80)
    expect((lines[lines.length - 1].coordinates as number[][])[0][1]).toBe(+80)
  })

  it('graticule() returns a MultiLineString of all lines', () => {
    const g = geoGraticule()
      .extent([[-90, -45], [90, 45]])
      .step([45, 45])
      .precision(3)
    expect(g()).toEqual({
      type: 'MultiLineString',
      coordinates: g.lines().map((line: any) => line.coordinates)
    })
  })

  it('graticule.lines() returns an array of LineStrings', () => {
    const lines = geoGraticule()
      .extent([[-90, -45], [90, 45]])
      .step([45, 45])
      .precision(3)
      .lines()
    expect(lines.length).toBeGreaterThan(0)
    lines.forEach((line: any) => {
      expect(line.type).toBe('LineString')
      expect(Array.isArray(line.coordinates)).toBe(true)
    })
  })

  it('graticule.outline() returns a Polygon encompassing the major extent', () => {
    const outline = geoGraticule()
      .extentMajor([[-90, -45], [90, 45]])
      .precision(3)
      .outline()
    expect(outline.type).toBe('Polygon')
    expect(Array.isArray(outline.coordinates)).toBe(true)
  })
})
