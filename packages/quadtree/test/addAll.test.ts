import { describe, expect, it } from 'bun:test'
import { quadtree } from '../src/index.ts'

describe('quadtree.addAll', () => {
  it('quadtree.addAll(data) creates new points and adds them to the quadtree', () => {
    const q = quadtree()
    expect(q.add([0.0, 0.0]).root()).toEqual({ data: [0, 0] })
    expect(q.add([0.9, 0.9]).root()).toEqual([{ data: [0, 0] },,, { data: [0.9, 0.9] }])
    expect(q.add([0.9, 0.0]).root()).toEqual([{ data: [0, 0] }, { data: [0.9, 0] },, { data: [0.9, 0.9] }])
    expect(q.add([0.0, 0.9]).root()).toEqual([{ data: [0, 0] }, { data: [0.9, 0] }, { data: [0, 0.9] }, { data: [0.9, 0.9] }])
    expect(q.add([0.4, 0.4]).root()).toEqual([[{ data: [0, 0] },,, { data: [0.4, 0.4] }], { data: [0.9, 0] }, { data: [0, 0.9] }, { data: [0.9, 0.9] }])
  })

  it('quadtree.addAll(data) ignores points with NaN coordinates', () => {
    const q = quadtree()
    expect(q.addAll([[NaN, 0], [0, NaN]]).root()).toEqual(undefined)
    expect(q.extent()).toBe(undefined)
    expect(q.addAll([[0, 0], [0.9, 0.9]]).root()).toEqual([{ data: [0, 0] },,, { data: [0.9, 0.9] }])
    expect(q.addAll([[NaN, 0], [0, NaN]]).root()).toEqual([{ data: [0, 0] },,, { data: [0.9, 0.9] }])
    expect(q.extent()).toEqual([[0, 0], [1, 1]])
  })

  it('quadtree.addAll(data) correctly handles the empty array', () => {
    const q = quadtree()
    expect(q.addAll([]).root()).toEqual(undefined)
    expect(q.extent()).toBe(undefined)
    expect(q.addAll([[0, 0], [1, 1]]).root()).toEqual([{ data: [0, 0] },,, { data: [1, 1] }])
    expect(q.addAll([]).root()).toEqual([{ data: [0, 0] },,, { data: [1, 1] }])
    expect(q.extent()).toEqual([[0, 0], [2, 2]])
  })

  it('quadtree.addAll(data) computes the extent of the data before adding', () => {
    const q = quadtree().addAll([[0.4, 0.4], [0, 0], [0.9, 0.9]])
    expect(q.root()).toEqual([[{ data: [0, 0] },,, { data: [0.4, 0.4] }],,, { data: [0.9, 0.9] }])
  })

  it('quadtree.addAll(iterable) adds points from an iterable', () => {
    const q = quadtree().addAll(new Set([[0.4, 0.4], [0, 0], [0.9, 0.9]]))
    expect(q.root()).toEqual([[{ data: [0, 0] },,, { data: [0.4, 0.4] }],,, { data: [0.9, 0.9] }])
  })

  it('quadtree(iterable) adds points from an iterable', () => {
    const q = quadtree(new Set([[0.4, 0.4], [0, 0], [0.9, 0.9]]))
    expect(q.root()).toEqual([[{ data: [0, 0] },,, { data: [0.4, 0.4] }],,, { data: [0.9, 0.9] }])
  })
})
