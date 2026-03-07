import { describe, expect, it } from 'bun:test'
import { groupSort, ascending } from '../src/index.ts'

const data = [
  {name: 'jim',   amount: 34},
  {name: 'carl',  amount: 120},
  {name: 'stacy', amount: 12}
]

it('groupSort(data, reduce, key) returns sorted keys', () => {
  expect(groupSort(data, (v: any) => v.length, (d: any) => d.name)).toEqual(['carl', 'jim', 'stacy'])
})

it('groupSort(data, compare, key) returns sorted keys', () => {
  expect(groupSort(data, (a: any, b: any) => a.length - b.length, (d: any) => d.name)).toEqual(['carl', 'jim', 'stacy'])
})
