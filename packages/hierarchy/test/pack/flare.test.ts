import { describe, it, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { csvParse } from '@ts-charts/dsv'
import { stratify, pack, HierarchyNode } from '../../src/index.ts'

const dataDir = join(import.meta.dir, '..', 'data')

function round(x: number): number {
  return Math.round(x * 100) / 100
}

function test(inputFile: string, expectedFile: string) {
  return () => {
    const inputText = readFileSync(join(dataDir, inputFile), 'utf8')
    const expectedText = readFileSync(join(dataDir, expectedFile), 'utf8')

    const stratifier = stratify()
      .parentId((d: any) => {
        const i = d.id.lastIndexOf('.')
        return i >= 0 ? d.id.slice(0, i) : null
      })

    const packer = pack()
      .size([960, 960])

    const data = csvParse(inputText)
    const expected = JSON.parse(expectedText)

    const actual: any = packer(stratifier(data)
      .sum((d: any) => d.value)
      .sort((a: any, b: any) => b.value - a.value || a.data.id.localeCompare(b.data.id)))

    ;(function visit(node: any) {
      node.name = node.data.id.slice(node.data.id.lastIndexOf('.') + 1)
      node.x = round(node.x)
      node.y = round(node.y)
      node.r = round(node.r)
      delete node.id
      delete node.parent
      delete node.data
      delete node.depth
      delete node.height
      if (node.children) node.children.forEach(visit)
    })(actual)

    ;(function visit(node: any) {
      Object.setPrototypeOf(node, HierarchyNode.prototype)
      node.x = round(node.x)
      node.y = round(node.y)
      node.r = round(node.r)
      if (node.children) node.children.forEach(visit)
    })(expected)

    expect(actual).toEqual(expected)
  }
}

describe('pack(flare)', () => {
  it('produces the expected result', test('flare.csv', 'flare-pack.json'))
})
