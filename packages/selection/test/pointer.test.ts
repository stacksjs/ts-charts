import { describe, it, expect } from 'bun:test'
import { pointer, pointers } from '../src/index.ts'

function mousemove(x: number, y: number, target: any = document.body): any {
  return {
    pageX: x,
    pageY: y,
    clientX: x,
    clientY: y,
    type: 'mousemove',
    target,
    currentTarget: target,
  }
}

function touchmove(x: number, y: number, target: any = document.body): any {
  return {
    type: 'touchmove',
    target,
    currentTarget: target,
    touches: [touch(x, y)],
  }
}

function touch(x: number, y: number): any {
  return {
    pageX: x,
    pageY: y,
    clientX: x,
    clientY: y,
  }
}

describe('pointer', () => {
  it('pointer(mousemove) returns an array of coordinates', () => {
    const target = document.createElement('div')
    expect(pointer(mousemove(10, 20))).toEqual([10, 20])
    expect(pointer(mousemove(10, 20, target), target)).toEqual([10, 20])
  })

  it('pointer(touch, target) returns an array of coordinates', () => {
    const target = document.createElement('div')
    expect(pointer(touch(10, 20), target)).toEqual([10, 20])
  })
})

describe('pointers', () => {
  it('pointers(mousemove) returns an array of arrays of coordinates', () => {
    const target = document.createElement('div')
    expect(pointers(mousemove(10, 20))).toEqual([[10, 20]])
    expect(pointers(mousemove(10, 20, target))).toEqual([[10, 20]])
  })

  it('pointers(touchmove) returns an array of arrays of coordinates', () => {
    const target = document.createElement('div')
    expect(pointers(touchmove(10, 20))).toEqual([[10, 20]])
    expect(pointers(touchmove(10, 20, target))).toEqual([[10, 20]])
  })

  it('pointers(touches) returns an array of arrays of coordinates', () => {
    expect(pointers([touch(10, 20)])).toEqual([[10, 20]])
  })
})
