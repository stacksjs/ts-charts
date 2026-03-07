import { describe, expect, it } from 'bun:test'
import { Delaunay } from '../src/index.ts'
import Path from '../src/path.ts'
import Context from './context.ts'

describe('Delaunay', () => {
  it('Delaunay.from(array)', () => {
    const delaunay = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 1]])
    expect(delaunay.points).toEqual(Float64Array.of(0, 0, 1, 0, 0, 1, 1, 1))
    expect(delaunay.triangles).toEqual(Uint32Array.of(0, 2, 1, 2, 3, 1))
    expect(delaunay.halfedges).toEqual(Int32Array.of(-1, 5, -1, -1, -1, 1))
    expect(delaunay.inedges).toEqual(Int32Array.of(2, 4, 0, 3))
    expect(Array.from(delaunay.neighbors(0))).toEqual([1, 2])
    expect(Array.from(delaunay.neighbors(1))).toEqual([3, 2, 0])
    expect(Array.from(delaunay.neighbors(2))).toEqual([0, 1, 3])
    expect(Array.from(delaunay.neighbors(3))).toEqual([2, 1])
  })

  it('Delaunay.from(array) handles coincident points', () => {
    const delaunay = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 0]])
    expect(delaunay.inedges).toEqual(Int32Array.of(2, 1, 0, -1))
    expect(Array.from(delaunay.neighbors(0))).toEqual([1, 2])
    expect(Array.from(delaunay.neighbors(1))).toEqual([2, 0])
    expect(Array.from(delaunay.neighbors(2))).toEqual([0, 1])
    expect(Array.from(delaunay.neighbors(3))).toEqual([])
  })

  it('Delaunay.from(iterable)', () => {
    const delaunay = Delaunay.from((function*() {
      yield [0, 0]
      yield [1, 0]
      yield [0, 1]
      yield [1, 1]
    })())
    expect(delaunay.points).toEqual(Float64Array.of(0, 0, 1, 0, 0, 1, 1, 1))
    expect(delaunay.triangles).toEqual(Uint32Array.of(0, 2, 1, 2, 3, 1))
    expect(delaunay.halfedges).toEqual(Int32Array.of(-1, 5, -1, -1, -1, 1))
  })

  it('Delaunay.from(iterable, fx, fy)', () => {
    const delaunay = Delaunay.from((function*() {
      yield { x: 0, y: 0 }
      yield { x: 1, y: 0 }
      yield { x: 0, y: 1 }
      yield { x: 1, y: 1 }
    })(), (d: { x: number, y: number }) => d.x, (d: { x: number, y: number }) => d.y)
    expect(delaunay.points).toEqual(Float64Array.of(0, 0, 1, 0, 0, 1, 1, 1))
    expect(delaunay.triangles).toEqual(Uint32Array.of(0, 2, 1, 2, 3, 1))
    expect(delaunay.halfedges).toEqual(Int32Array.of(-1, 5, -1, -1, -1, 1))
  })

  it('Delaunay.from({length}, fx, fy)', () => {
    const delaunay = Delaunay.from({ length: 4 } as ArrayLike<unknown>, (_d: unknown, i: number) => i & 1, (_d: unknown, i: number) => (i >> 1) & 1)
    expect(delaunay.points).toEqual(Float64Array.of(0, 0, 1, 0, 0, 1, 1, 1))
    expect(delaunay.triangles).toEqual(Uint32Array.of(0, 2, 1, 2, 3, 1))
    expect(delaunay.halfedges).toEqual(Int32Array.of(-1, 5, -1, -1, -1, 1))
  })

  it('delaunay.voronoi() uses the default bounds', () => {
    const voronoi = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 1]]).voronoi()
    expect(voronoi.xmin).toBe(0)
    expect(voronoi.ymin).toBe(0)
    expect(voronoi.xmax).toBe(960)
    expect(voronoi.ymax).toBe(500)
  })

  it('delaunay.voronoi([xmin, ymin, xmax, ymax]) uses the specified bounds', () => {
    const voronoi = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 1]]).voronoi([-1, -1, 2, 2])
    expect(voronoi.xmin).toBe(-1)
    expect(voronoi.ymin).toBe(-1)
    expect(voronoi.xmax).toBe(2)
    expect(voronoi.ymax).toBe(2)
  })

  it('delaunay.voronoi() returns the expected diagram', () => {
    const voronoi = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 1]]).voronoi()
    expect(voronoi.circumcenters).toEqual(Float64Array.of(0.5, 0.5, 0.5, 0.5))
    expect(voronoi.vectors).toEqual(Float64Array.of(0, -1, -1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, 1, 0))
  })

  it('delaunay.voronoi() skips cells for coincident points', () => {
    const voronoi = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 0]]).voronoi([-1, -1, 2, 2])
    expect(voronoi.circumcenters).toEqual(Float64Array.of(0.5, 0.5))
    expect(voronoi.vectors).toEqual(Float64Array.of(0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, 0, 0, 0))
  })

  it('delaunay.voronoi() for zero point returns expected values', () => {
    const voronoi = Delaunay.from([]).voronoi([-1, -1, 2, 2])
    expect(voronoi.render()).toBe(null)
  })

  it('delaunay.renderPoints() accepts r', () => {
    const delaunay = Delaunay.from([[0, 0]])
    expect(delaunay.renderPoints()).toBe('M2,0A2,2,0,1,1,-2,0A2,2,0,1,1,2,0')
    expect(delaunay.renderPoints(5)).toBe('M5,0A5,5,0,1,1,-5,0A5,5,0,1,1,5,0')
    expect(delaunay.renderPoints('5')).toBe('M5,0A5,5,0,1,1,-5,0A5,5,0,1,1,5,0')
    expect(delaunay.renderPoints(null, 5)).toBe('M5,0A5,5,0,1,1,-5,0A5,5,0,1,1,5,0')
    expect(delaunay.renderPoints(undefined)).toBe('M2,0A2,2,0,1,1,-2,0A2,2,0,1,1,2,0')
    expect(delaunay.renderPoints(null)).toBe('M2,0A2,2,0,1,1,-2,0A2,2,0,1,1,2,0')
    expect(delaunay.renderPoints(null, null)).toBe('M2,0A2,2,0,1,1,-2,0A2,2,0,1,1,2,0')
    const path = new Path()
    expect((delaunay.renderPoints(path as any, '3'), path.value())).toBe('M3,0A3,3,0,1,1,-3,0A3,3,0,1,1,3,0')
  })

  it('delaunay.voronoi() for one point returns the bounding rectangle', () => {
    const voronoi = Delaunay.from([[0, 0]]).voronoi([-1, -1, 2, 2])
    expect(voronoi.renderCell(0)).toBe('M2,-1L2,2L-1,2L-1,-1Z')
    expect(voronoi.render()).toBe(null)
  })

  it('delaunay.voronoi() for two points', () => {
    const voronoi = Delaunay.from([[0, 0], [1, 0], [1, 0], [1, 0]]).voronoi([-1, -1, 2, 2])
    expect(voronoi.renderCell(0)).toBe('M-1,2L-1,-1L0.5,-1L0.5,2Z')
    expect(voronoi.delaunay.find(-1, 0)).toBe(0)
    expect(voronoi.delaunay.find(2, 0)).toBe(1)
  })

  it('delaunay.voronoi() for collinear points', () => {
    const voronoi = Delaunay.from([[0, 0], [1, 0], [-1, 0]]).voronoi([-1, -1, 2, 2])
    expect(Array.from(voronoi.delaunay.neighbors(0)).sort()).toEqual([1, 2])
    expect(Array.from(voronoi.delaunay.neighbors(1))).toEqual([0])
    expect(Array.from(voronoi.delaunay.neighbors(2))).toEqual([0])
  })

  it('delaunay.find(x, y) returns the index of the cell that contains the specified point', () => {
    const delaunay = Delaunay.from([[0, 0], [300, 0], [0, 300], [300, 300], [100, 100]])
    expect(delaunay.find(49, 49)).toBe(0)
    expect(delaunay.find(51, 51)).toBe(4)
  })

  it('delaunay.find(x, y) works with one point', () => {
    const delaunay = new Delaunay([0, 1])
    expect(delaunay.find(0, -1)).toBe(0)
    expect(delaunay.find(0, 2.2)).toBe(0)
    delaunay.points.fill(0)
    delaunay.update()
    expect(delaunay.find(0, -1)).toBe(0)
    expect(delaunay.find(0, 1.2)).toBe(0)
  })

  it('delaunay.find(x, y) works with two points', () => {
    const delaunay = new Delaunay([0, 1, 0, 2])
    expect(delaunay.find(0, -1)).toBe(0)
    expect(delaunay.find(0, 2.2)).toBe(1)
    delaunay.points.fill(0)
    delaunay.update()
    expect(delaunay.find(0, -1)).toBe(0)
    expect(delaunay.find(0, 1.2)).toBe(0)
  })

  it('delaunay.find(x, y) returns -1 for empty points array', () => {
    const delaunay = new Delaunay([])
    expect(delaunay.find(0, -1)).toBe(-1)
  })

  it('delaunay.find(x, y) returns -1 for half a point', () => {
    const delaunay = new Delaunay([0]) // invalid; considered empty
    expect(delaunay.find(0, -1)).toBe(-1)
    expect(delaunay.find(0, 2.2)).toBe(-1)
  })

  it('delaunay.find(x, y) works with collinear points', () => {
    const points = [[0, 1], [0, 2], [0, 4], [0, 0], [0, 3], [0, 4], [0, 4]]
    const delaunay = Delaunay.from(points)
    expect(points[delaunay.find(0, -1)][1]).toBe(0)
    expect(points[delaunay.find(0, 1.2)][1]).toBe(1)
    expect(points[delaunay.find(1, 1.9)][1]).toBe(2)
    expect(points[delaunay.find(-1, 3.3)][1]).toBe(3)
    expect(points[delaunay.find(10, 10)][1]).toBe(4)
    expect(points[delaunay.find(10, 10, 0)][1]).toBe(4)
  })

  it('delaunay.find(x, y) works with collinear points 2', () => {
    const points = Array.from({ length: 120 }, (_, i) => [i * 4, i / 3 + 100])
    const delaunay = Delaunay.from(points)
    expect([...delaunay.neighbors(2)]).toEqual([1, 3])
  })

  it('delaunay.find(x, y) works with collinear points 3', () => {
    const points = Array.from({ length: 120 }, (_, i) => [i * 4, i / 3 + 100])
    const delaunay = Delaunay.from(points)
    expect([...delaunay.neighbors(2)]).toEqual([1, 3])
  })

  it('delaunay.find(x, y) works with collinear points (large)', () => {
    const points = Array.from({ length: 2000 }, (_, i) => [i ** 2, i ** 2])
    const delaunay = Delaunay.from(points)
    expect(points[delaunay.find(0, -1)][1]).toBe(0)
    expect(points[delaunay.find(0, 1.2)][1]).toBe(1)
    expect(points[delaunay.find(3.9, 3.9)][1]).toBe(4)
    expect(points[delaunay.find(10, 9.5)][1]).toBe(9)
    expect(points[delaunay.find(10, 9.5, 0)][1]).toBe(9)
    expect(points[delaunay.find(1e6, 1e6)][1]).toBe(1e6)
  })

  it('delaunay.update() allows fast updates', () => {
    const delaunay = Delaunay.from([[0, 0], [300, 0], [0, 300], [300, 300], [100, 100]])
    const circumcenters1 = delaunay.voronoi([-500, -500, 500, 500]).circumcenters
    for (let i = 0; i < delaunay.points.length; i++) {
      delaunay.points[i] = -delaunay.points[i]
    }
    delaunay.update()
    const circumcenters2 = delaunay.voronoi([-500, -500, 500, 500]).circumcenters
    expect(circumcenters1).toEqual(Float64Array.from([150, -50, -50, 150, 250, 150, 150, 250]))
    expect(circumcenters2).toEqual(Float64Array.from([-150, 50, -250, -150, 50, -150, -150, -250]))
  })

  it('delaunay.update() updates collinear points', () => {
    const delaunay = new Delaunay(Array.from({ length: 250 }).fill(0) as number[])
    expect(delaunay.collinear).toBeUndefined()
    for (let i = 0; i < delaunay.points.length; i++)
      delaunay.points[i] = (i % 2) ? i : 0
    delaunay.update()
    expect(delaunay.collinear!.length).toBe(125)
    for (let i = 0; i < delaunay.points.length; i++)
      delaunay.points[i] = Math.sin(i)
    delaunay.update()
    expect(delaunay.collinear).toBeUndefined()
    for (let i = 0; i < delaunay.points.length; i++)
      delaunay.points[i] = (i % 2) ? i : 0
    delaunay.update()
    expect(delaunay.collinear!.length).toBe(125)
    for (let i = 0; i < delaunay.points.length; i++)
      delaunay.points[i] = 0
    delaunay.update()
    expect(delaunay.collinear).toBeUndefined()
  })

  it('delaunay.find(x, y) with coincident point', () => {
    let delaunay = Delaunay.from([[0, 0], [0, 0], [10, 10], [10, -10]])
    expect(delaunay.find(100, 100)).toBe(2)
    expect(delaunay.find(0, 0, 1)).toBeGreaterThan(-1)
    delaunay = Delaunay.from(Array.from({ length: 1000 }, () => [0, 0]).concat([[10, 10], [10, -10]]))
    expect(delaunay.find(0, 0, 1)).toBeGreaterThan(-1)
  })

  it('delaunay.find(x, y, i) traverses the convex hull', () => {
    const delaunay = new Delaunay(Float64Array.of(509, 253, 426, 240, 426, 292, 567, 272, 355, 356, 413, 392, 319, 408, 374, 285, 327, 303, 381, 215, 475, 319, 301, 352, 247, 426, 532, 334, 234, 366, 479, 375, 251, 302, 340, 170, 160, 377, 626, 317, 177, 296, 322, 243, 195, 422, 241, 232, 585, 358, 666, 406, 689, 343, 172, 198, 527, 401, 766, 350, 444, 432, 117, 316, 267, 170, 580, 412, 754, 425, 117, 231, 725, 300, 700, 222, 438, 165, 703, 168, 558, 221, 475, 211, 491, 125, 216, 166, 240, 108, 783, 266, 640, 258, 184, 77, 387, 90, 162, 125, 621, 162, 296, 78, 532, 154, 763, 199, 132, 165, 422, 343, 312, 128, 125, 77, 450, 95, 635, 106, 803, 415, 714, 63, 529, 87, 388, 152, 575, 126, 573, 64, 726, 381, 773, 143, 787, 67, 690, 117, 813, 203, 811, 319))
    expect(delaunay.find(49, 311)).toBe(31)
    expect(delaunay.find(49, 311, 22)).toBe(31)
  })

  it('delaunay.renderHull(context) is closed', () => {
    const delaunay = Delaunay.from([[0, 0], [1, 0], [0, 1], [1, 1]])
    const context = new Context()
    delaunay.renderHull(context as any)
    expect(context.toString()).toBe('M0,1L1,1L1,0L0,0Z')
  })
})
