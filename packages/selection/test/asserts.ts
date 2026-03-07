import { expect } from 'bun:test'
import { Selection } from '../src/selection/index.ts'
import { EnterNode } from '../src/selection/enter.ts'

export function assertSelection(actual: any, expected: any): void {
  let expectedGroups: any
  let expectedParents: any
  let expectedEnter: any
  let expectedExit: any

  if (expected instanceof Selection) {
    expectedGroups = expected._groups
    expectedParents = expected._parents
    expectedEnter = (expected as any)._enter
    expectedExit = (expected as any)._exit
  } else {
    expectedGroups = expected.groups
    expectedParents = expected.parents ?? Array.from(expectedGroups, () => null)
    expectedEnter = expected.enter
    expectedExit = expected.exit
  }

  expect(actual instanceof Selection).toBe(true)
  const actualGroups = actual._groups
  const actualParents = actual._parents
  const actualEnter = actual._enter
  const actualExit = actual._exit

  const ag = Array.from(actualGroups, (group: any) => Array.from(group))
  const eg = Array.from(expectedGroups, (group: any) => Array.from(group))

  expect(ag.length).toBe(eg.length)
  for (let i = 0; i < ag.length; i++) {
    expect(ag[i].length).toBe(eg[i].length)
    for (let j = 0; j < ag[i].length; j++) {
      const a = ag[i][j]
      const e = eg[i][j]
      if (a instanceof EnterNode || e instanceof EnterNode) {
        assertEnterNode(a, e)
      } else {
        expect(a).toBe(e)
      }
    }
  }
  const ap = Array.from(actualParents)
  expect(ap.length).toBe(expectedParents.length)
  for (let i = 0; i < ap.length; i++) {
    expect(ap[i]).toBe(expectedParents[i])
  }
  if (expectedEnter !== undefined || actualEnter !== undefined) {
    if (Array.isArray(actualEnter) && Array.isArray(expectedEnter)) {
      expect(actualEnter.length).toBe(expectedEnter.length)
      for (let i = 0; i < actualEnter.length; i++) {
        expect(actualEnter[i].length).toBe(expectedEnter[i].length)
        for (let j = 0; j < actualEnter[i].length; j++) {
          const a = actualEnter[i][j]
          const e = expectedEnter[i][j]
          if (a instanceof EnterNode || e instanceof EnterNode) {
            assertEnterNode(a, e)
          } else {
            expect(a).toBe(e)
          }
        }
      }
    } else {
      expect(actualEnter).toBe(expectedEnter)
    }
  }
  if (expectedExit !== undefined || actualExit !== undefined) {
    if (Array.isArray(actualExit) && Array.isArray(expectedExit)) {
      expect(actualExit.length).toBe(expectedExit.length)
      for (let i = 0; i < actualExit.length; i++) {
        expect(actualExit[i].length).toBe(expectedExit[i].length)
        for (let j = 0; j < actualExit[i].length; j++) {
          expect(actualExit[i][j]).toBe(expectedExit[i][j])
        }
      }
    } else {
      expect(actualExit).toBe(expectedExit)
    }
  }
}

function assertEnterNode(actual: any, expected: any): void {
  if (expected == null) {
    expect(actual).toBe(expected)
    return
  }
  expect(actual instanceof EnterNode).toBe(true)
  expect(actual.__data__).toBe(expected.__data__)
  expect(actual._parent).toBe(expected._parent)
  expect(actual._next).toBe(expected._next)
}

export function enterNode(parent: any, data: any, next: any = null): EnterNode {
  if (typeof parent === 'string') parent = document.querySelector(parent)
  if (typeof next === 'string') next = document.querySelector(next)
  const node = new EnterNode(parent, data)
  node._next = next
  return node
}
