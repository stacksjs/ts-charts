import { describe, it, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { csvParse } from '@ts-charts/dsv'
import { stratify, treemap, treemapSquarify, HierarchyNode } from '../../src/index.ts'

const dataDir = join(import.meta.dir, '..', 'data')

function round(x: number): number {
  return Math.round(x * 100) / 100
}

function test(inputFile: string, expectedFile: string, tile: any) {
  return () => {
    const inputText = readFileSync(join(dataDir, inputFile), 'utf8')
    const expectedText = readFileSync(join(dataDir, expectedFile), 'utf8')

    const stratifier = stratify()
      .parentId((d: any) => {
        const i = d.id.lastIndexOf('.')
        return i >= 0 ? d.id.slice(0, i) : null
      })

    const treemaper = treemap()
      .tile(tile)
      .size([960, 500])

    const data = csvParse(inputText)
    const expected = JSON.parse(expectedText)

    const actual: any = treemaper(stratifier(data)
      .sum((d: any) => d.value)
      .sort((a: any, b: any) => b.value - a.value || a.data.id.localeCompare(b.data.id)))

    ;(function visit(node: any) {
      node.name = node.data.id.slice(node.data.id.lastIndexOf('.') + 1)
      node.x0 = round(node.x0)
      node.y0 = round(node.y0)
      node.x1 = round(node.x1)
      node.y1 = round(node.y1)
      delete node.id
      delete node.parent
      delete node.data
      delete node._squarify
      delete node.height
      if (node.children) node.children.forEach(visit)
    })(actual)

    ;(function visit(node: any) {
      Object.setPrototypeOf(node, HierarchyNode.prototype)
      node.x0 = round(node.x)
      node.y0 = round(node.y)
      node.x1 = round(node.x + node.dx)
      node.y1 = round(node.y + node.dy)
      delete node.x
      delete node.y
      delete node.dx
      delete node.dy
      if (node.children) {
        node.children.reverse()
        node.children.forEach(visit)
      }
    })(expected)

    expect(actual).toEqual(expected)
  }
}

describe('treemap(flare)', () => {
  it('produces the expected result with a squarified ratio of phi', test('flare.csv', 'flare-phi.json', treemapSquarify))
  it('produces the expected result with a squarified ratio of 1', test('flare.csv', 'flare-one.json', treemapSquarify.ratio(1)))
})
