import { describe, expect, it } from 'bun:test'
import { rollups } from '../src/index.ts'

const data = [
  {name: 'jim',   amount: '34.0',   date: '11/12/2015'},
  {name: 'carl',  amount: '120.11', date: '11/12/2015'},
  {name: 'stacy', amount: '12.01',  date: '01/04/2016'},
  {name: 'stacy', amount: '34.05',  date: '01/04/2016'}
]

it('rollups(data, reduce, accessor) returns the expected array', () => {
  expect(rollups(data, (v: any) => v.length, (d: any) => d.name)).toEqual([
    ['jim', 1],
    ['carl', 1],
    ['stacy', 2]
  ])
})
